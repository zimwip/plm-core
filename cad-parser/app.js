import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, rm } from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import initOcct from 'occt-import-js';

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
      const parts = splitStep(content);

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

// Build a row-major 4×4 transformation matrix from STEP AXIS2_PLACEMENT_3D data.
// origin: [x,y,z] translation; dirX: x-axis direction; dirZ: z-axis direction.
// Returns 16-element array (row 0 first): [xx,yx,zx,tx, xy,yy,zy,ty, xz,yz,zz,tz, 0,0,0,1]
function buildMatrix4x4(origin, dirX, dirZ) {
  const normalize = v => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return len > 0 ? v.map(c => c / len) : [0, 0, 0];
  };
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];

  const ox = origin[0] ?? 0, oy = origin[1] ?? 0, oz = origin[2] ?? 0;
  const z = normalize(dirZ ?? [0, 0, 1]);
  const x = normalize(dirX ?? [1, 0, 0]);
  const y = normalize(cross(z, x));

  return [
    x[0], y[0], z[0], ox,
    x[1], y[1], z[1], oy,
    x[2], y[2], z[2], oz,
    0,    0,    0,    1,
  ];
}

// Given a normalised STEP data string and the set of NAUO entity IDs, returns a
// function getMatrixForNauo(nauoId) → double[16] | null.
// Traversal: NAUO → PRODUCT_DEFINITION_SHAPE → CONTEXT_DEPENDENT_SHAPE_REPRESENTATION
//            → SHAPE_REPRESENTATION_RELATIONSHIP → SHAPE_REPRESENTATION → AXIS2_PLACEMENT_3D
// Works for simple AP214 patterns; returns null when chain is absent or uses
// compound REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION entities.
function makeNauoMatrixExtractor(data, nauoIdSet) {
  function byType(typeName) {
    const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
    const out = {}; let m;
    while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
    return out;
  }
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
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  const cartPoints = {};
  for (const [id, args] of Object.entries(byType('CARTESIAN_POINT'))) {
    const p = split(args);
    const nums = (p[1] ?? '').replace(/[()]/g, '').split(',').map(Number);
    if (nums.length >= 3 && !nums.some(isNaN)) cartPoints[id] = nums;
  }
  const directions = {};
  for (const [id, args] of Object.entries(byType('DIRECTION'))) {
    const p = split(args);
    const nums = (p[1] ?? '').replace(/[()]/g, '').split(',').map(Number);
    if (nums.length >= 3 && !nums.some(isNaN)) directions[id] = nums;
  }
  const axis2p3d = {};
  for (const [id, args] of Object.entries(byType('AXIS2_PLACEMENT_3D'))) {
    const p = split(args);
    axis2p3d[id] = { originId: ref(p[1]), dirZId: ref(p[2]), dirXId: ref(p[3]) };
  }

  // PRODUCT_DEFINITION_SHAPE entities whose definition arg references a NAUO
  const nauoToPds = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const p = split(args);
    const defRef = ref(p[2]);
    if (defRef && nauoIdSet.has(defRef)) nauoToPds[defRef] = pdsId;
  }

  // CONTEXT_DEPENDENT_SHAPE_REPRESENTATION(#srr_ref, #pds_ref)
  const pdsToCdsr = {};
  for (const [, args] of Object.entries(byType('CONTEXT_DEPENDENT_SHAPE_REPRESENTATION'))) {
    const p = split(args);
    const srrId = ref(p[0]), pdsId = ref(p[1]);
    if (srrId && pdsId) pdsToCdsr[pdsId] = srrId;
  }

  // Simple SHAPE_REPRESENTATION_RELATIONSHIP('','',#sr1,#sr2)
  const srrMap = {};
  for (const [id, args] of Object.entries(byType('SHAPE_REPRESENTATION_RELATIONSHIP'))) {
    const p = split(args);
    const sr1 = ref(p[2]), sr2 = ref(p[3]);
    if (sr1 && sr2) srrMap[id] = [sr1, sr2];
  }
  // Compound SRR: #N =( REPRESENTATION_RELATIONSHIP(...) REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION(#idt) SHAPE_REPRESENTATION_RELATIONSHIP() )
  // Used in AP214 files where positioning is via ITEM_DEFINED_TRANSFORMATION, not SR items
  const compoundSrrToIdt = {};
  { const re = /#(\d+)\s*=\s*\(\s*REPRESENTATION_RELATIONSHIP\s*\([^)]*\)\s*REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION\s*\(\s*#(\d+)\s*\)/g; let m;
    while ((m = re.exec(data)) !== null) compoundSrrToIdt[m[1]] = m[2]; }
  // ITEM_DEFINED_TRANSFORMATION(name, desc, #occurrence_A2P3D, #identity_A2P3D) — arg[2] = placement in assembly space
  const idtToA2p3d = {};
  for (const [id, args] of Object.entries(byType('ITEM_DEFINED_TRANSFORMATION'))) {
    const a2pId = ref(split(args)[2]);
    if (a2pId) idtToA2p3d[id] = a2pId;
  }

  // Shape representation items + reverse index item→SR
  const itemToSr = {};
  const srItems = {};
  for (const [id, args] of Object.entries({
    ...byType('SHAPE_REPRESENTATION'),
    ...byType('ADVANCED_BREP_SHAPE_REPRESENTATION'),
    ...byType('GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION'),
  })) {
    const p = split(args);
    const refs = []; const re2 = /#(\d+)/g; let m;
    while ((m = re2.exec(p[1] ?? '')) !== null) { refs.push(m[1]); itemToSr[m[1]] = id; }
    srItems[id] = refs;
  }

  // AP214 mixed: NAUO occurrence PDS → SDR → SR (handles files that mix AP203/AP214 conventions)
  const nauoPdsIds = new Set(Object.values(nauoToPds));
  const pdsToPsr = {};
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = split(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (pdsId && srId && nauoPdsIds.has(pdsId)) pdsToPsr[pdsId] = srId;
  }

  // AP203 MAPPED_ITEM path — rebuild product chain to connect NAUO → assembly SR → MAPPED_ITEM
  const _fmts = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const pid = ref(split(args)[2]);
    if (pid) _fmts[id] = pid;
  }
  const _pdefs = {};  // pd_id → product step id
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(split(args)[2]);
    if (fid && _fmts[fid]) _pdefs[id] = _fmts[fid];
  }
  const nauoInfo = {};  // nauoId → {parentProduct, childProduct} (product step ids)
  for (const [nauoId, args] of Object.entries({
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  })) {
    if (!nauoIdSet.has(nauoId)) continue;
    const p = split(args);
    const parPdId = ref(p[3]), chiPdId = ref(p[4]);
    if (parPdId && chiPdId && _pdefs[parPdId] && _pdefs[chiPdId]) {
      nauoInfo[nauoId] = { parentProduct: _pdefs[parPdId], childProduct: _pdefs[chiPdId] };
    }
  }
  // Product step id → SR (via product-level PDS → SDR; excludes NAUO-linked PDSes)
  const _productOfPds = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const defRef = ref(split(args)[2]);
    if (defRef && _pdefs[defRef]) _productOfPds[pdsId] = _pdefs[defRef];
  }
  const productToSr = {};
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = split(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (pdsId && srId && _productOfPds[pdsId]) productToSr[_productOfPds[pdsId]] = srId;
  }
  // REPRESENTATION_MAP id → child SR id (arg[1] = mapped_representation)
  const reprMapToSr = {};
  for (const [id, args] of Object.entries(byType('REPRESENTATION_MAP'))) {
    const srId = ref(split(args)[1]);
    if (srId) reprMapToSr[id] = srId;
  }
  // Assembly SR → MAPPED_ITEM list: {reprMapId, targetId (AXIS2_PLACEMENT_3D)}
  const srToMappedItems = {};
  for (const [miId, args] of Object.entries(byType('MAPPED_ITEM'))) {
    const p = split(args);
    const reprMapId = ref(p[1]), targetId = ref(p[2]);
    if (!reprMapId || !targetId) continue;
    const parentSrId = itemToSr[miId];
    if (parentSrId) (srToMappedItems[parentSrId] ??= []).push({ reprMapId, targetId });
  }
  // Index each NAUO among siblings with same parent+child (multi-instance correlation)
  const nauosByPairKey = {};
  for (const [nauoId, info] of Object.entries(nauoInfo)) {
    const key = `${info.parentProduct}:${info.childProduct}`;
    (nauosByPairKey[key] ??= []).push(nauoId);
  }

  return function getMatrixForNauo(nauoId) {
    const pdsId = nauoToPds[nauoId];

    if (pdsId) {
      // AP214: CDSR arg[1] may be NAUO (standard) or its PDS (some exporters) — try both
      const srrId = pdsToCdsr[pdsId] ?? pdsToCdsr[nauoId];
      if (srrId) {
        // Simple SRR: items-based lookup
        const srs = srrMap[srrId];
        if (srs) {
          for (const srId of srs) {
            for (const itemId of (srItems[srId] ?? [])) {
              const a2p = axis2p3d[itemId];
              if (!a2p) continue;
              const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
              const dirZ   = a2p.dirZId ? directions[a2p.dirZId] : null;
              const dirX   = a2p.dirXId ? directions[a2p.dirXId] : null;
              return buildMatrix4x4(origin, dirX, dirZ);
            }
          }
        }
        // Compound SRR: REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION → IDT → A2P3D
        const a2pId = idtToA2p3d[compoundSrrToIdt[srrId]];
        if (a2pId) {
          const a2p = axis2p3d[a2pId];
          if (a2p) {
            const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
            return buildMatrix4x4(origin, a2p.dirXId ? directions[a2p.dirXId] : null, a2p.dirZId ? directions[a2p.dirZId] : null);
          }
        }
      }
      // Mixed: PDS → SDR → SR → AXIS2_PLACEMENT_3D
      const srId = pdsToPsr[pdsId];
      if (srId) {
        for (const itemId of (srItems[srId] ?? [])) {
          const a2p = axis2p3d[itemId];
          if (!a2p) continue;
          const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
          const dirZ   = a2p.dirZId ? directions[a2p.dirZId] : null;
          const dirX   = a2p.dirXId ? directions[a2p.dirXId] : null;
          return buildMatrix4x4(origin, dirX, dirZ);
        }
      }
    }

    // AP203: assembly SR → MAPPED_ITEM (mapping_source=REPR_MAP → child SR, mapping_target=A2P3D)
    const info = nauoInfo[nauoId];
    if (!info) return null;
    const parentSrId = productToSr[info.parentProduct];
    const childSrId  = productToSr[info.childProduct];
    if (!parentSrId || !childSrId) return null;

    const candidates = (srToMappedItems[parentSrId] ?? [])
        .filter(mi => reprMapToSr[mi.reprMapId] === childSrId);
    if (!candidates.length) return null;

    const key = `${info.parentProduct}:${info.childProduct}`;
    const siblings = nauosByPairKey[key] ?? [nauoId];
    const idx = Math.max(0, siblings.indexOf(nauoId));
    const mi = candidates[Math.min(idx, candidates.length - 1)];

    const a2p = axis2p3d[mi.targetId];
    if (!a2p) return null;
    const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
    const dirZ   = a2p.dirZId ? directions[a2p.dirZId] : null;
    const dirX   = a2p.dirXId ? directions[a2p.dirXId] : null;
    return buildMatrix4x4(origin, dirX, dirZ);
  };
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
// ---------------------------------------------------------------------------

