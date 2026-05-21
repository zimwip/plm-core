import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';
import { mkdir, readFile, rm } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import { tmpdir } from 'os';
import { cpus } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import initOcct from 'occt-import-js';
import {
  buildTypeIndex,
  splitArgs,
  findDefinitionalChain,
  collectForwardClosure,
  expandSRRClosure,
  precomputeNauoData,
  buildNauoExtractor,
} from './step-lib.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

// OCCT initialised once at startup; /convert waits on this promise
let _occt = null;
const _occtReady = initOcct({
  locateFile: (path) => join(__dirname, 'node_modules/occt-import-js/dist', path),
}).then(inst => { _occt = inst; console.log('OCCT ready'); })
  .catch(err => console.error('OCCT init failed:', err.message));

async function getOcct() {
  if (!_occt) await _occtReady;
  return _occt;
}

// Entity types retained during streaming for BOM + matrix extraction.
// Geometry / topology types are discarded on the fly, cutting peak memory ~85-95%
// for typical assembly STEP files where geometry dominates file size.
const KEEP_TYPES_PARSE = new Set([
  'PRODUCT',
  'PRODUCT_DEFINITION_FORMATION',
  'PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE',
  'PRODUCT_DEFINITION',
  'PRODUCT_DEFINITION_SHAPE',
  'NEXT_ASSEMBLY_USAGE_OCCURRENCE',
  'ASSEMBLY_COMPONENT_USAGE',
  'CONTEXT_DEPENDENT_SHAPE_REPRESENTATION',
  'SHAPE_DEFINITION_REPRESENTATION',
  'SHAPE_REPRESENTATION_RELATIONSHIP',
  'SHAPE_REPRESENTATION',
  'ADVANCED_BREP_SHAPE_REPRESENTATION',
  'GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION',
  'ITEM_DEFINED_TRANSFORMATION',
  'REPRESENTATION_MAP',
  'MAPPED_ITEM',
  'CARTESIAN_POINT',
  'DIRECTION',
  'AXIS2_PLACEMENT_3D',
]);

// /convert keeps memoryStorage (OCCT ReadStepFile needs a buffer).
// /parse and /split use diskStorage — files are streamed from disk, never fully decoded to a JS string.
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });
const uploadDisk = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => {
      const dir = join(tmpdir(), 'cad-upload');
      mkdir(dir, { recursive: true }).then(() => cb(null, dir)).catch(err => cb(err));
    },
    filename: (_req, file, cb) => {
      const ext = file.originalname.match(/(\.[^.]+)$/)?.[1] ?? '';
      cb(null, randomUUID() + ext);
    },
  }),
  limits: { fileSize: 500 * 1024 * 1024 },
});

// In-memory job store: jobId → { status, parts?, error?, dir? }
const splitJobs = new Map();
const JOB_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Minimum product count before spawning workers
const PARALLEL_THRESHOLD = 3;

const app = express();

app.get('/health', (_req, res) => res.json({ status: 'UP' }));

app.post('/parse', uploadDisk.single('file'), async (req, res) => {
  const format = (req.body?.format ?? 'STEP').toUpperCase();
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const filePath = req.file.path;
  try {
    let nodes;
    if (format === 'STEP') {
      nodes = await parseStepFromFile(filePath);
    } else if (format === 'CATIA_V5') {
      nodes = parseCatiaProduct(await readFile(filePath, 'utf8'));
    } else {
      return res.status(400).json({ error: `Unknown format: ${format}` });
    }
    res.json({ format, nodes });
  } catch (err) {
    res.status(422).json({ error: err.message });
  } finally {
    rm(filePath, { force: true }).catch(() => {});
  }
});

// POST /split — submits async job, returns 202 + jobId immediately
app.post('/split', uploadDisk.single('file'), (req, res) => {
  const format = (req.body?.format ?? 'STEP').toUpperCase();
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  if (format !== 'STEP') return res.status(422).json({ error: `Split not supported for format: ${format}` });

  const jobId  = randomUUID();
  const jobDir = join(tmpdir(), 'cad-split', jobId);
  splitJobs.set(jobId, { status: 'PENDING' });
  res.status(202).json({ jobId });

  const filePath = req.file.path;
  setImmediate(async () => {
    try {
      await mkdir(jobDir, { recursive: true });
      const partMeta = await splitStepFromFile(filePath, jobDir);
      splitJobs.set(jobId, { status: 'DONE', parts: partMeta, dir: jobDir });
      console.log(`Split job ${jobId} done: ${partMeta.length} parts`);
      setTimeout(() => {
        rm(jobDir, { recursive: true, force: true }).catch(() => {});
        splitJobs.delete(jobId);
      }, JOB_TTL_MS);
    } catch (err) {
      console.error(`Split job ${jobId} failed:`, err.message);
      splitJobs.set(jobId, { status: 'ERROR', error: err.message });
    } finally {
      rm(filePath, { force: true }).catch(() => {});
    }
  });
});

