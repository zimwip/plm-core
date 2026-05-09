import initOcct from 'occt-import-js';

let _occt = null;

const MAX_BYTES = 256 * 1024 * 1024;
let _cacheBytes = 0;
const _cache = new Map(); // uuid → { meshes, bytes, lastUsed }

async function getOcct() {
  if (!_occt) _occt = await initOcct({ locateFile: () => '/occt/occt-import-js.wasm' });
  return _occt;
}

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

function pushStats() {
  self.postMessage({ type: 'stats', entries: _cache.size, cacheBytes: _cacheBytes, maxBytes: MAX_BYTES });
}

async function loadPart(uuid, token, projectSpace) {
  if (_cache.has(uuid)) {
    const entry = _cache.get(uuid);
    entry.lastUsed = Date.now();
    const meshes = cloneMeshes(entry.meshes);
    self.postMessage({ type: 'ready', uuid, meshes }, transferList(meshes));
    return;
  }

  self.postMessage({ type: 'progress', uuid, phase: 'downloading' });
  const headers = {};
  if (token)        headers['Authorization']     = `Bearer ${token}`;
  if (projectSpace) headers['X-PLM-ProjectSpace'] = projectSpace;
  const res = await fetch(`/api/dst/data/${uuid}`, { headers });
  if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
  const buf = await res.arrayBuffer();

  self.postMessage({ type: 'progress', uuid, phase: 'parsing' });
  const occt   = await getOcct();
  const result = occt.ReadStepFile(new Uint8Array(buf), null);
  if (!result?.success || !result.meshes?.length) throw new Error('No geometry found');

  const meshes = result.meshes.map(m => ({
    positions: new Float32Array(m.attributes.position.array),
    normals:   m.attributes?.normal ? new Float32Array(m.attributes.normal.array) : null,
    indices:   m.index              ? new Uint32Array(m.index.array)              : null,
    color:     m.color ?? null,
  }));

  const bytes = entryBytes(meshes);
  evict(bytes);
  if (_cacheBytes + bytes <= MAX_BYTES) {
    _cache.set(uuid, { meshes: cloneMeshes(meshes), bytes, lastUsed: Date.now() });
    _cacheBytes += bytes;
  }

  self.postMessage({ type: 'ready', uuid, meshes }, transferList(meshes));
  pushStats();
}

self.onmessage = async ({ data }) => {
  if (data.type === 'stats') { pushStats(); return; }
  if (data.type !== 'load') return;
  try {
    await loadPart(data.uuid, data.token, data.projectSpace);
  } catch (e) {
    self.postMessage({ type: 'error', uuid: data.uuid, message: e.message });
    pushStats();
  }
};
