let d = null;
function a(s) {
  d = s.http;
}
const t = (s, e, r) => d.serviceRequest("psm", s, e, r), u = {
  // ── Type descriptors (static, cached by caller) ─────────────────
  getNodeTypeDescriptor: (s) => t("GET", `/item-type/${s}`),
  getLinkTypeDescriptor: (s) => t("GET", `/link-type/${s}`),
  // ── Node read ────────────────────────────────────────────────────
  // txId: show OPEN draft; versionNumber: read historical version (read-only)
  getNodeDescription: (s, e, r, n) => {
    const o = [];
    r && o.push(`txId=${r}`), n && o.push(`versionNumber=${n}`);
    const i = o.length ? `?${o.join("&")}` : "";
    return t("GET", `/nodes/${e}/description${i}`);
  },
  getVersionHistory: (s, e) => t("GET", `/nodes/${e}/versions`),
  getVersionDiff: (s, e, r, n) => t("GET", `/nodes/${e}/versions/diff?v1=${r}&v2=${n}`),
  getSignatures: (s, e) => t("GET", `/nodes/${e}/signatures`),
  getSignatureHistory: (s, e) => t("GET", `/nodes/${e}/signatures/history`),
  getComments: (s, e) => t("GET", `/nodes/${e}/comments`),
  getChildLinks: (s, e) => t("GET", `/nodes/${e}/links/children`),
  getParentLinks: (s, e) => t("GET", `/nodes/${e}/links/parents`),
  // ── Node write ───────────────────────────────────────────────────
  updateExternalId: (s, e, r) => t("PATCH", `/nodes/${e}/external-id`, { externalId: r }),
  addComment: (s, e, r, n, o, i) => t("POST", `/nodes/${e}/comments`, {
    nodeVersionId: r,
    text: n,
    ...o ? { parentCommentId: o } : {},
    ...i ? { attributeName: i } : {}
  }),
  createNode: (s, e, r, n, o) => t("POST", `/actions/create_node/${e}`, {
    parameters: {
      ...r,
      _logicalId: n || null,
      _externalId: o || null
    }
  }),
  // ── Sources ──────────────────────────────────────────────────────
  getSources: (s) => t("GET", "/sources"),
  getSourceTypes: (s, e) => t("GET", `/sources/${e}/types`),
  getSourceKeys: (s, e, r, n = "", o = 25) => {
    const i = new URLSearchParams();
    return r && i.set("type", r), n && i.set("q", n), i.set("limit", String(o)), t("GET", `/sources/${encodeURIComponent(e)}/keys?${i.toString()}`);
  },
  suggestSourceKeys: (s, e, r, n, o = 25) => {
    const i = new URLSearchParams();
    return r && i.set("type", r), n && i.set("q", n), i.set("limit", String(o)), t("GET", `/sources/${e}/keys?${i.toString()}`);
  },
  // ── Baselines ────────────────────────────────────────────────────
  listBaselines: (s) => t("GET", "/baselines"),
  createBaseline: (s, e, r, n) => t("POST", "/baselines", { rootNodeId: e, name: r, description: n }),
  getBaselineContent: (s, e) => t("GET", `/baselines/${e}/content`),
  // ── Dashboard ────────────────────────────────────────────────────
  getDashboardTransaction: (s) => t("GET", "/dashboard/transaction"),
  getDashboardWorkItems: (s) => t("GET", "/dashboard/workitems")
};
export {
  a as i,
  u as p
};