// GET /split/:jobId — poll job status + metadata (no file bytes)
app.get('/split/:jobId', (req, res) => {
  const job = splitJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status === 'PENDING') return res.json({ status: 'PENDING' });
  if (job.status === 'ERROR')   return res.status(422).json({ status: 'ERROR', error: job.error });
  res.json({ status: 'DONE', parts: job.parts });
});

// GET /split/:jobId/part/:index — stream part STEP file bytes
app.get('/split/:jobId/part/:index', (req, res) => {
  const job = splitJobs.get(req.params.jobId);
  if (!job)                    return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'DONE')   return res.status(409).json({ error: 'Job not ready' });

  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= job.parts.length) {
    return res.status(404).json({ error: 'Part index out of range' });
  }

  const partPath = join(job.dir, `part-${index}.stp`);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  createReadStream(partPath).pipe(res);
});

// POST /convert — STEP bytes → GLB binary (occt tessellate + minimal glTF serialiser)
app.post('/convert', upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  try {
    const occt = await getOcct();
    if (!occt) return res.status(503).json({ error: 'OCCT not ready' });

    const result = occt.ReadStepFile(new Uint8Array(req.file.buffer), null);
    if (!result?.success || !result.meshes?.length) {
      return res.status(422).json({ error: 'No geometry found' });
    }

    const meshes = result.meshes.map(m => ({
      positions: new Float32Array(m.attributes.position.array),
      normals:   m.attributes?.normal ? new Float32Array(m.attributes.normal.array) : null,
      indices:   m.index             ? new Uint32Array(m.index.array)               : null,
      color:     m.color ?? null,
    }));

    const glb = buildGlb(meshes);
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Length', glb.length);
    res.send(glb);
    console.log(`/convert: ${meshes.length} mesh(es), ${(glb.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error('/convert error:', err.message);
    res.status(422).json({ error: err.message });
  }
});

app.listen(8090, () => console.log('cad-parser listening on :8090'));

// ---------------------------------------------------------------------------
// Streaming STEP entity reader
//
// Pipes the file through a comment-aware ';'-split state machine.
// Calls onHeader(string) once after the HEADER section, then onEntity(string)
// for each raw entity segment in the DATA section (text before the ';').
// Handles /* ... */ comments spanning chunk boundaries correctly.
// ---------------------------------------------------------------------------
async function streamEntities(filePath, { onHeader, onEntity }) {
  return new Promise((resolve, reject) => {
    const rs = createReadStream(filePath, { encoding: 'utf8', highWaterMark: 64 * 1024 });
    let buf = '';
    let partial = '';
    let inComment = false;
    let inHeader = false;
    let inData = false;
    const headerLines = [];

    function segment(seg) {
      const t = seg.trim();
      if (!t) return;
      if (t === 'HEADER') { inHeader = true; return; }
      if (t === 'DATA') {
        if (onHeader) onHeader(headerLines.length
          ? `HEADER;\n${headerLines.join('\n')}\nENDSEC;`
          : 'HEADER;\nENDSEC;');
        inHeader = false; inData = true; return;
      }
      if (t === 'ENDSEC') { inHeader = false; inData = false; return; }
      if (inHeader) { headerLines.push(t + ';'); return; }
      if (inData) onEntity(t);
    }

    function processChunk(chunk) {
      buf += chunk;
      for (;;) {
        if (inComment) {
          const end = buf.indexOf('*/');
          if (end === -1) return;
          buf = buf.slice(end + 2);
          inComment = false;
        }
        const cp = buf.indexOf('/*');
        const sp = buf.indexOf(';');
        if (cp !== -1 && (sp === -1 || cp < sp)) {
          partial += buf.slice(0, cp).replace(/\r?\n/g, ' ');
          buf = buf.slice(cp + 2);
          inComment = true;
        } else if (sp !== -1) {
          segment(partial + buf.slice(0, sp).replace(/\r?\n/g, ' '));
          partial = '';
          buf = buf.slice(sp + 1);
        } else {
          partial += buf.replace(/\r?\n/g, ' ');
          buf = '';
          return;
        }
      }
    }

    rs.on('data', processChunk);
    rs.on('end', () => { if (partial.trim()) segment(partial.trim()); resolve(); });
    rs.on('error', reject);
  });
}

// ---------------------------------------------------------------------------
// Streaming STEP BOM parser (/parse)
//
// Streams the file once, discarding geometry/topology entity text on the fly.
// Only KEEP_TYPES_PARSE entities + compound SRR entities are kept in memory.
// Builds a sparse entityMap, then runs standard BOM resolution on it.
// ---------------------------------------------------------------------------
async function parseStepFromFile(filePath) {
  const entityMap = {};

  await streamEntities(filePath, {
    onEntity: seg => {
      const tm = seg.match(/^#(\d+)\s*=\s*([A-Z_][A-Z0-9_]*)\s*\(/);
      if (tm) {
        if (KEEP_TYPES_PARSE.has(tm[2])) entityMap[tm[1]] = seg + ';';
      } else if (/^#\d+\s*=\s*\(.*REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION/.test(seg)) {
        entityMap[seg.match(/^#(\d+)/)[1]] = seg + ';';
      }
    }
  });

  const sparseData = Object.values(entityMap).join('\n');
  return parseBOM(buildTypeIndex(sparseData), sparseData);
}

// ---------------------------------------------------------------------------
// BOM resolution — shared by parseStepFromFile (streaming) and parseStep (string)
// ---------------------------------------------------------------------------
function parseBOM(typeIdx, data) {
  const byType = typeName => typeIdx[typeName] ?? {};
  const str = s => { const m = s?.match(/^'(.*)'$/s); return m ? m[1] : (s ?? '').trim(); };
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  const products = {};
  for (const [id, args] of Object.entries(byType('PRODUCT'))) {
    const p = splitArgs(args);
    products[id] = { partNumber: str(p[0]), name: str(p[1]), description: str(p[2] ?? '') };
  }

  const formations = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const p = splitArgs(args);
    const pid = ref(p[2]);
    if (pid) formations[id] = { revision: str(p[0]), productId: pid };
  }

  const prodDefs = {};
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(splitArgs(args)[2]);
    if (fid && formations[fid]) prodDefs[id] = formations[fid].productId;
  }

  const nauoEntities = {
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  };
  const occurrencesOf = {};
  for (const [nauoId, args] of Object.entries(nauoEntities)) {
    const p = splitArgs(args);
    const par = ref(p[3]), chi = ref(p[4]);
    if (par && chi && prodDefs[par] && prodDefs[chi]) {
      (occurrencesOf[prodDefs[chi]] ??= []).push({ parentProductId: prodDefs[par], nauoId });
    }
  }

  if (!Object.keys(products).length) throw new Error('No PRODUCT entities found — may not be an assembly STEP file');

  const getMatrixForNauo = buildNauoExtractor(precomputeNauoData(new Set(Object.keys(nauoEntities)), typeIdx, data));

  const idMap = {};
  const nodes = Object.entries(products).map(([stepId, prod]) => {
    const id = randomUUID();
    idMap[stepId] = id;
    return { _s: stepId, id, name: prod.name || prod.partNumber || `Part-${stepId}`,
             type: 'PART',
             attributes: Object.fromEntries(
               [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
             ) };
  });

  const hasChildren = new Set();
  for (const n of nodes) {
    const occs = occurrencesOf[n._s];
    if (occs?.length) {
      n.occurrences = occs.map(occ => {
        const parentId = idMap[occ.parentProductId] ?? null;
        if (parentId) hasChildren.add(parentId);
        return { parentId, positionMatrix: getMatrixForNauo(occ.nauoId) };
      }).filter(o => o.parentId !== null);
    } else {
      n.occurrences = [];
    }
    delete n._s;
  }
  for (const n of nodes) n.type = hasChildren.has(n.id) ? 'ASSEMBLY' : 'PART';
  return nodes;
}

// Legacy full-string entry point (kept for internal/test callers)
function parseStep(content) {
  const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
  if (!dataMatch) throw new Error('No DATA section in STEP file');
  const data = dataMatch[1].replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\r?\n\s*/g, ' ');
  return parseBOM(buildTypeIndex(data), data);
}

// ---------------------------------------------------------------------------
// CATIA V5 CATProduct — XML parse (unchanged)
// ---------------------------------------------------------------------------
function parseCatiaProduct(xml) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  let doc;
  try { doc = parser.parse(xml); } catch (e) { throw new Error(`Invalid CATProduct XML: ${e.message}`); }
  const nodes = [];
  walkXml(doc, null, nodes);
  if (!nodes.length) nodes.push({ id: randomUUID(), name: 'Unknown', type: 'PART', occurrences: [], attributes: {} });
  return nodes;
}

const CAT_TAGS = new Set(['Node', 'ProductInstance', 'Reference3D', 'Product', 'PRODUCTSTRUCTURE']);

function walkXml(el, parentId, out) {
  if (typeof el !== 'object' || el === null) return;
  for (const [tag, value] of Object.entries(el)) {
    if (tag.startsWith('@_') || tag === '#text') continue;
    const items = Array.isArray(value) ? value : [value];
    for (const child of items) {
      if (typeof child !== 'object') continue;
      if (CAT_TAGS.has(tag)) {
        const id       = child['@_id'] ?? randomUUID();
        const name     = child['@_NodeName'] ?? child['@_PartNumber'] ?? child['@_name'] ?? tag;
        const revision = child['@_Revision'] ?? child['@_revision'] ?? '';
        const desc     = child['@_DescriptionRef'] ?? child['@_description'] ?? '';
        const childKeys = Object.keys(child).filter(k => !k.startsWith('@_') && k !== '#text');
        const hasKids   = childKeys.some(k => CAT_TAGS.has(k));
        out.push({ id, name, type: hasKids ? 'ASSEMBLY' : 'PART',
                   occurrences: parentId ? [{ parentId, positionMatrix: null }] : [],
                   attributes: Object.fromEntries([['revision', revision], ['description', desc]].filter(([, v]) => v)) });
        walkXml(child, id, out);
      } else {
        walkXml({ [tag]: child }, parentId, out);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Two-pass streaming STEP splitter (/split)
//
// Pass 1 — stream file once:
//   Build full refGraph + reverseRefGraph for ALL entities (no geometry text stored).
//   Store entity text only for KEEP_TYPES_PARSE + compound SRR entities.
//   Compute BOM structures, closures (sequential or via workers), renumber maps.
//
// Pass 2 — stream file once:
//   For each entity in any product closure: write renumbered text to that product's
//   output file. Never holds all entity text in memory simultaneously.
// ---------------------------------------------------------------------------
async function splitStepFromFile(filePath, jobDir) {
  // ── Pass 1: build reference graphs + sparse BOM data ─────────────────────
  const refGraph = {};
  const reverseRefGraph = {};
  const entityType = {};     // id → type (all entities)
  const typeEntityMap = {};  // id → text (BOM/matrix types only)
  let headerSection = 'HEADER;\nENDSEC;';

  await streamEntities(filePath, {
    onHeader: h => { headerSection = h; },
    onEntity: seg => {
      const idMatch = seg.match(/^#(\d+)\s*=/);
      if (!idMatch) return;
      const id = idMatch[1];

      const tm = seg.match(/^#\d+\s*=\s*([A-Z_][A-Z0-9_]*)\s*\(/);
      const type = tm ? tm[1] : '_COMPOUND_';
      entityType[id] = type;

      // Build reference graph for ALL entities (geometry included)
      const body = seg.slice(seg.indexOf('=') + 1);
      refGraph[id] ??= new Set();
      const refRe = /#(\d+)/g; let m;
      while ((m = refRe.exec(body)) !== null) {
        refGraph[id].add(m[1]);
        (reverseRefGraph[m[1]] ??= new Set()).add(id);
      }

      // Store entity text only for BOM/matrix types + compound representation relationships
      if (KEEP_TYPES_PARSE.has(type)) {
        typeEntityMap[id] = seg + ';';
      } else if (type === '_COMPOUND_' && seg.includes('REPRESENTATION_RELATIONSHIP')) {
        typeEntityMap[id] = seg + ';';
        if (seg.includes('SHAPE_REPRESENTATION_RELATIONSHIP')) entityType[id] = 'SHAPE_REPRESENTATION_RELATIONSHIP';
      }
    }
  });

  // ── BOM resolution from sparse typeEntityMap ─────────────────────────────
  const sparseData = Object.values(typeEntityMap).join('\n');
  const typeIdx = buildTypeIndex(sparseData);
  const byType = typeName => typeIdx[typeName] ?? {};

  const str = s => { const m = s?.match(/^'(.*)'$/s); return m ? m[1] : (s ?? '').trim(); };
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  const products = {};
  for (const [id, args] of Object.entries(byType('PRODUCT'))) {
    const p = splitArgs(args);
    products[id] = { partNumber: str(p[0]), name: str(p[1]), description: str(p[2] ?? '') };
  }
  const formations = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const p = splitArgs(args);
    const pid = ref(p[2]);
    if (pid) formations[id] = { productId: pid };
  }
  const prodDefs = {};
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(splitArgs(args)[2]);
    if (fid && formations[fid]) prodDefs[id] = formations[fid].productId;
  }
  const nauoEntities = {
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  };
  const occurrencesOf = {};
  for (const [nauoId, args] of Object.entries(nauoEntities)) {
    const p = splitArgs(args);
    const par = ref(p[3]), chi = ref(p[4]);
    if (par && chi && prodDefs[par] && prodDefs[chi]) {
      (occurrencesOf[prodDefs[chi]] ??= []).push({ parentProductId: prodDefs[par], nauoId });
    }
  }

  if (!Object.keys(products).length) throw new Error('No PRODUCT entities found — may not be an assembly STEP file');

  const hasChildren    = new Set(Object.values(occurrencesOf).flat().map(o => o.parentProductId));
  const productStepIds = new Set(Object.keys(products));
  const idMap = {};
  for (const stepId of Object.keys(products)) idMap[stepId] = randomUUID();

  const prodDefsByProductId = new Map();
  for (const [pdId, productId] of Object.entries(prodDefs)) {
    let s = prodDefsByProductId.get(productId);
    if (!s) { s = new Set(); prodDefsByProductId.set(productId, s); }
    s.add(pdId);
  }

  const pdsToPdId = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const pdId = ref(splitArgs(args)[2]);
    if (pdId) pdsToPdId[pdsId] = pdId;
  }
  const srToProductId = {};
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = splitArgs(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (!pdsId || !srId) continue;
    const pdId = pdsToPdId[pdsId];
    const productId = pdId ? prodDefs[pdId] : null;
    if (productId) srToProductId[srId] = productId;
  }
  const allEntrySRIds = new Set(Object.keys(srToProductId));

  // reverseFromSRR built from entityType map (no need to scan entity text)
  const reverseFromSRR = {};
  for (const [id, t] of Object.entries(entityType)) {
    if (t !== 'SHAPE_REPRESENTATION_RELATIONSHIP') continue;
    for (const refId of (refGraph[id] ?? [])) {
      (reverseFromSRR[refId] ??= new Set()).add(id);
    }
  }

  const nauoData = precomputeNauoData(new Set(Object.keys(nauoEntities)), typeIdx, sparseData);
  const productEntries = Object.entries(products);

  // ── Closure computation ───────────────────────────────────────────────────
  // Workers compute closures only; main thread does pass 2 reconstruction.
  let allParts; // [{ stepId, closureArr, nodeId, name, cadType, occurrences, attributes }]

  function computeClosures(batch) {
    const getMatrixForNauo = buildNauoExtractor(nauoData);
    return batch.map(([stepId, prod]) => {
      const chain   = findDefinitionalChain(stepId, reverseRefGraph, refGraph, productStepIds, prodDefs, prodDefsByProductId);
      const closure = collectForwardClosure(chain, refGraph);
      expandSRRClosure(closure, reverseFromSRR, refGraph, reverseRefGraph, allEntrySRIds, srToProductId, stepId);
      return {
        stepId,
        closureArr: [...closure],
        nodeId:   idMap[stepId],
        name:     prod.name || prod.partNumber || `Part-${stepId}`,
        cadType:  hasChildren.has(stepId) ? 'ASSEMBLY' : 'PART',
        occurrences: (occurrencesOf[stepId] ?? [])
          .map(occ => ({ parentId: idMap[occ.parentProductId] ?? null, positionMatrix: getMatrixForNauo(occ.nauoId) }))
          .filter(o => o.parentId !== null),
        attributes: Object.fromEntries(
          [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
        ),
      };
    });
  }

  if (productEntries.length < PARALLEL_THRESHOLD) {
    allParts = computeClosures(productEntries);
  } else {
    const refGraphArr = {};
    for (const [id, s] of Object.entries(refGraph))        refGraphArr[id]        = [...s];
    const reverseRefGraphArr = {};
    for (const [id, s] of Object.entries(reverseRefGraph)) reverseRefGraphArr[id] = [...s];
    const reverseFromSRRArr = {};
    for (const [id, s] of Object.entries(reverseFromSRR))  reverseFromSRRArr[id]  = [...s];
    const prodDefsByProductIdArr = [...prodDefsByProductId.entries()].map(([k, s]) => [k, [...s]]);

    const sharedData = {
      refGraphArr, reverseRefGraphArr, reverseFromSRRArr,
      prodDefsByProductIdArr,
      productStepIdsArr: [...productStepIds],
      allEntrySRIdsArr:  [...allEntrySRIds],
      prodDefs, srToProductId, nauoData, idMap, occurrencesOf,
      hasChildrenArr: [...hasChildren],
    };

    const numWorkers = Math.min(cpus().length, productEntries.length);
    const chunkSize  = Math.ceil(productEntries.length / numWorkers);
    const workerUrl  = new URL('./worker-split.js', import.meta.url);
    const chunks = [];
    for (let i = 0; i < productEntries.length; i += chunkSize) chunks.push(productEntries.slice(i, i + chunkSize));

    console.log(`Split: ${productEntries.length} products → ${chunks.length} workers`);

    const batches = await Promise.all(
      chunks.map(chunk => new Promise((resolve, reject) => {
        const worker = new Worker(workerUrl, {
          workerData: { ...sharedData, products: chunk.map(([stepId, prod]) => ({ stepId, prod })) },
        });
        worker.once('message', resolve);
        worker.once('error',   reject);
        worker.once('exit', code => { if (code !== 0) reject(new Error(`Worker exited with code ${code}`)); });
      }))
    );
    allParts = batches.flat();
  }

  // ── Build entity→part index and renumber maps ─────────────────────────────
  const entityToPartIndices = new Map(); // entityId → Set<partIndex>
  allParts.forEach((part, idx) => {
    for (const entityId of part.closureArr) {
      let s = entityToPartIndices.get(entityId);
      if (!s) { s = new Set(); entityToPartIndices.set(entityId, s); }
      s.add(idx);
    }
  });

  const renumberMaps = allParts.map(part => {
    const sorted = part.closureArr
      .filter(id => entityType[id])
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10));
    const rmap = new Map();
    sorted.forEach((oldId, i) => rmap.set(oldId, String(i + 1)));
    return rmap;
  });

  // ── Pass 2: streaming write ───────────────────────────────────────────────
  const partStreams = allParts.map((_, i) => createWriteStream(join(jobDir, `part-${i}.stp`)));
  for (const ws of partStreams) ws.write(`ISO-10303-21;\n${headerSection}\nDATA;\n`);

  await streamEntities(filePath, {
    onEntity: seg => {
      const idMatch = seg.match(/^#(\d+)\s*=/);
      if (!idMatch) return;
      const partIndices = entityToPartIndices.get(idMatch[1]);
      if (!partIndices) return;
      for (const idx of partIndices) {
        const rmap = renumberMaps[idx];
        partStreams[idx].write(
          seg.replace(/#(\d+)/g, (_, refId) => '#' + (rmap.get(refId) ?? refId)) + ';\n'
        );
      }
    }
  });

  await Promise.all(partStreams.map(ws => new Promise((res, rej) => {
    ws.write('ENDSEC;\nEND-ISO-10303-21;\n');
    ws.end(err => err ? rej(err) : res());
  })));

  // Strip internal-only fields before returning metadata
  return allParts.map(({ stepId: _s, closureArr: _c, ...meta }) => meta);
}

// ---------------------------------------------------------------------------
// GLB serialiser (unchanged)
// ---------------------------------------------------------------------------
function buildGlb(meshes) {
  function align4(n) { return (n + 3) & ~3; }

  const bufParts   = [];
  const bufferViews = [];
  const accessors  = [];
  const gltfMeshes = [];
  const materials  = [];
  let byteOffset   = 0;

  function pushBytes(typedArray) {
    const bytes = new Uint8Array(typedArray.buffer, typedArray.byteOffset, typedArray.byteLength);
    bufParts.push(bytes);
    byteOffset += bytes.byteLength;
  }

  function padTo4() {
    const r = byteOffset % 4;
    if (r === 0) return;
    const pad = new Uint8Array(4 - r);
    bufParts.push(pad);
    byteOffset += pad.byteLength;
  }

  for (let mi = 0; mi < meshes.length; mi++) {
    const { positions, normals, indices, color } = meshes[mi];
    const vertCount = positions.length / 3;
    const primAttrs = {};

    let minX = Infinity, minY = Infinity, minZ = Infinity;
    let maxX = -Infinity, maxY = -Infinity, maxZ = -Infinity;
    for (let i = 0; i < positions.length; i += 3) {
      if (positions[i]   < minX) minX = positions[i];   if (positions[i]   > maxX) maxX = positions[i];
      if (positions[i+1] < minY) minY = positions[i+1]; if (positions[i+1] > maxY) maxY = positions[i+1];
      if (positions[i+2] < minZ) minZ = positions[i+2]; if (positions[i+2] > maxZ) maxZ = positions[i+2];
    }
    const posView = bufferViews.length;
    bufferViews.push({ buffer: 0, byteOffset, byteLength: positions.byteLength, target: 34962 });
    pushBytes(positions);
    primAttrs.POSITION = accessors.length;
    accessors.push({ bufferView: posView, byteOffset: 0, componentType: 5126, count: vertCount, type: 'VEC3',
                     min: [minX, minY, minZ], max: [maxX, maxY, maxZ] });

    if (normals) {
      const normView = bufferViews.length;
      bufferViews.push({ buffer: 0, byteOffset, byteLength: normals.byteLength, target: 34962 });
      pushBytes(normals);
      primAttrs.NORMAL = accessors.length;
      accessors.push({ bufferView: normView, byteOffset: 0, componentType: 5126, count: vertCount, type: 'VEC3' });
    }

    const primitive = { attributes: primAttrs, mode: 4 };
    if (indices) {
      padTo4();
      const idxView = bufferViews.length;
      bufferViews.push({ buffer: 0, byteOffset, byteLength: indices.byteLength, target: 34963 });
      pushBytes(indices);
      primitive.indices = accessors.length;
      accessors.push({ bufferView: idxView, byteOffset: 0, componentType: 5125, count: indices.length, type: 'SCALAR' });
    }

    const r = color ? color[0] : 0.357, g = color ? color[1] : 0.608, b = color ? color[2] : 0.965;
    primitive.material = materials.length;
    materials.push({ pbrMetallicRoughness: { baseColorFactor: [r, g, b, 1.0], metallicFactor: 0.1, roughnessFactor: 0.8 }, doubleSided: true });
    gltfMeshes.push({ primitives: [primitive] });
  }

  const totalBin = align4(byteOffset);
  const binBuf   = Buffer.alloc(totalBin, 0);
  let off = 0;
  for (const part of bufParts) { binBuf.set(part, off); off += part.byteLength; }

  const gltf = {
    asset: { version: '2.0', generator: 'cad-parser/occt-import-js' },
    scene: 0,
    scenes: [{ nodes: gltfMeshes.map((_, i) => i) }],
    nodes:  gltfMeshes.map((_, i) => ({ mesh: i })),
    meshes: gltfMeshes, materials, accessors, bufferViews,
    buffers: [{ byteLength: totalBin }],
  };
  const jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = Buffer.alloc(align4(jsonBuf.length), 0x20);
  jsonBuf.copy(jsonPad);

  const totalLen = 12 + 8 + jsonPad.length + 8 + binBuf.length;
  const header = Buffer.alloc(12);
  header.writeUInt32LE(0x46546C67, 0); // "glTF"
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(totalLen, 8);

  const jsonChunkHdr = Buffer.alloc(8);
  jsonChunkHdr.writeUInt32LE(jsonPad.length, 0);
  jsonChunkHdr.writeUInt32LE(0x4E4F534A, 4); // "JSON"

  const binChunkHdr = Buffer.alloc(8);
  binChunkHdr.writeUInt32LE(binBuf.length, 0);
  binChunkHdr.writeUInt32LE(0x004E4942, 4); // "BIN\0"

  return Buffer.concat([header, jsonChunkHdr, jsonPad, binChunkHdr, binBuf]);
}
