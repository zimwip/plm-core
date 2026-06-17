import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';
import { mkdir, open, readFile, rm } from 'fs/promises';
import { createReadStream } from 'fs';
import { cpus, tmpdir } from 'os';
import { join } from 'path';
import { Worker } from 'worker_threads';
import {
  buildTypeIndex,
  splitArgs,
  findDefinitionalChain,
  collectForwardClosure,
  expandSRRClosure,
  precomputeNauoData,
  buildNauoExtractor,
} from './step-lib.js';
import { scanStep, readEntitiesAt } from './step-scan.js';
import { writeParts } from './worker-split.js';
import { ConvertPool } from './convert-pool.js';

// OCCT runs in a pool of worker threads — each ReadStepFile is a synchronous
// single-threaded WASM call, so the pool both keeps the event loop free and
// converts independent parts in parallel. Size capped (each worker holds its
// own OCCT/WASM instance — memory-heavy). Override with CONVERT_POOL_SIZE.
const CONVERT_POOL_SIZE = Math.max(
  1, Math.min(cpus().length, Number(process.env.CONVERT_POOL_SIZE) || 4),
);
const convertPool = new ConvertPool(CONVERT_POOL_SIZE);

// Structural BOM / assembly types — kept as text during streaming.
// Geometry / topology types are discarded on the fly, cutting peak memory ~85-95%
// for typical assembly STEP files where geometry dominates file size.
const KEEP_STRUCT = new Set([
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
]);

// Geometry types needed only for assembly-transform matrices. NOT kept as text —
// only their byte offsets are indexed; the few actually referenced by the
// assembly transforms are fetched on demand (see resolveAssemblyGeometry).
// A complex part holds millions of these; keeping them all was the bottleneck.
const KEEP_GEOM = new Set([
  'CARTESIAN_POINT',
  'DIRECTION',
  'AXIS2_PLACEMENT_3D',
]);

// All endpoints use diskStorage — uploads are streamed to disk, never fully buffered
// in memory. /parse and /split scan from disk; /convert reads the file once for OCCT.
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

// Above this entity count, /split reconstructs part files in parallel workers.
const PARALLEL_PASS2_THRESHOLD = 200_000;

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

