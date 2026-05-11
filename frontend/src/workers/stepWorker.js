import initOcct from 'occt-import-js';

// ─── OCCT ─────────────────────────────────────────────────────────────────
let _occt = null;
const _occtReady = initOcct({ locateFile: () => '/occt/occt-import-js.wasm' })
  .then(inst => { _occt = inst; });

async function getOcct() {
  if (!_occt) await _occtReady;
  return _occt;
}

// ─── Geometry utilities ────────────────────────────────────────────────────
function computeVertexNormals(positions, indices) {
  const normals = new Float32Array(positions.length);
  const faceCount = indices ? indices.length / 3 : positions.length / 9;
  for (let f = 0; f < faceCount; f++) {
    let a, b, c;
    if (indices) {
      a = indices[f * 3] * 3; b = indices[f * 3 + 1] * 3; c = indices[f * 3 + 2] * 3;
    } else {
      a = f * 9; b = a + 3; c = a + 6;
    }
    const ex = positions[b]   - positions[a],   ey = positions[b+1] - positions[a+1], ez = positions[b+2] - positions[a+2];
    const fx = positions[c]   - positions[a],   fy = positions[c+1] - positions[a+1], fz = positions[c+2] - positions[a+2];
    const nx = ey * fz - ez * fy, ny = ez * fx - ex * fz, nz = ex * fy - ey * fx;
    normals[a]   += nx; normals[a+1] += ny; normals[a+2] += nz;
    normals[b]   += nx; normals[b+1] += ny; normals[b+2] += nz;
    normals[c]   += nx; normals[c+1] += ny; normals[c+2] += nz;
  }
  for (let i = 0; i < normals.length; i += 3) {
    const len = Math.sqrt(normals[i] ** 2 + normals[i+1] ** 2 + normals[i+2] ** 2) || 1;
    normals[i] /= len; normals[i+1] /= len; normals[i+2] /= len;
  }
  return normals;
}

function toIndexed(m) {
  if (m.indices) return m;
  const n = m.positions.length / 3;
  const idx = new Uint32Array(n);
  for (let i = 0; i < n; i++) idx[i] = i;
  return { ...m, indices: idx };
}

function mergeByColor(meshes) {
  const groups = new Map();
  for (const m of meshes) {
    const key = m.color
      ? `${m.color[0].toFixed(4)},${m.color[1].toFixed(4)},${m.color[2].toFixed(4)}`
      : '__default__';
    if (!groups.has(key)) groups.set(key, { color: m.color, meshes: [] });
    groups.get(key).meshes.push(m);
  }

  const result = [];
  for (const { color, meshes: grp } of groups.values()) {
    if (grp.length === 1) { result.push(grp[0]); continue; }

    const indexed = grp.map(toIndexed);
    let totalVerts = 0, totalIdx = 0;
    for (const m of indexed) { totalVerts += m.positions.length / 3; totalIdx += m.indices.length; }

    const positions = new Float32Array(totalVerts * 3);
    const normals   = new Float32Array(totalVerts * 3);
    const indices   = new Uint32Array(totalIdx);
    let vOff = 0, iOff = 0;

    for (const m of indexed) {
      const vc = m.positions.length / 3;
      positions.set(m.positions, vOff * 3);
      if (m.normals) normals.set(m.normals, vOff * 3);
      for (let i = 0; i < m.indices.length; i++) indices[iOff + i] = m.indices[i] + vOff;
      iOff += m.indices.length;
      vOff += vc;
    }

    result.push({ positions, normals, indices, color });
  }
  return result;
}

// ─── In-memory LRU cache ──────────────────────────────────────────────────
let MAX_BYTES = 256 * 1024 * 1024;
let _cacheBytes = 0;
const _cache    = new Map(); // uuid → { meshes, bytes, lastUsed }

function entryBytes(meshes) {
  return meshes.reduce(
    (s, m) => s + m.positions.byteLength + (m.normals?.byteLength ?? 0) + (m.indices?.byteLength ?? 0),
    0,
  );
}

