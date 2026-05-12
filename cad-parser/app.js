import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, rm } from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { cpus } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { Worker } from 'worker_threads';
import initOcct from 'occt-import-js';
import {
  buildEntityMap,
  buildRefGraph,
  buildReverseRefGraph,
  findDefinitionalChain,
  collectForwardClosure,
  expandSRRClosure,
  reconstructStepFile,
  buildMatrix4x4,
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

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

// In-memory job store: jobId → { status, parts?, error?, dir? }
const splitJobs = new Map();
const JOB_TTL_MS = 15 * 60 * 1000; // 15 minutes

// Minimum product count before spawning workers (below this threshold sequential is faster)
const PARALLEL_THRESHOLD = 8;

app.get('/health', (_req, res) => res.json({ status: 'UP' }));

app.post('/parse', upload.single('file'), async (req, res) => {
  const format = (req.body?.format ?? 'STEP').toUpperCase();
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    const content = req.file.buffer.toString('utf8');
    const nodes = format === 'STEP'     ? parseStep(content)
                : format === 'CATIA_V5' ? parseCatiaProduct(content)
                : null;

    if (!nodes) return res.status(400).json({ error: `Unknown format: ${format}` });
    res.json({ format, nodes });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// POST /split — submits async job, returns 202 + jobId immediately
app.post('/split', upload.single('file'), (req, res) => {
  const format = (req.body?.format ?? 'STEP').toUpperCase();
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  if (format !== 'STEP') return res.status(422).json({ error: `Split not supported for format: ${format}` });

  const jobId  = randomUUID();
  const jobDir = join(tmpdir(), 'cad-split', jobId);
  splitJobs.set(jobId, { status: 'PENDING' });

  res.status(202).json({ jobId });

  // Process in background — release the HTTP response immediately
  const content = req.file.buffer.toString('utf8');
  setImmediate(async () => {
    try {
      await mkdir(jobDir, { recursive: true });
      const parts = await splitStep(content);

      const partMeta = [];
      for (let i = 0; i < parts.length; i++) {
        const { stepContent, ...meta } = parts[i];
        await writeFile(join(jobDir, `part-${i}.stp`), stepContent, 'utf8');
        partMeta.push(meta);
      }

      splitJobs.set(jobId, { status: 'DONE', parts: partMeta, dir: jobDir });
      console.log(`Split job ${jobId} done: ${partMeta.length} parts`);

      setTimeout(() => {
        rm(jobDir, { recursive: true, force: true }).catch(() => {});
        splitJobs.delete(jobId);
      }, JOB_TTL_MS);
    } catch (err) {
      console.error(`Split job ${jobId} failed:`, err.message);
      splitJobs.set(jobId, { status: 'ERROR', error: err.message });
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
// Shared helpers
// ---------------------------------------------------------------------------

// Serialize an array of {positions, normals, indices, color} mesh objects to GLB.
// Produces a valid glTF 2.0 binary with one mesh primitive per entry.
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

    // Positions
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

    // Normals
    if (normals) {
      const normView = bufferViews.length;
      bufferViews.push({ buffer: 0, byteOffset, byteLength: normals.byteLength, target: 34962 });
      pushBytes(normals);
      primAttrs.NORMAL = accessors.length;
      accessors.push({ bufferView: normView, byteOffset: 0, componentType: 5126, count: vertCount, type: 'VEC3' });
    }

    // Indices (must be 4-byte aligned)
    const primitive = { attributes: primAttrs, mode: 4 };
    if (indices) {
      padTo4();
      const idxView = bufferViews.length;
      bufferViews.push({ buffer: 0, byteOffset, byteLength: indices.byteLength, target: 34963 });
      pushBytes(indices);
      primitive.indices = accessors.length;
      accessors.push({ bufferView: idxView, byteOffset: 0, componentType: 5125, count: indices.length, type: 'SCALAR' });
    }

    // Material
    const r = color ? color[0] : 0.357, g = color ? color[1] : 0.608, b = color ? color[2] : 0.965;
    primitive.material = materials.length;
    materials.push({ pbrMetallicRoughness: { baseColorFactor: [r, g, b, 1.0], metallicFactor: 0.1, roughnessFactor: 0.8 }, doubleSided: true });
    gltfMeshes.push({ primitives: [primitive] });
  }

  // Binary buffer
  const totalBin = align4(byteOffset);
  const binBuf   = Buffer.alloc(totalBin, 0);
  let off = 0;
  for (const part of bufParts) { binBuf.set(part, off); off += part.byteLength; }

  // glTF JSON
  const gltf = {
    asset: { version: '2.0', generator: 'cad-parser/occt-import-js' },
    scene: 0,
    scenes: [{ nodes: gltfMeshes.map((_, i) => i) }],
    nodes:  gltfMeshes.map((_, i) => ({ mesh: i })),
    meshes: gltfMeshes, materials, accessors, bufferViews,
    buffers: [{ byteLength: totalBin }],
  };
  const jsonBuf = Buffer.from(JSON.stringify(gltf), 'utf8');
  const jsonPad = Buffer.alloc(align4(jsonBuf.length), 0x20); // pad with spaces (valid JSON whitespace)
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

// ---------------------------------------------------------------------------
// NAUO matrix extractor — now delegates to step-lib for serialisable precompute
// ---------------------------------------------------------------------------
function makeNauoMatrixExtractor(data, nauoIdSet) {
  return buildNauoExtractor(precomputeNauoData(data, nauoIdSet));
}

// ---------------------------------------------------------------------------
// STEP P21 BOM parser — pure text, no WASM
// Handles AP203 / AP214 / AP242 assembly structures.
// Returns nodes with occurrences: [{parentId, positionMatrix}]
// ---------------------------------------------------------------------------
function parseStep(content) {
  const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
  if (!dataMatch) throw new Error('No DATA section in STEP file');

  // Strip inline comments and normalise multi-line entities into one line each
  const data = dataMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // /* comments */
    .replace(/\r?\n\s*/g, ' ');

  // ── entity extractor ──────────────────────────────────────────────────────
  function byType(typeName) {
    const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
    const out = {};
    let m;
    while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
    return out;
  }

  // Split top-level comma args respecting nested parentheses
  function split(s) {
    const parts = []; let depth = 0, cur = '';
    for (const ch of s) {
      if ('(['.includes(ch)) depth++;
      else if (')]'.includes(ch)) depth--;
      else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }

  const str = s => { const m = s?.match(/^'(.*)'$/s); return m ? m[1] : (s ?? '').trim(); };
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  // PRODUCT('partNumber','name','description', context_refs)
  const products = {};
  for (const [id, args] of Object.entries(byType('PRODUCT'))) {
    const p = split(args);
    products[id] = { partNumber: str(p[0]), name: str(p[1]), description: str(p[2] ?? '') };
  }

  // PRODUCT_DEFINITION_FORMATION[_WITH_SPECIFIED_SOURCE]('rev','desc',#PRODUCT)
  const formations = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const p = split(args);
    const pid = ref(p[2]);
    if (pid) formations[id] = { revision: str(p[0]), productId: pid };
  }

  // PRODUCT_DEFINITION('design','desc',#FORMATION, #CONTEXT)
  const prodDefs = {};   // productDefId → productId
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(split(args)[2]);
    if (fid && formations[fid]) prodDefs[id] = formations[fid].productId;
  }

  // NEXT_ASSEMBLY_USAGE_OCCURRENCE: collect all occurrences per child (multi-instance aware)
  // occurrencesOf[childProductId] = [{parentProductId, nauoId}]
  const nauoEntities = {
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  };
  const occurrencesOf = {};
  for (const [nauoId, args] of Object.entries(nauoEntities)) {
    const p = split(args);
    const par = ref(p[3]), chi = ref(p[4]);
    if (par && chi && prodDefs[par] && prodDefs[chi]) {
      const childProd = prodDefs[chi], parentProd = prodDefs[par];
      (occurrencesOf[childProd] ??= []).push({ parentProductId: parentProd, nauoId });
    }
  }

  if (!Object.keys(products).length) throw new Error('No PRODUCT entities found — may not be an assembly STEP file');

  const getMatrixForNauo = makeNauoMatrixExtractor(data, new Set(Object.keys(nauoEntities)));

  // Build flat node list
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
      n.occurrences = occs
        .map(occ => {
          const parentId = idMap[occ.parentProductId] ?? null;
          if (parentId) hasChildren.add(parentId);
          return { parentId, positionMatrix: getMatrixForNauo(occ.nauoId) };
        })
        .filter(o => o.parentId !== null);
    } else {
      n.occurrences = [];
    }
    delete n._s;
  }
  for (const n of nodes) n.type = hasChildren.has(n.id) ? 'ASSEMBLY' : 'PART';

  return nodes;
}

// ---------------------------------------------------------------------------
// CATIA V5 CATProduct — XML parse
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
// STEP per-part file splitter
// For each PRODUCT entity: computes the transitive entity closure (stopping at
// other product boundaries) and reconstructs a minimal valid STEP file.
// Uses worker_threads to parallelise per-product closure computation when the
// product count exceeds PARALLEL_THRESHOLD.
// ---------------------------------------------------------------------------

function splitStep(content) {
  const headerMatch = content.match(/(HEADER;[\s\S]*?ENDSEC;)/);
  const headerSection = headerMatch ? headerMatch[1] : 'HEADER;\nENDSEC;';

  const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
  if (!dataMatch) throw new Error('No DATA section in STEP file');
  const data = dataMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\r?\n\s*/g, ' ');

  const entityMap       = buildEntityMap(data);
  const refGraph        = buildRefGraph(entityMap);
  const reverseRefGraph = buildReverseRefGraph(entityMap);

  // ── BOM extraction ───────────────────────────────────────────────────────
  function byType(typeName) {
    const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
    const out = {}; let m;
    while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
    return out;
  }
  function splitArgs(s) {
    const parts = []; let depth = 0, cur = '';
    for (const ch of s) {
      if ('(['.includes(ch)) depth++;
      else if (')]'.includes(ch)) depth--;
      else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
      cur += ch;
    }
    if (cur.trim()) parts.push(cur.trim());
    return parts;
  }
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
      const childProd = prodDefs[chi], parentProd = prodDefs[par];
      (occurrencesOf[childProd] ??= []).push({ parentProductId: parentProd, nauoId });
    }
  }

  if (!Object.keys(products).length) throw new Error('No PRODUCT entities found — may not be an assembly STEP file');

  const hasChildren    = new Set(Object.values(occurrencesOf).flat().map(o => o.parentProductId));
  const productStepIds = new Set(Object.keys(products));
  const idMap = {};
  for (const stepId of Object.keys(products)) idMap[stepId] = randomUUID();

  // ── Pre-compute SRR expansion structures ─────────────────────────────────
  const pdsToPdId = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const pdId = ref(splitArgs(args)[2]);
    if (pdId) pdsToPdId[pdsId] = pdId;
  }

  const srToProductId = {};
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = splitArgs(args);
    const pdsId = ref(p[0]);
    const srId  = ref(p[1]);
    if (!pdsId || !srId) continue;
    const pdId      = pdsToPdId[pdsId];
    const productId = pdId ? prodDefs[pdId] : null;
    if (productId) srToProductId[srId] = productId;
  }
  const allEntrySRIds = new Set(Object.keys(srToProductId));

  const allSRRIds = new Set();
  for (const [id, line] of Object.entries(entityMap)) {
    if (line.includes('SHAPE_REPRESENTATION_RELATIONSHIP')) allSRRIds.add(id);
  }

  const reverseFromSRR = {};
  for (const srrId of allSRRIds) {
    for (const refId of (refGraph[srrId] ?? [])) {
      (reverseFromSRR[refId] ??= new Set()).add(srrId);
    }
  }

  // ── NAUO matrix precompute (serialisable for worker transfer) ─────────────
  const nauoData = precomputeNauoData(data, new Set(Object.keys(nauoEntities)));

  const productEntries = Object.entries(products);

  // ── Sequential processing (small files or fallback) ───────────────────────
  function processSequential() {
    const getMatrixForNauo = buildNauoExtractor(nauoData);
    return productEntries.map(([stepId, prod]) => {
      const chain   = findDefinitionalChain(stepId, reverseRefGraph, refGraph, productStepIds, prodDefs);
      const closure = collectForwardClosure(chain, refGraph);
      expandSRRClosure(closure, reverseFromSRR, refGraph, reverseRefGraph, allEntrySRIds, srToProductId, stepId);
      const stepContent = reconstructStepFile(headerSection, closure, entityMap);
      return {
        nodeId:   idMap[stepId],
        name:     prod.name || prod.partNumber || `Part-${stepId}`,
        cadType:  hasChildren.has(stepId) ? 'ASSEMBLY' : 'PART',
        occurrences: (occurrencesOf[stepId] ?? [])
          .map(occ => ({
            parentId:       idMap[occ.parentProductId] ?? null,
            positionMatrix: getMatrixForNauo(occ.nauoId),
          }))
          .filter(o => o.parentId !== null),
        attributes: Object.fromEntries(
          [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
        ),
        stepContent,
      };
    });
  }

  if (productEntries.length < PARALLEL_THRESHOLD) {
    return Promise.resolve(processSequential());
  }

  // ── Parallel processing via worker_threads ────────────────────────────────
  // Serialise Sets → arrays for structured-clone transfer to workers.
  const refGraphArr = {};
  for (const [id, s] of Object.entries(refGraph))        refGraphArr[id]        = [...s];
  const reverseRefGraphArr = {};
  for (const [id, s] of Object.entries(reverseRefGraph)) reverseRefGraphArr[id] = [...s];
  const reverseFromSRRArr = {};
  for (const [id, s] of Object.entries(reverseFromSRR))  reverseFromSRRArr[id]  = [...s];

  const sharedData = {
    entityMap,
    refGraphArr,
    reverseRefGraphArr,
    reverseFromSRRArr,
    productStepIdsArr: [...productStepIds],
    allEntrySRIdsArr:  [...allEntrySRIds],
    prodDefs,
    srToProductId,
    headerSection,
    nauoData,
    idMap,
    occurrencesOf,
    hasChildrenArr: [...hasChildren],
  };

  const numWorkers = Math.min(cpus().length, productEntries.length);
  const chunkSize  = Math.ceil(productEntries.length / numWorkers);
  const workerUrl  = new URL('./worker-split.js', import.meta.url);

  const chunks = [];
  for (let i = 0; i < productEntries.length; i += chunkSize) {
    chunks.push(productEntries.slice(i, i + chunkSize));
  }

  console.log(`Split: ${productEntries.length} products → ${chunks.length} workers`);

  return Promise.all(
    chunks.map(chunk => new Promise((resolve, reject) => {
      const worker = new Worker(workerUrl, {
        workerData: {
          ...sharedData,
          products: chunk.map(([stepId, prod]) => ({ stepId, prod })),
        },
      });
      worker.once('message', resolve);
      worker.once('error',   reject);
      worker.once('exit', code => {
        if (code !== 0) reject(new Error(`Worker exited with code ${code}`));
      });
    }))
  ).then(batches => batches.flat());
}
