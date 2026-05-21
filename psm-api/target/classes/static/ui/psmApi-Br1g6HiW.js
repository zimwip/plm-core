let d = null;
function a(s) {
  d = s.http;
}
const r = (s, e, t) => d.serviceRequest("psm", s, e, t), u = {
  // ── Node read ────────────────────────────────────────────────────
  // txId: show OPEN draft; versionNumber: read historical version (read-only)
  getNodeDescription: (s, e, t, n) => {
    const i = [];
    t && i.push(`txId=${t}`), n && i.push(`versionNumber=${n}`);
    const o = i.length ? `?${i.join("&")}` : "";
    return r("GET", `/nodes/${e}/description${o}`);
  },
  getVersionHistory: (s, e) => r("GET", `/nodes/${e}/versions`),
  getVersionDiff: (s, e, t, n) => r("GET", `/nodes/${e}/versions/diff?v1=${t}&v2=${n}`),
  getSignatures: (s, e) => r("GET", `/nodes/${e}/signatures`),
  getSignatureHistory: (s, e) => r("GET", `/nodes/${e}/signatures/history`),
  getComments: (s, e) => r("GET", `/nodes/${e}/comments`),
  getChildLinks: (s, e) => r("GET", `/nodes/${e}/links/children`),
  getParentLinks: (s, e) => r("GET", `/nodes/${e}/links/parents`),
  // ── Node write ───────────────────────────────────────────────────
  updateExternalId: (s, e, t) => r("PATCH", `/nodes/${e}/external-id`, { externalId: t }),
  addComment: (s, e, t, n, i, o) => r("POST", `/nodes/${e}/comments`, {
    nodeVersionId: t,
    text: n,
    ...i ? { parentCommentId: i } : {},
    ...o ? { attributeName: o } : {}
  }),
  createNode: (s, e, t, n, i) => r("POST", `/actions/create_node/${e}`, {
    parameters: {
      ...t,
      _logicalId: n || null,
      _externalId: i || null
    }
  }),
  // ── Sources ──────────────────────────────────────────────────────
  getSources: (s) => r("GET", "/sources"),
  getSourceTypes: (s, e) => r("GET", `/sources/${e}/types`),
  getSourceKeys: (s, e, t, n = "", i = 25) => {
    const o = new URLSearchParams();
    return t && o.set("type", t), n && o.set("q", n), o.set("limit", String(i)), r("GET", `/sources/${encodeURIComponent(e)}/keys?${o.toString()}`);
  },
  suggestSourceKeys: (s, e, t, n, i = 25) => {
    const o = new URLSearchParams();
    return t && o.set("type", t), n && o.set("q", n), o.set("limit", String(i)), r("GET", `/sources/${e}/keys?${o.toString()}`);
  },
  // ── Baselines ────────────────────────────────────────────────────
  listBaselines: (s) => r("GET", "/baselines"),
  createBaseline: (s, e, t, n) => r("POST", "/baselines", { rootNodeId: e, name: t, description: n }),
  getBaselineContent: (s, e) => r("GET", `/baselines/${e}/content`),
  // ── Dashboard ────────────────────────────────────────────────────
  getDashboardTransaction: (s) => r("GET", "/dashboard/transaction"),
  getDashboardWorkItems: (s) => r("GET", "/dashboard/workitems")
};
export {
  a as i,
  u as p
};