function buildEntityMap(normalizedData) {
  const map = {};
  for (const seg of normalizedData.split(';')) {
    const t = seg.trim();
    const m = t.match(/^#(\d+)\s*=/);
    if (m) map[m[1]] = t + ';';
  }
  return map;
}

function buildRefGraph(entityMap) {
  const graph = {};
  for (const [id, line] of Object.entries(entityMap)) {
    graph[id] = new Set();
    const body = line.replace(/^#\d+\s*=\s*/, '');
    const refRe = /#(\d+)/g;
    let m;
    while ((m = refRe.exec(body)) !== null) graph[id].add(m[1]);
  }
  return graph;
}

// Build reverse reference graph: entity B → Set of entity IDs that reference B.
function buildReverseRefGraph(entityMap) {
  const rg = {};
  for (const [id, line] of Object.entries(entityMap)) {
    const body = line.replace(/^#\d+\s*=\s*/, '');
    const refRe = /#(\d+)/g;
    let m;
    while ((m = refRe.exec(body)) !== null) (rg[m[1]] ??= new Set()).add(id);
  }
  return rg;
}

// Phase 1 — reverse BFS from productStepId.
// Finds the product's own definitional chain: PRODUCT_DEFINITION_FORMATION,
// PRODUCT_DEFINITION, PRODUCT_DEFINITION_SHAPE, SHAPE_DEFINITION_REPRESENTATION.
// Stops at other PRODUCT entities AND skips cross-product linking entities
// (NAUO/ASSEMBLY_COMPONENT_USAGE) to prevent pulling in parent/sibling geometry.
function findDefinitionalChain(productStepId, reverseRefGraph, refGraph, productStepIds, prodDefs) {
  const myProdDefIds = new Set(
    Object.entries(prodDefs).filter(([, pid]) => pid === productStepId).map(([id]) => id)
  );

  const chain = new Set([productStepId]);
  const queue = [productStepId];
  let ptr = 0;
  while (ptr < queue.length) {
    const id = queue[ptr++];
    for (const referrer of (reverseRefGraph[id] ?? [])) {
      if (chain.has(referrer)) continue;
      if (productStepIds.has(referrer)) continue; // other PRODUCT entity — stop

      // Skip cross-product linking entities (NAUO, ASSEMBLY_COMPONENT_USAGE, etc.):
      // detected as any entity that references one of our PDs AND also references a
      // PD belonging to a DIFFERENT product. Including them would contaminate forward
      // BFS with parent/sibling product definitions.
      const refs = refGraph[referrer] ?? new Set();
      const refsOurPD    = [...refs].some(r => myProdDefIds.has(r));
      const refsOtherPD  = [...refs].some(r => prodDefs[r] !== undefined && prodDefs[r] !== productStepId);
      if (refsOurPD && refsOtherPD) continue;

      chain.add(referrer);
      queue.push(referrer);
    }
  }
  return chain;
}

// Phase 2 — unrestricted forward BFS from the clean definitional chain.
// No product boundary stopping: the chain already excludes cross-product entities,
// so forward refs lead only to this product's own geometry and shared contexts.
function collectForwardClosure(seeds, refGraph) {
  const visited = new Set(seeds);
  const queue = [...seeds];
  let ptr = 0;
  while (ptr < queue.length) {
    const id = queue[ptr++];
    const deps = refGraph[id];
    if (deps) for (const dep of deps) if (!visited.has(dep)) { visited.add(dep); queue.push(dep); }
  }
  return visited;
}

function reconstructStepFile(headerSection, closureIds, entityMap) {
  const sorted = Array.from(closureIds)
    .filter(id => entityMap[id])
    .sort((a, b) => parseInt(a) - parseInt(b));
  const renumber = {};
  sorted.forEach((oldId, i) => { renumber[oldId] = String(i + 1); });
  const dataLines = sorted.map(oldId =>
    entityMap[oldId].replace(/#(\d+)/g, (_, refId) => '#' + (renumber[refId] ?? refId))
  );
  return ['ISO-10303-21;', headerSection, 'DATA;', ...dataLines, 'ENDSEC;', 'END-ISO-10303-21;'].join('\n');
}

function splitStep(content) {
  const headerMatch = content.match(/(HEADER;[\s\S]*?ENDSEC;)/);
  const headerSection = headerMatch ? headerMatch[1] : 'HEADER;\nENDSEC;';

  const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
  if (!dataMatch) throw new Error('No DATA section in STEP file');
  const data = dataMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\r?\n\s*/g, ' ');

  const entityMap      = buildEntityMap(data);
  const refGraph       = buildRefGraph(entityMap);
  const reverseRefGraph = buildReverseRefGraph(entityMap);

  // ── BOM extraction (mirrors parseStep) ───────────────────────────────────
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

  // Collect all occurrences per child (multi-instance aware)
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

  const getMatrixForNauo = makeNauoMatrixExtractor(data, new Set(Object.keys(nauoEntities)));

  const hasChildren    = new Set(
    Object.values(occurrencesOf).flat().map(o => o.parentProductId)
  );
  const productStepIds = new Set(Object.keys(products));
  const idMap = {};
  for (const stepId of Object.keys(products)) idMap[stepId] = randomUUID();

  // ── Pre-compute SRR expansion structures (computed once, used per product) ──
  //
  // In AP214, SDR links to a "positioning" SHAPE_REPRESENTATION (contains only
  // AXIS2_PLACEMENT_3D). The actual B-rep geometry lives in a second SR reachable
  // only via SHAPE_REPRESENTATION_RELATIONSHIP (SRR), which REFERENCES the
  // positioning SR — not the other way around. Forward BFS from SDR therefore
  // misses all geometry. Phase 3 below repairs this by traversing SRR edges.
  //
  // Guard: an SRR whose "other end" is another product's SDR-entry SR is an
  // assembly-context positioning link (child in parent assembly). Skip those to
  // avoid pulling child geometry into parent assembly files.

  // PRODUCT_DEFINITION_SHAPE: pds_id → pd_id (arg[2])
  const pdsToPdId = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const pdId = ref(splitArgs(args)[2]);
    if (pdId) pdsToPdId[pdsId] = pdId;
  }

  // SDR: maps the SR directly linked from each product's SDR → that product's step ID
  // (these are the "entry-point" SRs — crossing into one of these means crossing a product boundary)
  const srToProductId = {}; // sr_id → product_step_id
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

  // SRR entity IDs — catches both simple and complex (AP203 compound) entities
  const allSRRIds = new Set();
  for (const [id, line] of Object.entries(entityMap)) {
    if (line.includes('SHAPE_REPRESENTATION_RELATIONSHIP')) allSRRIds.add(id);
  }

  // reverseFromSRR[entity_id] = Set of SRR ids that reference entity_id
  const reverseFromSRR = {};
  for (const srrId of allSRRIds) {
    for (const refId of (refGraph[srrId] ?? [])) {
      (reverseFromSRR[refId] ??= new Set()).add(srrId);
    }
  }

  return Object.entries(products).map(([stepId, prod]) => {
    // Phase 1: reverse BFS — definitional chain (PRODUCT → PDF → PD → PDS → SDR),
    // skipping NAUO/ACU cross-product linking entities.
    const chain = findDefinitionalChain(stepId, reverseRefGraph, refGraph, productStepIds, prodDefs);

    // Phase 2: forward BFS from the chain — reaches the entry-point SR and
    // in AP203 (where SDR links directly to the geometry SR) all geometry too.
    const closure = collectForwardClosure(chain, refGraph);

    // Phase 3: SRR expansion — for each entity in the closure, find any
    // SHAPE_REPRESENTATION_RELATIONSHIP that references it, then include the SRR
    // and the geometry SR on the other end (plus its full forward closure).
    // Skip SRRs that bridge to another product's entry SR (assembly-context links).
    //
    // Uses a growing array with a forward pointer (O(n)) instead of shift() (O(n²)).
    // New entities discovered during expansion are appended to the array and processed
    // in subsequent iterations of the same loop.
    const srrCheckQueue = [...closure];
    const checkedForSRR = new Set();

    for (let i = 0; i < srrCheckQueue.length; i++) {
      const entityId = srrCheckQueue[i];
      if (checkedForSRR.has(entityId)) continue;
      checkedForSRR.add(entityId);

      for (const srrId of (reverseFromSRR[entityId] ?? [])) {
        if (closure.has(srrId)) continue;

        const srrRefs = refGraph[srrId] ?? new Set();
        const newRefs = [...srrRefs].filter(r => !closure.has(r));

        const crossRefs = newRefs.filter(r => allEntrySRIds.has(r) && srToProductId[r] !== stepId);
        const safeRefs  = newRefs.filter(r => !crossRefs.includes(r));

        // Always include the SRR itself (both same-product geometry bridges and
        // cross-product assembly-context links with their transformation matrices).
        closure.add(srrId);
        srrCheckQueue.push(srrId);

        if (crossRefs.length > 0) {
          // Assembly-context SRR: include the SRR + transformation entities (safeRefs),
          // plus the child's entry SR as a stub (referenced by the SRR, but don't
          // forward-expand into the child's geometry — that lives in the child's file).
          // Also include CDSRs that tie this SRR to the assembly occurrence PDS.
          for (const r of crossRefs) closure.add(r); // entity stub, no expansion

          const sub = collectForwardClosure(new Set(safeRefs), refGraph);
          for (const e of sub) {
            if (!closure.has(e)) { closure.add(e); srrCheckQueue.push(e); }
          }

          // Pull in CDSRs (CONTEXT_DEPENDENT_SHAPE_REPRESENTATION) that reference
          // this SRR — they link the positioning to the NAUO occurrence PDS.
          for (const cdsr of (reverseRefGraph[srrId] ?? [])) {
            if (closure.has(cdsr)) continue;
            closure.add(cdsr);
            srrCheckQueue.push(cdsr);
            for (const r of (refGraph[cdsr] ?? [])) {
              if (!closure.has(r)) { closure.add(r); srrCheckQueue.push(r); }
            }
          }
        } else {
          // Same-product SRR (geometry bridge): full forward expansion.
          const sub = collectForwardClosure(new Set(newRefs), refGraph);
          for (const e of sub) {
            if (!closure.has(e)) { closure.add(e); srrCheckQueue.push(e); }
          }
        }
      }
    }

    const stepContent = reconstructStepFile(headerSection, closure, entityMap);
    return {
      nodeId:     idMap[stepId],
      name:       prod.name || prod.partNumber || `Part-${stepId}`,
      cadType:    hasChildren.has(stepId) ? 'ASSEMBLY' : 'PART',
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
