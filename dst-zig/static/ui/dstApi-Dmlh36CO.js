let i = null, a = null;
function p(t) {
  i = t.http, a = t;
}
const n = (t, e, r) => i.serviceRequest("dst", t, e, r), f = {
  // ── List / metadata ───────────────────────────────────────────────
  list: (t = 0, e = 50) => n("GET", `/data?page=${t}&size=${e}`),
  getMetadata: (t) => n("GET", `/data/${t}/metadata`),
  // Detail descriptor (title + fields + actions) — drives GenericDetailEditor
  getDetail: (t) => n("GET", `/data/${t}/detail`),
  // ── Upload ────────────────────────────────────────────────────────
  upload: (t, e, r) => {
    const d = new FormData();
    return d.append("file", t), e && d.append("name", e), i.serviceUpload("dst", "/data", d, r ?? (() => {
    }));
  },
  // ── Reference management ──────────────────────────────────────────
  ref: (t) => n("POST", `/data/${t}/ref`),
  unref: (t) => n("POST", `/data/${t}/unref`),
  // ── Stats ─────────────────────────────────────────────────────────
  getStats: () => n("GET", "/stats"),
  // Binary download — serviceRequest handles JSON only, so fetch with auth directly.
  downloadFile: async (t) => {
    var s, c;
    const e = (s = a == null ? void 0 : a.getToken) == null ? void 0 : s.call(a), r = (c = a == null ? void 0 : a.getProjectSpaceId) == null ? void 0 : c.call(a), d = {};
    e && (d.Authorization = `Bearer ${e}`), r && (d["X-PLM-ProjectSpace"] = r);
    const o = await fetch(`/api/dst/data/${t}`, { method: "GET", headers: d });
    if (!o.ok) throw new Error(`Download failed: HTTP ${o.status}`);
    return o.arrayBuffer();
  }
};
export {
  f as d,
  p as i
};