// GET /split/:jobId/part/:index/glb — convert one split part to GLB.
// Hit this concurrently for every part to convert an assembly in parallel:
// the OCCT worker pool runs up to CONVERT_POOL_SIZE conversions at once.
app.get('/split/:jobId/part/:index/glb', async (req, res) => {
  const job = splitJobs.get(req.params.jobId);
  if (!job)                  return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'DONE') return res.status(409).json({ error: 'Job not ready' });

  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= job.parts.length) {
    return res.status(404).json({ error: 'Part index out of range' });
  }
  try {
    const stepBytes = await readFile(join(job.dir, `part-${index}.stp`));
    const { glb, meshCount } = await convertPool.run(stepBytes);
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Length', glb.length);
    res.send(glb);
    console.log(`/split part/${index}/glb: ${meshCount} mesh(es), ${(glb.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// POST /convert — STEP bytes → GLB binary (OCCT tessellation, in a worker)
// diskStorage like /parse and /split: the upload is streamed to disk, read once for
// OCCT (which needs a contiguous buffer), then removed. Avoids multer's 500 MB
// in-memory retention per request.
app.post('/convert', uploadDisk.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  const filePath = req.file.path;
  try {
    const stepBuf = await readFile(filePath);
    const { glb, meshCount } = await convertPool.run(stepBuf);
    res.setHeader('Content-Type', 'model/gltf-binary');
    res.setHeader('Content-Length', glb.length);
    res.send(glb);
    console.log(`/convert: ${meshCount} mesh(es), ${(glb.length / 1024).toFixed(1)} KB`);
  } catch (err) {
    console.error('/convert error:', err.message);
    res.status(422).json({ error: err.message });
  } finally {
    rm(filePath, { force: true }).catch(() => {});
  }
});

app.listen(8090, () => console.log('cad-parser listening on :8090'));

// ---------------------------------------------------------------------------
// Streaming STEP BOM parser (/parse)
//
// Streams the file once via scanStep. Keeps text only for structural BOM types;
// for geometry types it indexes byte offsets only. After BOM resolution, the
// handful of geometry entities reached by assembly transforms are fetched on
// demand. The bulk of a CAD file (millions of geometry points) is never parsed.
// ---------------------------------------------------------------------------
async function parseStepFromFile(filePath) {
  const structMap = {};           // id → text (structural BOM types + compound SRR)
  const geomOffsets = new Map();  // id → { offset, length } (KEEP_GEOM types)

  await scanStep(filePath, {
    onEntity: ({ id, type, text, offset, length }) => {
      if (!id) return;
      if (KEEP_GEOM.has(type)) {
        geomOffsets.set(id, { offset, length });
      } else if (KEEP_STRUCT.has(type)) {
        structMap[id] = text + ';';
      } else if (type === '_COMPOUND_'
                 && /^#\d+\s*=\s*\(.*REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION/.test(text)) {
        structMap[id] = text + ';';
      }
    }
  });

  const structData = Object.values(structMap).join('\n');
  const typeIdx = buildTypeIndex(structData);
  await resolveAssemblyGeometry(filePath, structMap, geomOffsets, typeIdx);
  return parseBOM(typeIdx, structData);
}

// ---------------------------------------------------------------------------
// Geometry-on-demand resolver
//
// The assembly-transform matrices need only AXIS2_PLACEMENT_3D / CARTESIAN_POINT
// / DIRECTION entities reachable from the structural entities — a few hundred,
// versus millions in the file. This walks #refs out of the structural text,
// fetches the referenced geometry by byte offset (pread), follows geometry→
// geometry refs to fixpoint, and merges the result into typeIdx.
// ---------------------------------------------------------------------------
async function resolveAssemblyGeometry(filePath, structMap, geomOffsets, typeIdx) {
  const needed = new Set();
  let wave = [];
  const collectRefs = texts => {
    const re = /#(\d+)/g;
    for (const text of texts) {
      let m;
      while ((m = re.exec(text)) !== null) {
        const id = m[1];
        if (geomOffsets.has(id) && !needed.has(id)) { needed.add(id); wave.push(id); }
      }
    }
  };
  collectRefs(Object.values(structMap));

  const fetched = [];
  while (wave.length) {
    const ranges = wave.map(id => geomOffsets.get(id)).sort((a, b) => a.offset - b.offset);
    wave = [];
    const waveTexts = [];
    await readEntitiesAt(filePath, ranges, raw => {
      const t = raw.toString('utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '').replace(/\r?\n/g, ' ').slice(0, -1).trim();
      fetched.push(t + ';');
      waveTexts.push(t);
    });
    collectRefs(waveTexts);
  }

  if (!fetched.length) return;
  const geomIdx = buildTypeIndex(fetched.join('\n'));
  for (const type of KEEP_GEOM) {
    if (geomIdx[type]) typeIdx[type] = Object.assign(typeIdx[type] ?? {}, geomIdx[type]);
  }
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

// Reads the whole file into a SharedArrayBuffer so /split workers can slice
// entity bytes from it zero-copy (no per-worker file I/O, no graph clone).
async function readFileToShared(filePath) {
  const fh = await open(filePath, 'r');
  try {
    const { size } = await fh.stat();
    const sab = new SharedArrayBuffer(size);
    const view = Buffer.from(sab);
    let pos = 0;
    while (pos < size) {
      const { bytesRead } = await fh.read(view, pos, size - pos, pos);
      if (bytesRead === 0) break;
      pos += bytesRead;
    }
    return sab;
  } finally {
    await fh.close();
  }
}

// ---------------------------------------------------------------------------
// Two-pass streaming STEP splitter (/split)
//
// Pass 1 — scanStep streams the file once:
//   Build the STEP index — `entities`: id → { type, offset, length } for ALL
//   entities — plus refGraph + reverseRefGraph. Store entity text only for
//   structural BOM types; geometry types are indexed by offset only. Compute
//   BOM structures and per-product closures.
//
// Pass 2 — per-part reconstruction (worker-parallel for large files):
//   Each part's closure becomes a compact byte-range table. Workers stream the
//   file, read their parts' entities by offset, renumber, and write the part
//   files. Tables transfer zero-copy; the entity graph is never cloned.
// ---------------------------------------------------------------------------
async function splitStepFromFile(filePath, jobDir) {
  // ── Pass 1: build the STEP index (entity offsets + reference graphs) ──────
  const refGraph = {};
  const reverseRefGraph = {};
  const entities = new Map();    // id → { type, offset, length } (all entities)
  const typeEntityMap = {};      // id → text (structural BOM types only)
  const geomOffsets = new Map(); // id → { offset, length } (KEEP_GEOM types)
  let headerSection = 'HEADER;\nENDSEC;';

  await scanStep(filePath, {
    onHeader: h => { headerSection = h; },
    onEntity: ({ id, type, text, offset, length }) => {
      if (!id) return;
      entities.set(id, { type, offset, length });
      if (KEEP_GEOM.has(type)) geomOffsets.set(id, { offset, length });

      // Build reference graph for ALL entities (geometry included)
      const body = text.slice(text.indexOf('=') + 1);
      refGraph[id] ??= new Set();
      const refRe = /#(\d+)/g; let m;
      while ((m = refRe.exec(body)) !== null) {
        refGraph[id].add(m[1]);
        (reverseRefGraph[m[1]] ??= new Set()).add(id);
      }

      // Store entity text only for structural types + compound representation relationships
      if (KEEP_STRUCT.has(type)) {
        typeEntityMap[id] = text + ';';
      } else if (type === '_COMPOUND_' && text.includes('REPRESENTATION_RELATIONSHIP')) {
        typeEntityMap[id] = text + ';';
        if (text.includes('SHAPE_REPRESENTATION_RELATIONSHIP')) {
          entities.get(id).type = 'SHAPE_REPRESENTATION_RELATIONSHIP';
        }
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

  // reverseFromSRR built from the entity index (no need to scan entity text)
  const reverseFromSRR = {};
  for (const [id, e] of entities) {
    if (e.type !== 'SHAPE_REPRESENTATION_RELATIONSHIP') continue;
    for (const refId of (refGraph[id] ?? [])) {
      (reverseFromSRR[refId] ??= new Set()).add(id);
    }
  }

  // Fetch the geometry actually referenced by assembly transforms into typeIdx.
  await resolveAssemblyGeometry(filePath, typeEntityMap, geomOffsets, typeIdx);
  const nauoData = precomputeNauoData(new Set(Object.keys(nauoEntities)), typeIdx, sparseData);
  const productEntries = Object.entries(products);

  // ── Closure computation (per product, on the main thread) ─────────────────
  const getMatrixForNauo = buildNauoExtractor(nauoData);
  const allParts = productEntries.map(([stepId, prod]) => {
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

  // ── Pass 2: per-part reconstruction ───────────────────────────────────────
  // Each part is an independent output file, built by copying its closure's raw
  // entity bytes from the source. Each part's byte-range table (offset / length
  // as Float64Arrays) is transferred to a worker zero-copy via transferList;
  // the source file is shared through a SharedArrayBuffer. The entity graph is
  // never structured-cloned. Small inputs are reconstructed inline.
  const partJobs = allParts.map((part, partIndex) => {
    const offs = [], lens = [];
    for (const id of part.closureArr) {
      const e = entities.get(id);
      if (e) { offs.push(e.offset); lens.push(e.length); }
    }
    return {
      partIndex,
      count:  offs.length,
      offArr: Float64Array.from(offs),
      lenArr: Float64Array.from(lens),
    };
  });

  if (entities.size < PARALLEL_PASS2_THRESHOLD || partJobs.length < 2) {
    await writeParts(await readFile(filePath), jobDir, headerSection, partJobs);
  } else {
    // Load the source file into shared memory — workers copy entities zero-copy.
    const sab = await readFileToShared(filePath);
    // Distribute parts across workers, greedily by size for balanced load.
    const numWorkers = Math.min(cpus().length, partJobs.length);
    const buckets = Array.from({ length: numWorkers }, () => ({ load: 0, parts: [] }));
    for (const job of [...partJobs].sort((a, b) => b.count - a.count)) {
      const bucket = buckets.reduce((min, b) => (b.load < min.load ? b : min));
      bucket.parts.push(job);
      bucket.load += job.count;
    }
    const workerUrl = new URL('./worker-split.js', import.meta.url);
    console.log(`Split: ${partJobs.length} parts → ${numWorkers} workers`);
    await Promise.all(buckets.filter(b => b.parts.length).map(b => new Promise((resolve, reject) => {
      const transfer = b.parts.flatMap(p => [p.offArr.buffer, p.lenArr.buffer]);
      const worker = new Worker(workerUrl, {
        workerData: { sab, jobDir, headerSection, parts: b.parts },
        transferList: transfer,
      });
      worker.once('message', msg => (msg && msg.error ? reject(new Error(msg.error)) : resolve()));
      worker.once('error', reject);
      worker.once('exit', code => { if (code !== 0) reject(new Error(`Worker exited with code ${code}`)); });
    })));
  }

  // Strip internal-only fields before returning metadata
  return allParts.map(({ stepId: _s, closureArr: _c, ...meta }) => meta);
}

// GLB serialisation + OCCT conversion now live in worker-convert.js (run via
// the ConvertPool above).
