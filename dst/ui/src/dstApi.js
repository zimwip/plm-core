// dst/ui/src/dstApi.js — DST service API module.
// Owns all /api/dst/* endpoint calls.
// Call initDstApi(shellAPI) once in the plugin init() before any API call.

let _http = null;
let _shellAPI = null;

export function initDstApi(shellAPI) {
  _http      = shellAPI.http;
  _shellAPI  = shellAPI;
}

const r = (method, path, body) => _http.serviceRequest('dst', method, path, body);

export const dstApi = {
  // ── List / metadata ───────────────────────────────────────────────
  list:        (page = 0, size = 50) => r('GET', `/data?page=${page}&size=${size}`),
  getMetadata: (id) => r('GET', `/data/${id}/metadata`),

  // Detail descriptor (title + fields + actions) — drives GenericDetailEditor
  getDetail: (id) => r('GET', `/data/${id}/detail`),

  // ── Upload ────────────────────────────────────────────────────────
  upload: (file, name, onProgress) => {
    const fd = new FormData();
    fd.append('file', file);
    if (name) fd.append('name', name);
    return _http.serviceUpload('dst', '/data', fd, onProgress ?? (() => {}));
  },

  // ── Reference management ──────────────────────────────────────────
  ref:   (id) => r('POST', `/data/${id}/ref`),
  unref: (id) => r('POST', `/data/${id}/unref`),

  // ── Stats ─────────────────────────────────────────────────────────
  getStats: () => r('GET', '/stats'),

  // Binary download — serviceRequest handles JSON only, so fetch with auth directly.
  downloadFile: async (id) => {
    const token = _shellAPI?.getToken?.();
    const ps    = _shellAPI?.getProjectSpaceId?.();
    const headers = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    if (ps)    headers['X-PLM-ProjectSpace'] = ps;
    const res = await fetch(`/api/dst/data/${id}`, { method: 'GET', headers });
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    return res.arrayBuffer();
  },
};
