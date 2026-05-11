// psm-api/ui/src/psmApi.js — PSM service API module.
// Owns all /api/psm/* endpoint calls. Uses shellAPI.http so auth + tracing
// are handled centrally by the shell; no auth token management here.
//
// Call initPsmApi(shellAPI) once in the plugin init() before any API call.

let _http = null;
export function initPsmApi(shellAPI) { _http = shellAPI.http; }

const r = (method, path, body) => _http.serviceRequest('psm', method, path, body);

export const psmApi = {
  // ── Node read ────────────────────────────────────────────────────
  // txId: show OPEN draft; versionNumber: read historical version (read-only)
  getNodeDescription: (_userId, nodeId, txId, versionNumber) => {
    const parts = [];
    if (txId)          parts.push(`txId=${txId}`);
    if (versionNumber) parts.push(`versionNumber=${versionNumber}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return r('GET', `/nodes/${nodeId}/description${qs}`);
  },

  getVersionHistory:   (_userId, nodeId)          => r('GET', `/nodes/${nodeId}/versions`),
  getVersionDiff:      (_userId, nodeId, v1, v2)  => r('GET', `/nodes/${nodeId}/versions/diff?v1=${v1}&v2=${v2}`),
  getSignatures:       (_userId, nodeId)          => r('GET', `/nodes/${nodeId}/signatures`),
  getSignatureHistory: (_userId, nodeId)          => r('GET', `/nodes/${nodeId}/signatures/history`),
  getComments:         (_userId, nodeId)          => r('GET', `/nodes/${nodeId}/comments`),
  getChildLinks:       (_userId, nodeId)          => r('GET', `/nodes/${nodeId}/links/children`),
  getParentLinks:      (_userId, nodeId)          => r('GET', `/nodes/${nodeId}/links/parents`),

  // ── Node write ───────────────────────────────────────────────────
  updateExternalId: (_userId, nodeId, externalId) =>
    r('PATCH', `/nodes/${nodeId}/external-id`, { externalId }),

  addComment: (_userId, nodeId, nodeVersionId, text, parentCommentId, attributeName) =>
    r('POST', `/nodes/${nodeId}/comments`, {
      nodeVersionId,
      text,
      ...(parentCommentId ? { parentCommentId } : {}),
      ...(attributeName   ? { attributeName }   : {}),
    }),

  createNode: (_userId, nodeTypeId, attributes, logicalId, externalId) =>
    r('POST', `/actions/create_node/${nodeTypeId}`, {
      parameters: {
        ...attributes,
        _logicalId:  logicalId  || null,
        _externalId: externalId || null,
      },
    }),

  // ── Sources ──────────────────────────────────────────────────────
  getSources:     (_userId) => r('GET', '/sources'),

  getSourceTypes: (_userId, sourceCode) => r('GET', `/sources/${sourceCode}/types`),

  getSourceKeys: (_userId, sourceId, type, q = '', limit = 25) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (q)    params.set('q', q);
    params.set('limit', String(limit));
    return r('GET', `/sources/${encodeURIComponent(sourceId)}/keys?${params.toString()}`);
  },

  suggestSourceKeys: (_userId, sourceCode, type, query, limit = 25) => {
    const qs = new URLSearchParams();
    if (type)  qs.set('type', type);
    if (query) qs.set('q', query);
    qs.set('limit', String(limit));
    return r('GET', `/sources/${sourceCode}/keys?${qs.toString()}`);
  },

  // ── Baselines ────────────────────────────────────────────────────
  listBaselines: (_userId) => r('GET', '/baselines'),

  createBaseline: (_userId, rootNodeId, name, description) =>
    r('POST', '/baselines', { rootNodeId, name, description }),

  getBaselineContent: (_userId, baselineId) => r('GET', `/baselines/${baselineId}/content`),

  // ── Dashboard ────────────────────────────────────────────────────
  getDashboardTransaction: (_userId) => r('GET', '/dashboard/transaction'),
  getDashboardWorkItems:   (_userId) => r('GET', '/dashboard/workitems'),
};