function evict(needed) {
  const sorted = [..._cache.entries()].sort((a, b) => a[1].lastUsed - b[1].lastUsed);
  for (const [uuid, entry] of sorted) {
    if (_cacheBytes + needed <= MAX_BYTES) break;
    _cache.delete(uuid);
    _cacheBytes -= entry.bytes;
  }
}

function cloneMeshes(meshes) {
  return meshes.map(m => ({
    positions: m.positions.slice(),
    normals:   m.normals?.slice()  ?? null,
    indices:   m.indices?.slice()  ?? null,
    color:     m.color,
  }));
}

function transferList(meshes) {
  return meshes.flatMap(m =>
    [m.positions.buffer, m.normals?.buffer, m.indices?.buffer].filter(Boolean),
  );
}

// ─── Job statistics ────────────────────────────────────────────────────────
let _memHits    = 0;
let _idbHits    = 0;
let _netFetches = 0;
const _dlTimes  = []; // ms, rolling 50 samples
const _parseTimes = [];
const MAX_SAMPLES = 50;

function _avg(arr) { return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null; }

function pushStats() {
  self.postMessage({
    type: 'stats',
    entries: _cache.size, cacheBytes: _cacheBytes, maxBytes: MAX_BYTES,
    memHits: _memHits, idbHits: _idbHits, netFetches: _netFetches,
    avgDownloadMs: _avg(_dlTimes), avgParseMs: _avg(_parseTimes),
  });
}

// ─── IndexedDB persistent cache ───────────────────────────────────────────
const IDB_NAME    = 'plm-3d-cache';
const IDB_VERSION = 3;
const IDB_STORE   = 'meshes';
const IDB_TTL_MS  = 7 * 24 * 60 * 60 * 1000; // 7 days

let _db = null;

function openDb() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onupgradeneeded = ({ target: { result: db, oldVersion } }) => {
      if (oldVersion < 1) {
        db.createObjectStore(IDB_STORE, { keyPath: 'uuid' });
      } else {
        // v2: normals+merged geometry; v3: full-quality tessellation (reverted coarse settings)
        db.deleteObjectStore(IDB_STORE);
        db.createObjectStore(IDB_STORE, { keyPath: 'uuid' });
      }
    };
    req.onsuccess = ({ target: { result } }) => resolve(result);
    req.onerror   = ({ target: { error } })  => reject(error);
  });
}

async function getDb() {
  if (!_db) _db = await openDb();
  return _db;
}

async function idbGet(uuid) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const req = db.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).get(uuid);
    req.onsuccess = ({ target: { result } }) => resolve(result ?? null);
    req.onerror   = ({ target: { error } })  => reject(error);
  });
}

async function idbPut(uuid, meshes) {
  const db = await getDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(IDB_STORE, 'readwrite');
    tx.objectStore(IDB_STORE).put({ uuid, meshes, lastUsed: Date.now() });
    tx.oncomplete = resolve;
    tx.onerror    = ({ target: { error } }) => reject(error);
  });
}


function idbEvict() {
  const cutoff = Date.now() - IDB_TTL_MS;
  return getDb().then(db => new Promise(resolve => {
    const tx  = db.transaction(IDB_STORE, 'readwrite');
    const req = tx.objectStore(IDB_STORE).openCursor();
    req.onsuccess = ({ target: { result: cursor } }) => {
      if (!cursor) { resolve(); return; }
      if (cursor.value.lastUsed < cutoff) cursor.delete();
      cursor.continue();
    };
    tx.onerror = () => resolve();
  }));
}

idbEvict().catch(() => {}); // background TTL cleanup on worker spawn

// ─── In-flight deduplication ──────────────────────────────────────────────
const _inflight = new Map(); // uuid → Promise<void>

// ─── Minimal GLB parser ───────────────────────────────────────────────────
// Reads the compact GLB format produced by cad-parser/buildGlb().
// No external dependencies — avoids bundling Three.js into the worker.
function parseGlb(buffer) {
  const view = new DataView(buffer);
  if (view.getUint32(0, true) !== 0x46546C67) throw new Error('Not a GLB file');
  const jsonLen = view.getUint32(12, true);
  const gltf    = JSON.parse(new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLen)));
  const binStart = 12 + 8 + jsonLen;
  const binLen   = view.getUint32(binStart, true);
  const bin      = buffer.slice(binStart + 8, binStart + 8 + binLen);

  return gltf.meshes.map(gMesh => {
    const prim  = gMesh.primitives[0];
    const mat   = prim.material != null ? gltf.materials[prim.material] : null;
    const cf    = mat?.pbrMetallicRoughness?.baseColorFactor;
    const color = cf ? [cf[0], cf[1], cf[2]] : null;

    const posAcc = gltf.accessors[prim.attributes.POSITION];
    const posBv  = gltf.bufferViews[posAcc.bufferView];
    const positions = new Float32Array(bin, posBv.byteOffset, posAcc.count * 3).slice();

    let normals = null;
    if (prim.attributes.NORMAL != null) {
      const acc = gltf.accessors[prim.attributes.NORMAL];
      const bv  = gltf.bufferViews[acc.bufferView];
      normals = new Float32Array(bin, bv.byteOffset, acc.count * 3).slice();
    }

    let indices = null;
    if (prim.indices != null) {
      const acc = gltf.accessors[prim.indices];
      const bv  = gltf.bufferViews[acc.bufferView];
      indices = new Uint32Array(bin, bv.byteOffset, acc.count).slice();
    }

    return { positions, normals, indices, color };
  });
}

// ─── Core fetch + parse ───────────────────────────────────────────────────
async function _fetchAndParse(uuid, token, projectSpace, kind = 'design') {
  self.postMessage({ type: 'log', level: 'info', message: `[3D] Downloading ${uuid} (kind=${kind})` });
  self.postMessage({ type: 'progress', uuid, phase: 'downloading' });

  const dlStart = performance.now();
  const headers = {};
  if (token)        headers['Authorization']      = `Bearer ${token}`;
  if (projectSpace) headers['X-PLM-ProjectSpace'] = projectSpace;
  const res = await fetch(`/api/dst/data/${uuid}`, { headers });
  if (!res.ok) {
    self.postMessage({ type: 'log', level: 'error', message: `[3D] Download failed for ${uuid}: HTTP ${res.status}` });
    throw new Error(`Download failed: HTTP ${res.status}`);
  }
  const buf = await res.arrayBuffer();
  const dlMs = Math.round(performance.now() - dlStart);
  _dlTimes.push(dlMs);
  if (_dlTimes.length > MAX_SAMPLES) _dlTimes.shift();
  self.postMessage({ type: 'log', level: 'info', message: `[3D] Downloaded ${uuid} (${(buf.byteLength / 1048576).toFixed(2)} MB, ${dlMs}ms)` });

  self.postMessage({ type: 'progress', uuid, phase: 'parsing' });
  const parseStart = performance.now();

  let meshes;
  if (kind === 'simplified') {
    // GLB path — no OCCT, instant parse
    meshes = mergeByColor(parseGlb(buf));
  } else {
    // STEP path — OCCT tessellation
    const occt   = await getOcct();
    const result = occt.ReadStepFile(new Uint8Array(buf), null);
    if (!result?.success || !result.meshes?.length) {
      self.postMessage({ type: 'log', level: 'warn', message: `[3D] No geometry in ${uuid}` });
      throw new Error('No geometry found');
    }
    const rawMeshes = result.meshes.map(m => ({
      positions: new Float32Array(m.attributes.position.array),
      normals:   m.attributes?.normal ? new Float32Array(m.attributes.normal.array) : null,
      indices:   m.index              ? new Uint32Array(m.index.array)              : null,
      color:     m.color ?? null,
    }));
    for (const m of rawMeshes) {
      if (!m.normals) m.normals = computeVertexNormals(m.positions, m.indices);
    }
    meshes = mergeByColor(rawMeshes);
  }

  const parseMs = Math.round(performance.now() - parseStart);
  _parseTimes.push(parseMs);
  if (_parseTimes.length > MAX_SAMPLES) _parseTimes.shift();
  self.postMessage({ type: 'log', level: 'info', message: `[3D] Parsed ${uuid} (${kind}): ${meshes.length} mesh group(s), ${parseMs}ms` });

  const cachedMeshes = cloneMeshes(meshes);
  const bytes = entryBytes(cachedMeshes);
  evict(bytes);
  if (_cacheBytes + bytes <= MAX_BYTES) {
    _cache.set(uuid, { meshes: cachedMeshes, bytes, lastUsed: Date.now() });
    _cacheBytes += bytes;
  }
  idbPut(uuid, cachedMeshes).catch(() => {});

  _netFetches++;
  self.postMessage({ type: 'ready', uuid, meshes }, transferList(meshes));
  pushStats();
}

// ─── Load pipeline: memory → inflight → IDB → network ────────────────────
async function loadPart(uuid, token, projectSpace, kind = 'design') {
  // 1. In-memory hit
  if (_cache.has(uuid)) {
    _memHits++;
    const entry = _cache.get(uuid);
    entry.lastUsed = Date.now();
    const meshes = cloneMeshes(entry.meshes);
    self.postMessage({ type: 'log', level: 'debug', message: `[3D] Memory hit: ${uuid}` });
    self.postMessage({ type: 'ready', uuid, meshes }, transferList(meshes));
    pushStats();
    return;
  }

  // 2. Same UUID already in-flight — join and serve from cache when done
  if (_inflight.has(uuid)) {
    self.postMessage({ type: 'log', level: 'debug', message: `[3D] Joining in-flight: ${uuid}` });
    await _inflight.get(uuid);
    const entry = _cache.get(uuid);
    if (entry) {
      const meshes = cloneMeshes(entry.meshes);
      self.postMessage({ type: 'ready', uuid, meshes }, transferList(meshes));
    }
    return;
  }

  // 3. IndexedDB hit — skip network + OCCT entirely
  const idbEntry = await idbGet(uuid).catch(() => null);
  if (idbEntry) {
    _idbHits++;
    self.postMessage({ type: 'log', level: 'info', message: `[3D] IDB hit: ${uuid}` });
    const bytes        = entryBytes(idbEntry.meshes);
    const cachedMeshes = cloneMeshes(idbEntry.meshes);
    evict(bytes);
    if (_cacheBytes + bytes <= MAX_BYTES) {
      _cache.set(uuid, { meshes: cachedMeshes, bytes, lastUsed: Date.now() });
      _cacheBytes += bytes;
    }
    self.postMessage({ type: 'ready', uuid, meshes: idbEntry.meshes }, transferList(idbEntry.meshes));
    pushStats();
    return;
  }

  // 4. Network fetch + parse (GLB or OCCT depending on kind)
  const p = _fetchAndParse(uuid, token, projectSpace, kind);
  _inflight.set(uuid, p);
  try { await p; } finally { _inflight.delete(uuid); }
}

self.onmessage = async ({ data }) => {
  if (data.type === 'stats') { pushStats(); return; }
  if (data.type === 'clear') {
    _cache.clear();
    _cacheBytes = 0;
    if (data.idb) {
      getDb().then(db => {
        db.transaction(IDB_STORE, 'readwrite').objectStore(IDB_STORE).clear();
      }).catch(() => {});
    }
    pushStats();
    return;
  }
  if (data.type === 'setMaxBytes') {
    MAX_BYTES = data.maxBytes;
    evict(0);
    pushStats();
    return;
  }
  if (data.type !== 'load') return;
  try {
    await loadPart(data.uuid, data.token, data.projectSpace, data.kind || 'design');
  } catch (e) {
    self.postMessage({ type: 'log', level: 'error', message: `[3D] Error loading ${data.uuid}: ${e.message}` });
    self.postMessage({ type: 'error', uuid: data.uuid, message: e.message });
    pushStats();
  }
};
