// services/api.js — Couche d'accès à l'API PLM backend

import { recordApiCall } from './apiStats';

const BASE_PLATFORM = '/api/platform';

// Derive service base URL from service code by convention (/api/<serviceCode>).
// Only BASE_PLATFORM and /api/spe (auth) are hardcoded — all others are
// resolved at call-site via this helper so no hardcoded service codes leak
// into top-level constants.
function serviceBase(code) { return `/api/${code}`; }

export class ApiError extends Error {
  constructor(status, message, detail) {
    super(message);
    this.name  = 'ApiError';
    this.status = status;
    this.detail = detail;
  }
}

/**
 * Swallows ApiErrors whose status code is in the given list, returning null.
 * Any other error (different status or non-ApiError) is re-thrown.
 * Usage: const res = await swallowStatus(kvApi.getSingle(...), 404);
 */
export function swallowStatus(promise, ...statuses) {
  return promise.catch(err => {
    if (err instanceof ApiError && statuses.includes(err.status)) return null;
    throw err;
  });
}

// Wrap fetch to record timing + status into apiStats.
export function uploadWithProgress(url, method, headers, formData, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url);
    Object.entries(headers).forEach(([k, v]) => xhr.setRequestHeader(k, v));
    xhr.upload.addEventListener('progress', e => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    });
    xhr.onload = () => {
      const text = () => Promise.resolve(xhr.responseText);
      const json = () => Promise.resolve(JSON.parse(xhr.responseText));
      resolve({ ok: xhr.status >= 200 && xhr.status < 300, status: xhr.status, text, json });
    };
    xhr.onerror = () => reject(new Error('Network error during upload'));
    xhr.onabort = () => reject(new Error('Upload cancelled'));
    xhr.send(formData);
  });
}

async function timedFetch(url, init, method) {
  const t0 = performance.now();
  let res, err;
  try {
    res = await fetch(url, init);
  } catch (e) {
    err = e;
  }
  const durationMs = performance.now() - t0;
  const endpoint = url.split('?')[0];
  if (err) {
    recordApiCall({ method, endpoint, status: 0, durationMs, ok: false });
    throw err;
  }
  recordApiCall({ method, endpoint, status: res.status, durationMs, ok: res.ok });
  return res;
}

// Coerce a list endpoint response into a uniform page shape.
// Handles three native shapes: Spring Page ({content, totalElements, ...}),
// wrapped ({items: [...]}), or flat array. Anything unrecognised → empty page.
function normalisePage(body, page, size) {
  if (Array.isArray(body)) {
    return { items: body, totalElements: body.length, totalPages: 1, page, size };
  }
  if (body && Array.isArray(body.content)) {
    return {
      items: body.content,
      totalElements: body.totalElements ?? body.content.length,
      totalPages: body.totalPages ?? 1,
      page: body.number ?? page,
      size: body.size ?? size,
    };
  }
  if (body && Array.isArray(body.items)) {
    return {
      items: body.items,
      totalElements: body.totalElements ?? body.items.length,
      totalPages: body.totalPages ?? 1,
      page: body.page ?? page,
      size: body.size ?? size,
    };
  }
  return { items: [], totalElements: 0, totalPages: 0, page, size };
}

// Module-level project space context — updated by App when user selects a space
let _projectSpaceId = null;
export function setProjectSpaceId(id) { _projectSpaceId = id; }
export function getProjectSpaceId()    { return _projectSpaceId; }

// Global error handler — set once by App so every unhandled API error shows a toast
let _onError = null;
export function setApiErrorHandler(fn) { _onError = fn; }

// ── Session token (issued by spe-api /auth/login) ──────────────────
let _sessionToken = null;
export function setSessionToken(t) { _sessionToken = t; }
export function getSessionToken() { return _sessionToken; }

// Callback invoked when a request returns 401. Must return Promise<string|null>
// resolving to a new session token (or null if re-auth failed).
let _onAuthExpired = null;
export function setAuthExpiredHandler(fn) { _onAuthExpired = fn; }

// ── Auth API (public — does not require a session token) ───────────
export const authApi = {
  login: async (userId, projectSpaceId) => {
    const res = await timedFetch('/api/spe/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, projectSpaceId }),
    }, 'POST');
    if (!res.ok) {
      const payload = await res.json().catch(() => ({ error: res.statusText }));
      throw new Error(payload.error || `HTTP ${res.status}`);
    }
    const body = await res.json();
    _sessionToken = body.token;
    return body;
  },
  logout: async () => {
    const token = _sessionToken;
    _sessionToken = null;
    if (!token) return;
    try {
      await timedFetch('/api/spe/auth/logout', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
      }, 'POST');
    } catch { /* best effort */ }
  },
};

// ── Backend reconnect detection ────────────────────────────────────
let _backendDown = false;
let _pollTimer   = null;

function onBackendUnreachable() {
  if (_backendDown) return;
  _backendDown = true;

  // Inject a fixed banner so the user knows what's happening
  if (!document.getElementById('plm-reconnect-banner')) {
    const el = document.createElement('div');
    el.id = 'plm-reconnect-banner';
    el.style.cssText = [
      'position:fixed', 'top:0', 'left:0', 'right:0', 'z-index:99999',
      'background:#b45309', 'color:#fff', 'text-align:center',
      'padding:8px 16px', 'font-size:13px', 'font-family:monospace',
      'letter-spacing:.02em', 'box-shadow:0 2px 8px rgba(0,0,0,.4)',
    ].join(';');
    el.textContent = '⟳  Backend is restarting — reconnecting…';
    document.body.prepend(el);
  }

  // Poll /actuator/health every 3 s; reload when it responds 200
  _pollTimer = setInterval(async () => {
    try {
      const res = await fetch('/actuator/health', { cache: 'no-store' });
      if (res.ok) {
        clearInterval(_pollTimer);
        window.location.reload();
      }
    } catch { /* still down — keep polling */ }
  }, 3000);
}

// Generic gateway call. Used by descriptor-driven detail / action paths
// that already carry the full {@code /api/<svc>/...} path. Same auth +
// project-space + retry-on-401 semantics as {@link doFetch}, no base URL
// prefix or path manipulation.
async function gatewayJson(method, fullPath, body, isRetry = false) {
  const h = {};
  if (_sessionToken) h['Authorization'] = `Bearer ${_sessionToken}`;
  if (_projectSpaceId) h['X-PLM-ProjectSpace'] = _projectSpaceId;
  if (body !== undefined) h['Content-Type'] = 'application/json';

  let res;
  try {
    res = await timedFetch(fullPath, {
      method,
      headers: h,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }, method);
  } catch {
    onBackendUnreachable();
    const err = new Error('Backend unreachable');
    if (_onError) _onError(err);
    throw err;
  }

  if (res.status === 401 && !isRetry && _onAuthExpired) {
    const newToken = await _onAuthExpired().catch(() => null);
    if (newToken) {
      _sessionToken = newToken;
      return gatewayJson(method, fullPath, body, true);
    }
  }

  if (!res.ok) {
    if (res.status === 502 || res.status === 503) onBackendUnreachable();
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    const msg = payload.violations?.length
      ? payload.violations.map(v => typeof v === 'string' ? v : v.message).join('; ')
      : (payload.error || payload.message || `HTTP ${res.status}`);
    const err = new Error(msg);
    err.status = res.status;
    err.detail = payload;
    // Per-field violations are handled inline by the caller — skip global error modal
    const hasFieldViolations = payload.violations?.some(v => v?.attrCode);
    if (_onError && !hasFieldViolations) _onError(err);
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Core request helper — session token carries user identity.
// On 401 it calls _onAuthExpired to obtain a fresh token and retries once.
async function doFetch(baseUrl, method, path, body, { txId, psOverride } = {}, isRetry = false) {
  const h = { 'Content-Type': 'application/json' };
  if (_sessionToken) h['Authorization'] = `Bearer ${_sessionToken}`;
  const ps = psOverride ?? _projectSpaceId;
  if (ps) h['X-PLM-ProjectSpace'] = ps;
  if (txId) h['X-PLM-Tx'] = txId;

  let res;
  try {
    res = await timedFetch(`${baseUrl}${path}`, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
    }, method);
  } catch {
    onBackendUnreachable();
    const err = new Error('Backend unreachable');
    if (_onError) _onError(err);
    throw err;
  }

  if (res.status === 401 && !isRetry && _onAuthExpired) {
    const newToken = await _onAuthExpired().catch(() => null);
    if (newToken) {
      _sessionToken = newToken;
      return doFetch(baseUrl, method, path, body, { txId, psOverride }, true);
    }
  }

  if (!res.ok) {
    if (res.status === 502 || res.status === 503) onBackendUnreachable();
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    const msg = payload.violations?.length
      ? payload.violations.map(v => typeof v === 'string' ? v : v.message).join('; ')
      : (payload.error || payload.message || `HTTP ${res.status}`);
    const err = new ApiError(res.status, msg, payload);
    const hasFieldViolations = payload.violations?.some(v => v?.attrCode);
    if (_onError && !hasFieldViolations) _onError(err);
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// userId args kept for API compatibility but no longer sent — the session token identifies the user.
async function pnoRequest(method, path, _userId, body, opts = {}) {
  return doFetch(serviceBase('pno'), method, path, body, opts);
}

async function platformRequest(method, path, _userId, body) {
  return doFetch(BASE_PLATFORM, method, path, body);
}

// Fetch item detail via the registered GetAction. Used by the shell to populate
// tab data before handing off to the editor plugin.
// extraParams (e.g. { txId }) are appended as query-string; null/undefined values skipped.
export function fetchItemDetail(serviceCode, getAction, itemId, extraParams = {}) {
  let path = getAction.path.replace('{id}', itemId);
  const qs = Object.entries(extraParams)
    .filter(([, v]) => v != null)
    .map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
    .join('&');
  if (qs) path += `?${qs}`;
  return gatewayJson(getAction.httpMethod || 'GET', serviceBase(serviceCode) + path, undefined);
}

// Generic item-create dispatcher used by the federated create modal.
// `values` is the form payload, possibly including File objects for MULTIPART.
// `descriptor.create.path` is service-relative (e.g. /actions/create_node/nt-part).
// serviceBase(descriptor.serviceCode) prepends the gateway prefix (/api/<code>).
async function submitItemCreate(descriptor, values) {
  const action = descriptor.create;
  const url = serviceBase(descriptor.serviceCode) + action.path;
  const method = (action.httpMethod || 'POST').toUpperCase();
  const headers = {};
  if (_sessionToken) headers['Authorization'] = `Bearer ${_sessionToken}`;
  if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;

  let body;
  if ((action.bodyShape || 'RAW').toUpperCase() === 'MULTIPART') {
    const fd = new FormData();
    for (const [k, v] of Object.entries(values || {})) {
      if (v == null || v === '') continue;
      fd.append(k, v);
    }
    body = fd; // browser sets multipart Content-Type with boundary
  } else {
    headers['Content-Type'] = 'application/json';
    const payload = (action.bodyShape || 'RAW').toUpperCase() === 'WRAPPED'
      ? { parameters: values || {} }
      : (values || {});
    body = JSON.stringify(payload);
  }

  const res = await timedFetch(url, { method, headers, body }, method);
  if (!res.ok) {
    const detail = await res.json().catch(() => ({ error: res.statusText }));
    const msg = detail.violations?.length
      ? detail.violations.join('; ')
      : (detail.error || detail.message || `HTTP ${res.status}`);
    const err = new Error(msg);
    err.detail = detail;
    if (_onError) _onError(err);
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

async function request(method, path, _userId, body, psOverride) {
  return doFetch(serviceBase('psm'), method, path, body, { psOverride });
}

async function adminRequest(method, path, _userId, body) {
  return doFetch(serviceBase('psa'), method, path, body);
}

export function serviceRequest(serviceCode, method, path, body) {
  return doFetch(serviceBase(serviceCode), method, path, body);
}

// ── Platform status surface ────────────────────────────────────────
// All cluster-state endpoints (status, nats, environment registry,
// expected-services config) live on platform-api now — see
// project_central_control_plane.md. The `speApi` name is kept for call-site
// stability but every method targets `/api/platform/...` except auth, which
// remains on the gateway (spe-api mints/verifies session JWTs).
export const speApi = {
  getStatus: async () => {
    return doFetch(BASE_PLATFORM, 'GET', '/status');
  },
  // Tags served by platform-api (admin only).
  getRegistryTags: async () => {
    return doFetch(BASE_PLATFORM, 'GET', '/admin/registry/tags');
  },

  getEnvironment: async () => {
    return doFetch(BASE_PLATFORM, 'GET', '/admin/environment/expected-services');
  },
  updateEnvironment: async (expectedServices) => {
    return doFetch(BASE_PLATFORM, 'PUT', '/admin/environment/expected-services', { expectedServices });
  },
  addExpectedService: async (serviceCode) => {
    return doFetch(BASE_PLATFORM, 'POST', '/admin/environment/expected-services/services', { serviceCode });
  },
  removeExpectedService: async (serviceCode) => {
    return doFetch(BASE_PLATFORM, 'DELETE', `/admin/environment/expected-services/services/${serviceCode}`);
  },
  getNatsStatus: async () => {
    return doFetch(BASE_PLATFORM, 'GET', '/status/nats');
  },
};

// ── Nodes ──────────────────────────────────────────────────────────

export const api = {
  // Metadata keys (discovered from @Metadata annotations)
  getMetadataKeys: (userId, targetType) =>
    adminRequest('GET', targetType ? `/metamodel/metadata/keys/${targetType}` : '/metamodel/metadata/keys', userId),

  // Lister les types de noeuds disponibles
  getNodeTypes: (userId) =>
    adminRequest('GET', '/metamodel/nodetypes', userId),

  // Historique complet des versions d'un noeud
  getVersionHistory: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/versions`, userId),

  // Diff entre deux versions (par version_number)
  getVersionDiff: (userId, nodeId, v1, v2) =>
    request('GET', `/nodes/${nodeId}/versions/diff?v1=${v1}&v2=${v2}`, userId),

  // Créer un noeud (via action dispatch)
  createNode: (userId, nodeTypeId, attributes, logicalId, externalId) =>
    request('POST', `/actions/create_node/${nodeTypeId}`, userId, {
      parameters: {
        ...attributes,
        _logicalId:  logicalId  || null,
        _externalId: externalId || null,
      },
    }),

  // Description complète (Server-Driven UI) — txId optionnel pour voir les versions OPEN
  // versionNumber optionnel pour voir une version historique (lecture seule)
  getNodeDescription: (userId, nodeId, txId, versionNumber) => {
    const parts = [];
    if (txId)          parts.push(`txId=${txId}`);
    if (versionNumber) parts.push(`versionNumber=${versionNumber}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return request('GET', `/nodes/${nodeId}/description${qs}`, userId);
  },

  updateExternalId: (userId, nodeId, externalId) =>
    request('PATCH', `/nodes/${nodeId}/external-id`, userId, { externalId }),

  // Signatures — lecture
  getSignatures: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/signatures`, userId),
  getSignatureHistory: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/signatures/history`, userId),

  // Comments
  getComments: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/comments`, userId),

  addComment: (userId, nodeId, nodeVersionId, text, parentCommentId, attributeName) =>
    request('POST', `/nodes/${nodeId}/comments`, userId, {
      nodeVersionId,
      text,
      ...(parentCommentId ? { parentCommentId } : {}),
      ...(attributeName   ? { attributeName }   : {}),
    }),

  getLinkTypes: (userId) =>
    adminRequest('GET', '/metamodel/linktypes', userId),

  getNodeTypeLinkTypes: (userId, nodeTypeId) =>
    adminRequest('GET', `/metamodel/nodetypes/${nodeTypeId}/linktypes`, userId),

  // Service registry / federation overview — proxied via platform-api so the
  // browser doesn't need spe-api's X-Service-Secret. Admin only.
  getRegistryGrouped: (userId) =>
    platformRequest('GET', '/admin/registry/grouped', userId),
  getRegistryTagsAdmin: (userId) =>
    platformRequest('GET', '/admin/registry/tags', userId),
  getRegistryOverview: (userId) =>
    platformRequest('GET', '/admin/registry/overview', userId),

  // Federated item catalog from platform-api: one descriptor per item with
  // applicable actions (create / list / get) attached. Each action carries a
  // gateway-relative path; the frontend prepends /api/<serviceCode>.
  getItems: (userId) =>
    platformRequest('GET', '/items', userId),

  // Generic gateway call (escape hatch for descriptor-declared detail and
  // action paths). Plugins should prefer this over service-specific helpers
  // so the surface stays uniform across user services.
  gatewayJson: (method, fullPath, body) => gatewayJson(method, fullPath, body),

  // Fetches a text file with a hard byte cap (default 64 KB).
  // Sends Range: bytes=0-N so well-behaved servers stop early.
  // Also caps the stream client-side to guard against servers that ignore Range.
  // Returns { text, truncated, totalBytes } — totalBytes from Content-Range header if available.
  gatewayRawText: async (url, maxBytes = 64 * 1024) => {
    const h = {};
    if (_sessionToken) h['Authorization'] = `Bearer ${_sessionToken}`;
    if (_projectSpaceId) h['X-PLM-ProjectSpace'] = _projectSpaceId;
    h['Range'] = `bytes=0-${maxBytes - 1}`;
    const res = await timedFetch(url, { method: 'GET', headers: h }, 'GET');
    if (!res.ok && res.status !== 206) throw new Error(`HTTP ${res.status}`);
    const reader = res.body.getReader();
    const chunks = [];
    let total = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) { chunks.push(value); total += value.length; }
      if (total >= maxBytes) { reader.cancel(); break; }
    }
    const buf = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) { buf.set(c, off); off += c.length; }
    const text = new TextDecoder('utf-8', { fatal: false }).decode(buf);
    const contentRange = res.headers.get('Content-Range'); // e.g. "bytes 0-65535/1234567"
    const totalBytes = contentRange ? parseInt(contentRange.split('/')[1], 10) || null : null;
    const truncated = res.status === 206 || total >= maxBytes;
    return { text, truncated, totalBytes };
  },

  // Generic federated list call: hits descriptor.list.path with paging.
  // Returns { items, totalElements, totalPages, page, size } so the caller
  // can render counts and paginate uniformly regardless of the source's
  // native response shape (flat array, Spring Page, or { items: [] }).
  fetchListableItems: async (_userId, descriptor, page = 0, size = 50) => {
    const listAction = descriptor.list;
    const base = descriptor.serviceCode ? serviceBase(descriptor.serviceCode) : '';
    const sep = listAction.path.includes('?') ? '&' : '?';
    const pageParam = listAction.pageParam || 'page';
    const sizeParam = listAction.sizeParam || 'size';
    const url = `${base}${listAction.path}${sep}${pageParam}=${page}&${sizeParam}=${size}`;
    const headers = {};
    if (_sessionToken) headers['Authorization'] = `Bearer ${_sessionToken}`;
    if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;
    const res = await timedFetch(url, { method: 'GET', headers }, 'GET');
    if (!res.ok) {
      const detail = await res.json().catch(() => ({ error: res.statusText }));
      const msg = detail.violations?.length
        ? detail.violations.join('; ')
        : (detail.error || detail.message || `HTTP ${res.status}`);
      const err = new Error(msg);
      err.detail = detail;
      throw err;
    }
    const text = await res.text();
    const body = text ? JSON.parse(text) : null;
    return normalisePage(body, page, size);
  },

  // Sources — federated source metadata (id, name, versioned, ...)
  getSources: (userId) =>
    request('GET', '/sources', userId),

  // Suggest target keys for a non-SELF source (resolver-driven autocomplete).
  getSourceKeys: (userId, sourceId, type, q = '', limit = 25) => {
    const params = new URLSearchParams();
    if (type) params.set('type', type);
    if (q)    params.set('q', q);
    params.set('limit', String(limit));
    return request('GET', `/sources/${encodeURIComponent(sourceId)}/keys?${params.toString()}`, userId);
  },

  // Liens d'un noeud — lecture
  getChildLinks: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/links/children`, userId),

  getParentLinks: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/links/parents`, userId),

  // Meta-model
  getLifecycles: (userId) =>
    adminRequest('GET', '/metamodel/lifecycles', userId),

  getLifecycleStates: (userId, id) =>
    adminRequest('GET', `/metamodel/lifecycles/${id}/states`, userId),

  getLifecycleTransitions: (userId, id) =>
    adminRequest('GET', `/metamodel/lifecycles/${id}/transitions`, userId),

  createLifecycle: (userId, body) =>
    adminRequest('POST', '/metamodel/lifecycles', userId, body),

  duplicateLifecycle: (userId, sourceId, name) =>
    adminRequest('POST', `/metamodel/lifecycles/${sourceId}/duplicate`, userId, { name }),

  deleteLifecycle: (userId, lifecycleId) =>
    adminRequest('DELETE', `/metamodel/lifecycles/${lifecycleId}`, userId),

  addLifecycleState: (userId, lifecycleId, body) =>
    adminRequest('POST', `/metamodel/lifecycles/${lifecycleId}/states`, userId, body),

  updateLifecycleState: (userId, lifecycleId, stateId, body) =>
    adminRequest('PUT', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, userId, body),

  deleteLifecycleState: (userId, lifecycleId, stateId) =>
    adminRequest('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, userId),

  // State actions (lifecycle state level)
  listLifecycleStateActions: (userId, lifecycleId, stateId) =>
    adminRequest('GET', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions`, userId),

  attachLifecycleStateAction: (userId, lifecycleId, stateId, instanceId, trigger, executionMode, displayOrder = 0) =>
    adminRequest('POST', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions`, userId, { instanceId, trigger, executionMode, displayOrder }),

  detachLifecycleStateAction: (userId, lifecycleId, stateId, actionId) =>
    adminRequest('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions/${actionId}`, userId),

  addLifecycleTransition: (userId, lifecycleId, body) =>
    adminRequest('POST', `/metamodel/lifecycles/${lifecycleId}/transitions`, userId, body),

  updateLifecycleTransition: (userId, lifecycleId, transId, body) =>
    adminRequest('PUT', `/metamodel/lifecycles/${lifecycleId}/transitions/${transId}`, userId, body),

  deleteLifecycleTransition: (userId, lifecycleId, transId) =>
    adminRequest('DELETE', `/metamodel/lifecycles/${lifecycleId}/transitions/${transId}`, userId),

  addTransitionSignatureRequirement: (userId, transId, roleId, displayOrder = 0) =>
    adminRequest('POST', `/metamodel/transitions/${transId}/signature-requirements`, userId, { roleId, displayOrder }),

  removeTransitionSignatureRequirement: (userId, transId, reqId) =>
    adminRequest('DELETE', `/metamodel/transitions/${transId}/signature-requirements/${reqId}`, userId),

  deleteNodeType: (userId, nodeTypeId) =>
    adminRequest('DELETE', `/metamodel/nodetypes/${nodeTypeId}`, userId),

  updateNodeTypeIdentity: (userId, nodeTypeId, body) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/identity`, userId, body),

  updateNodeTypeNumberingScheme: (userId, nodeTypeId, numberingScheme) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/numbering-scheme`, userId, { numberingScheme }),

  updateNodeTypeVersionPolicy: (userId, nodeTypeId, versionPolicy) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/version-policy`, userId, { versionPolicy }),

  updateNodeTypeCollapseHistory: (userId, nodeTypeId, collapseHistory) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/collapse-history`, userId, { collapseHistory }),

  updateNodeTypeLifecycle: (userId, nodeTypeId, lifecycleId) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/lifecycle`, userId, { lifecycleId: lifecycleId || null }),

  updateNodeTypeAppearance: (userId, nodeTypeId, color, icon) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/appearance`, userId, { color: color || null, icon: icon || null }),

  updateAttribute: (userId, nodeTypeId, attrId, body) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/attributes/${attrId}`, userId, body),

  deleteAttribute: (userId, nodeTypeId, attrId) =>
    adminRequest('DELETE', `/metamodel/nodetypes/${nodeTypeId}/attributes/${attrId}`, userId),

  updateLinkType: (userId, linkTypeId, body) =>
    adminRequest('PUT', `/metamodel/linktypes/${linkTypeId}`, userId, body),

  deleteLinkType: (userId, linkTypeId) =>
    adminRequest('DELETE', `/metamodel/linktypes/${linkTypeId}`, userId),

  getLinkTypeAttributes: (userId, linkTypeId) =>
    adminRequest('GET', `/metamodel/linktypes/${linkTypeId}/attributes`, userId),

  createLinkTypeAttribute: (userId, linkTypeId, body) =>
    adminRequest('POST', `/metamodel/linktypes/${linkTypeId}/attributes`, userId, body),

  updateLinkTypeAttribute: (userId, linkTypeId, attrId, body) =>
    adminRequest('PUT', `/metamodel/linktypes/${linkTypeId}/attributes/${attrId}`, userId, body),

  deleteLinkTypeAttribute: (userId, linkTypeId, attrId) =>
    adminRequest('DELETE', `/metamodel/linktypes/${linkTypeId}/attributes/${attrId}`, userId),

  // Link type cascade rules
  getLinkTypeCascades: (userId, linkTypeId) =>
    adminRequest('GET', `/metamodel/linktypes/${linkTypeId}/cascades`, userId),

  createLinkTypeCascade: (userId, linkTypeId, parentTransitionId, childFromStateId, childTransitionId) =>
    adminRequest('POST', `/metamodel/linktypes/${linkTypeId}/cascades`, userId, { parentTransitionId, childFromStateId, childTransitionId }),

  deleteLinkTypeCascade: (userId, linkTypeId, cascadeId) =>
    adminRequest('DELETE', `/metamodel/linktypes/${linkTypeId}/cascades/${cascadeId}`, userId),

  getNodeTypeAttributes: (userId, nodeTypeId) =>
    adminRequest('GET', `/metamodel/nodetypes/${nodeTypeId}/attributes`, userId),

  createNodeType: (userId, body) =>
    adminRequest('POST', '/metamodel/nodetypes', userId, body),

  updateNodeTypeParent: (userId, nodeTypeId, parentNodeTypeId) =>
    adminRequest('PUT', `/metamodel/nodetypes/${nodeTypeId}/parent`, userId, { parentNodeTypeId: parentNodeTypeId || null }),

  createAttribute: (userId, nodeTypeId, body) =>
    adminRequest('POST', `/metamodel/nodetypes/${nodeTypeId}/attributes`, userId, body),

  createLinkType: (userId, body) =>
    adminRequest('POST', '/metamodel/linktypes', userId, body),

  // Sources (psm-admin: full CRUD; psm-api: read-only runtime queries)
  getSourcesAdmin: (userId) =>
    adminRequest('GET', '/sources', userId),

  getSourceResolversAdmin: (userId) =>
    adminRequest('GET', '/sources/resolvers', userId),

  createSource: (userId, body) =>
    adminRequest('POST', '/sources', userId, body),

  updateSource: (userId, id, body) =>
    adminRequest('PUT', `/sources/${id}`, userId, body),

  deleteSource: (userId, id) =>
    adminRequest('DELETE', `/sources/${id}`, userId),

  // Import Contexts (psm-admin)
  getImportContexts:               () => adminRequest('GET',    '/admin/import-contexts'),
  createImportContext:              (body) => adminRequest('POST',   '/admin/import-contexts',      null, body),
  updateImportContext:              (id, body) => adminRequest('PUT', `/admin/import-contexts/${id}`, null, body),
  deleteImportContext:              (id) => adminRequest('DELETE', `/admin/import-contexts/${id}`),
  getImportAlgorithmInstances:     () => adminRequest('GET',    '/admin/import-contexts/algorithm-instances/import'),
  getValidationAlgorithmInstances: () => adminRequest('GET',    '/admin/import-contexts/algorithm-instances/validation'),

  // Runtime resolver-backed queries (psm-api)
  getSources: (userId) =>
    request('GET', '/sources', userId),

  getSourceTypes: (userId, sourceCode) =>
    request('GET', `/sources/${sourceCode}/types`, userId),

  suggestSourceKeys: (userId, sourceCode, type, query, limit = 25) => {
    const qs = new URLSearchParams();
    if (type)  qs.set('type', type);
    if (query) qs.set('q', query);
    qs.set('limit', String(limit));
    return request('GET', `/sources/${sourceCode}/keys?${qs.toString()}`, userId);
  },

  // Action registry (meta-model)
  getAllActions: (userId) =>
    adminRequest('GET', '/metamodel/actions', userId),

  getActionsForNodeType: (userId, nodeTypeId) =>
    adminRequest('GET', `/metamodel/nodetypes/${nodeTypeId}/actions`, userId),

  registerCustomAction: (userId, body) =>
    adminRequest('POST', '/metamodel/actions', userId, body),

  // Permission grants — authorization_policy rows are owned by pno-api (Phase D4+).
  getPermissionGrants: (userId, nodeTypeId, permissionCode, transitionId) =>
    pnoRequest('GET',
      `/nodetypes/${nodeTypeId}/permissions/${permissionCode}${transitionId ? `?transitionId=${encodeURIComponent(transitionId)}` : ''}`,
      userId),

  addPermissionGrant: (userId, nodeTypeId, permissionCode, roleId, transitionId) =>
    pnoRequest('POST',
      `/nodetypes/${nodeTypeId}/permissions/${permissionCode}`,
      userId, { roleId, transitionId: transitionId || null }),

  removePermissionGrant: (userId, nodeTypeId, permissionCode, roleId, transitionId) =>
    pnoRequest('DELETE',
      `/nodetypes/${nodeTypeId}/permissions/${permissionCode}`,
      userId, { roleId, transitionId: transitionId || null }),

  // Domains
  getDomains: (userId) =>
    adminRequest('GET', '/domains', userId),

  createDomain: (userId, body) =>
    adminRequest('POST', '/domains', userId, body),

  updateDomain: (userId, domainId, body) =>
    adminRequest('PUT', `/domains/${domainId}`, userId, body),

  deleteDomain: (userId, domainId) =>
    adminRequest('DELETE', `/domains/${domainId}`, userId),

  getDomainAttributes: (userId, domainId) =>
    adminRequest('GET', `/domains/${domainId}/attributes`, userId),

  createDomainAttribute: (userId, domainId, body) =>
    adminRequest('POST', `/domains/${domainId}/attributes`, userId, body),

  updateDomainAttribute: (userId, domainId, attrId, body) =>
    adminRequest('PUT', `/domains/${domainId}/attributes/${attrId}`, userId, body),

  deleteDomainAttribute: (userId, domainId, attrId) =>
    adminRequest('DELETE', `/domains/${domainId}/attributes/${attrId}`, userId),

  // Enums
  getEnums: (userId) =>
    adminRequest('GET', '/enums', userId),

  getEnumDetail: (userId, enumId) =>
    adminRequest('GET', `/enums/${enumId}`, userId),

  createEnum: (userId, body) =>
    adminRequest('POST', '/enums', userId, body),

  updateEnum: (userId, enumId, body) =>
    adminRequest('PUT', `/enums/${enumId}`, userId, body),

  deleteEnum: (userId, enumId) =>
    adminRequest('DELETE', `/enums/${enumId}`, userId),

  getEnumValues: (userId, enumId) =>
    adminRequest('GET', `/enums/${enumId}/values`, userId),

  addEnumValue: (userId, enumId, body) =>
    adminRequest('POST', `/enums/${enumId}/values`, userId, body),

  updateEnumValue: (userId, enumId, valueId, body) =>
    adminRequest('PUT', `/enums/${enumId}/values/${valueId}`, userId, body),

  deleteEnumValue: (userId, enumId, valueId) =>
    adminRequest('DELETE', `/enums/${enumId}/values/${valueId}`, userId),

  reorderEnumValues: (userId, enumId, valueIds) =>
    adminRequest('PUT', `/enums/${enumId}/values/reorder`, userId, valueIds),

  // Baselines
  listBaselines: (userId) =>
    request('GET', '/baselines', userId),

  createBaseline: (userId, rootNodeId, name, description) =>
    request('POST', '/baselines', userId, { userId, rootNodeId, name, description }),

  getBaselineContent: (userId, baselineId) =>
    request('GET', `/baselines/${baselineId}/content`, userId),

  // Roles — served by pno-api
  getRoles: (userId) =>
    pnoRequest('GET', '/roles', userId),

  createRole: (userId, name, description) =>
    pnoRequest('POST', '/roles', userId, { name, description }),

  updateRole: (userId, roleId, name, description) =>
    pnoRequest('PUT', `/roles/${roleId}`, userId, { name, description }),

  deleteRole: (userId, roleId) =>
    pnoRequest('DELETE', `/roles/${roleId}`, userId),

  // Project Spaces — served by pno-api
  // Filtered to spaces where userId holds a role (admins see all)
  listProjectSpaces: (userId) =>
    pnoRequest('GET', `/project-spaces${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`, userId),

  createProjectSpace: (userId, name, description) =>
    pnoRequest('POST', '/project-spaces', userId, { name, description }),

  deactivateProjectSpace: (userId, id) =>
    pnoRequest('DELETE', `/project-spaces/${id}`, userId),

  getProjectSpaceServiceTags: (userId, id) =>
    pnoRequest('GET', `/project-spaces/${id}/service-tags`, userId),

  setProjectSpaceServiceTags: (userId, id, serviceCode, tags) =>
    pnoRequest('PUT', `/project-spaces/${id}/service-tags/${serviceCode}`, userId, { tags }),

  setProjectSpaceIsolated: (userId, id, isolated) =>
    pnoRequest('PUT', `/project-spaces/${id}/isolated`, userId, { isolated }),

  // Users — served by pno-api
  listUsers: (userId) =>
    pnoRequest('GET', '/users', userId),

  getUser: (userId, targetUserId) =>
    pnoRequest('GET', `/users/${targetUserId}`, userId),

  updateUser: (userId, targetUserId, displayName, email) =>
    pnoRequest('PUT', `/users/${targetUserId}`, userId, { displayName, email }),

  createUser: (userId, username, displayName, email) =>
    pnoRequest('POST', '/users', userId, { username, displayName, email }),

  deactivateUser: (userId, targetUserId) =>
    pnoRequest('DELETE', `/users/${targetUserId}`, userId),

  getUserRoles: (userId, targetUserId, projectSpaceId) =>
    pnoRequest('GET', `/users/${targetUserId}/roles${projectSpaceId ? `?projectSpaceId=${encodeURIComponent(projectSpaceId)}` : ''}`, userId),

  assignRole: (userId, targetUserId, roleId, projectSpaceId) =>
    pnoRequest('POST', `/users/${targetUserId}/roles/${roleId}?projectSpaceId=${encodeURIComponent(projectSpaceId)}`, userId),

  removeRole: (userId, targetUserId, roleId, projectSpaceId) =>
    pnoRequest('DELETE', `/users/${targetUserId}/roles/${roleId}?projectSpaceId=${encodeURIComponent(projectSpaceId)}`, userId),

  setUserAdmin: (userId, targetUserId, isAdmin) =>
    pnoRequest('PUT', `/users/${targetUserId}/admin`, userId, { isAdmin }),

  /** Returns { userId, username, isAdmin, roleIds } for the given user scoped to a project space. */
  getUserContext: (userId, projectSpaceId) =>
    pnoRequest('GET', `/users/${userId}/context${projectSpaceId ? `?projectSpaceId=${encodeURIComponent(projectSpaceId)}` : ''}`, null),

  // ── Dashboard ────────────────────────────────────────────────────
  /** Open TX summary for current user. Returns null (204) if no open tx. */
  getDashboardTransaction: (userId) =>
    request('GET', '/dashboard/transaction', userId),

  /** Last N modified nodes with available actions, sorted by action count. */
  getDashboardWorkItems: (userId) =>
    request('GET', '/dashboard/workitems', userId),

  // ── Permissions & Policies (Access Rights section) ──────────────────

  /** Returns full permission catalog: code, scope, displayName. Owned by pno-api. */
  listPermissions: (userId) =>
    pnoRequest('GET', '/permissions', userId),

  /** Creates a new permission. Owned by pno-api. */
  createPermission: (userId, permissionCode, scope, displayName, description, displayOrder) =>
    pnoRequest('POST', '/permissions', userId, { permissionCode, scope, displayName, description, displayOrder }),

  /** Updates permission display metadata. Owned by pno-api. */
  updatePermission: (userId, permissionCode, displayName, description, displayOrder) =>
    pnoRequest('PUT', `/permissions/${permissionCode}`, userId, { displayName, description, displayOrder }),

  /** Returns ALL authorization_policy rows for a role. Owned by pno-api (Phase D4+). */
  getRolePolicies: (userId, roleId) =>
    pnoRequest('GET', `/roles/${roleId}/policies`, userId),

  /** Returns all GLOBAL actions from the permission catalog. pno-api mirror (Phase D4+). */
  listGlobalActions: (userId) =>
    pnoRequest('GET', '/global-actions', userId),

  /** Returns the GLOBAL action codes the current user can execute. pno-api (Phase D4+). */
  getMyGlobalPermissions: (userId) =>
    pnoRequest('GET', '/my-global-permissions', userId),

  /** Returns settings sections grouped by category, filtered by user permissions. */
  getSettingsSections: (userId) =>
    platformRequest('GET', '/sections', userId),

  getUiManifest: () =>
    platformRequest('GET', '/ui/manifest', null),

  // Generic create entry-point — dispatches the descriptor's create action.
  // bodyShape:
  //   - WRAPPED  → JSON `{ parameters: {...values} }` (psm action convention)
  //   - RAW      → JSON `{ ...values }`
  //   - MULTIPART→ multipart/form-data with one part per value (Files passthrough)
  createResource: (descriptor, values) =>
    submitItemCreate(descriptor, values),

  /** Returns the GLOBAL action permissions held by a specific role. pno-api (Phase D4+). */
  getRoleGlobalPermissions: (userId, roleId) =>
    pnoRequest('GET', `/roles/${roleId}/global-permissions`, userId),

  /** Grants a GLOBAL permission to a role. Requires MANAGE_ROLES. pno-api (Phase D4+). */
  addRoleGlobalPermission: (userId, roleId, permissionCode) =>
    pnoRequest('POST', `/roles/${roleId}/global-permissions`, userId, { permissionCode }),

  /** Revokes a GLOBAL permission from a role. Requires MANAGE_ROLES. pno-api (Phase D4+). */
  removeRoleGlobalPermission: (userId, roleId, permissionCode) =>
    pnoRequest('DELETE', `/roles/${roleId}/global-permissions/${permissionCode}`, userId),

  /** Generic role-only scope grants (DATA, future scopes with empty key list). */
  getRoleScopePermissions: (userId, roleId, scopeCode) =>
    pnoRequest('GET', `/roles/${roleId}/scope-permissions/${scopeCode}`, userId),
  addRoleScopePermission: (userId, roleId, scopeCode, permissionCode) =>
    pnoRequest('POST', `/roles/${roleId}/scope-permissions/${scopeCode}`, userId, { permissionCode }),
  removeRoleScopePermission: (userId, roleId, scopeCode, permissionCode) =>
    pnoRequest('DELETE', `/roles/${roleId}/scope-permissions/${scopeCode}/${permissionCode}`, userId),

  /** Generic keyed-scope grants via AccessRightsController (SERVICE, future scopes with key values). */
  getAccessRightsTree: (userId, projectSpaceId) =>
    pnoRequest('GET', `/access-rights/tree${projectSpaceId ? `?projectSpaceId=${projectSpaceId}` : ''}`, userId),
  getGrantsForRoleAndScope: (userId, roleId, scopeCode) =>
    pnoRequest('GET', `/access-rights/roles/${roleId}/grants?scopeCode=${scopeCode}`, userId),
  addScopedGrant: (userId, req) =>
    pnoRequest('POST', `/access-rights/grants`, userId, req),
  removeScopedGrant: (userId, req) =>
    pnoRequest('DELETE', `/access-rights/grants`, userId, req),

  // ── Secrets (Vault-backed, served by platform-api at /api/platform/admin/secrets) ──

  listSecrets: (userId) =>
    platformRequest('GET', '/admin/secrets', userId),

  revealSecret: (userId, key) =>
    platformRequest('GET', `/admin/secrets/${encodeURIComponent(key)}`, userId),

  createSecret: (userId, key, value) =>
    platformRequest('POST', '/admin/secrets', userId, { key, value }),

  updateSecret: (userId, key, value) =>
    platformRequest('PUT', `/admin/secrets/${encodeURIComponent(key)}`, userId, { value }),

  deleteSecret: (userId, key) =>
    platformRequest('DELETE', `/admin/secrets/${encodeURIComponent(key)}`, userId),

  // ── Lifecycle-transition guards — owned by psm-admin ──

  listAllInstances: (userId) =>
    platformRequest('GET', '/algorithms/instances', userId),

  listTransitionGuards: (userId, transitionId) =>
    adminRequest('GET', `/metamodel/lifecycles/transitions/${transitionId}/guards`, userId),

  attachTransitionGuard: (userId, transitionId, instanceId, effect, displayOrder) =>
    adminRequest('POST', `/metamodel/lifecycles/transitions/${transitionId}/guards`, userId,
      { instanceId, effect, displayOrder }),

  updateTransitionGuard: (userId, guardId, effect) =>
    adminRequest('PUT', `/metamodel/lifecycles/transitions/guards/${guardId}`, userId, { effect }),

  detachTransitionGuard: (userId, guardId) =>
    adminRequest('DELETE', `/metamodel/lifecycles/transitions/guards/${guardId}`, userId),
};

export const platformActionsApi = {
  // Actions
  listActions: (userId, serviceCode) =>
    platformRequest('GET', `/actions${serviceCode ? `?serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),
  getAction: (userId, actionId) =>
    platformRequest('GET', `/actions/${actionId}`, userId),
  createAction: (userId, body) =>
    platformRequest('POST', '/actions', userId, body),
  updateAction: (userId, actionId, body) =>
    platformRequest('PUT', `/actions/${actionId}`, userId, body),
  deleteAction: (userId, actionId) =>
    platformRequest('DELETE', `/actions/${actionId}`, userId),

  // Action parameters
  listParameters: (userId, actionId) =>
    platformRequest('GET', `/actions/${actionId}/parameters`, userId),
  addParameter: (userId, actionId, body) =>
    platformRequest('POST', `/actions/${actionId}/parameters`, userId, body),

  // Action guards
  listActionGuards: (userId, actionId) =>
    platformRequest('GET', `/actions/${actionId}/guards`, userId),
  attachActionGuard: (userId, actionId, instanceId, effect, displayOrder) =>
    platformRequest('POST', `/actions/${actionId}/guards`, userId, { instanceId, effect, displayOrder }),
  updateActionGuard: (userId, actionId, guardId, effect) =>
    platformRequest('PUT', `/actions/${actionId}/guards/${guardId}`, userId, { effect }),
  detachActionGuard: (userId, actionId, guardId) =>
    platformRequest('DELETE', `/actions/${actionId}/guards/${guardId}`, userId),

  // Algorithms
  listAlgorithmTypes: (userId, serviceCode) =>
    platformRequest('GET', `/algorithms/types${serviceCode ? `?serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),
  listAlgorithms: (userId, serviceCode) =>
    platformRequest('GET', `/algorithms${serviceCode ? `?serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),
  listAlgorithmParameters: (userId, algorithmId) =>
    platformRequest('GET', `/algorithms/${algorithmId}/parameters`, userId),
  listAllInstances: (userId, serviceCode) =>
    platformRequest('GET', `/algorithms/instances${serviceCode ? `?serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),
  createInstance: (userId, algorithmId, name, serviceCode) =>
    platformRequest('POST', '/algorithms/instances', userId, { algorithmId, name, serviceCode }),
  updateInstance: (userId, instanceId, name) =>
    platformRequest('PUT', `/algorithms/instances/${instanceId}`, userId, { name }),
  deleteInstance: (userId, instanceId) =>
    platformRequest('DELETE', `/algorithms/instances/${instanceId}`, userId),
  getInstanceParams: (userId, instanceId) =>
    platformRequest('GET', `/algorithms/instances/${instanceId}/params`, userId),
  setInstanceParam: (userId, instanceId, parameterId, value) =>
    platformRequest('PUT', `/algorithms/instances/${instanceId}/params/${parameterId}`, userId, { value }),

  // Algorithm stats
  getAlgorithmStats: (userId, serviceCode) =>
    platformRequest('GET', `/algorithms/stats${serviceCode ? `?serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),
  getAlgorithmTimeseries: (userId, hours = 24, serviceCode) =>
    platformRequest('GET', `/algorithms/stats/timeseries?hours=${hours}${serviceCode ? `&serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),
  resetAlgorithmStats: (userId, serviceCode) =>
    platformRequest('DELETE', `/algorithms/stats${serviceCode ? `?serviceCode=${encodeURIComponent(serviceCode)}` : ''}`, userId),

  // Action wrappers
  listActionWrappers: (userId, actionId) =>
    platformRequest('GET', `/algorithms/actions/${actionId}/wrappers`, userId),
  attachActionWrapper: (userId, actionId, instanceId, executionOrder, serviceCode) =>
    platformRequest('POST', `/algorithms/actions/${actionId}/wrappers`, userId, { instanceId, executionOrder, serviceCode }),
  detachActionWrapper: (userId, actionId, wrapperId) =>
    platformRequest('DELETE', `/algorithms/actions/${actionId}/wrappers/${wrapperId}`, userId),

  // Service codes that have actions in the DB (authoritative, works without services running)
  getRegisteredServices: () =>
    platformRequest('GET', '/algorithms/services', null),

  // Full catalog for one service (handlers + guards from in-memory registry)
  getServiceCatalog: (serviceCode) =>
    platformRequest('GET', '/registry/actions', null)
      .then(data => data?.services?.[serviceCode] || { handlers: [], guards: [] }),
};

// ── Transactions ────────────────────────────────────────────────────

export const txApi = {
  /** Ouvre une nouvelle transaction. Retourne { txId }. */
  open: (userId, title) =>
    request('POST', '/transactions', userId, { title }),

  /** Statut de la transaction courante OPEN de l'utilisateur (résolu depuis X-PLM-User). */
  current: (userId) =>
    request('GET', '/transactions/current', userId),

  /** Commite avec un commentaire. nodeIds optionnel : si fourni, seuls ces noeuds sont commités. */
  commit: (userId, txId, comment, nodeIds) =>
    request('POST', `/actions/commit/${txId}`, userId,
      { parameters: { comment, ...(nodeIds ? { nodeIds: nodeIds.join(',') } : {}) } }),

  /** Libère une liste de noeuds d'une transaction (rollback partiel). */
  release: (userId, txId, nodeIds) =>
    request('POST', `/transactions/${txId}/release`, userId, { nodeIds }),

  /** Annule et supprime la transaction. */
  rollback: (userId, txId) =>
    request('POST', `/actions/rollback/${txId}`, userId, { parameters: {} }),

  /** Détail d'une transaction. */
  get: (userId, txId) =>
    request('GET', `/transactions/${txId}`, userId),

  /** Versions dans une transaction. */
  versions: (userId, txId) =>
    request('GET', `/transactions/${txId}/versions`, userId),

  /** Noeuds modifiés dans une transaction (1 entrée par noeud, dernière version). */
  nodes: (userId, txId) =>
    request('GET', `/transactions/${txId}/nodes`, userId),
};

/** Build headers with Bearer + X-PLM-Tx / X-PLM-ProjectSpace. userId kept for API compat. */
export function authHeaders(_userId, txId) {
  const h = { 'Content-Type': 'application/json' };
  if (_sessionToken) h['Authorization'] = `Bearer ${_sessionToken}`;
  if (txId) h['X-PLM-Tx'] = txId;
  if (_projectSpaceId) h['X-PLM-ProjectSpace'] = _projectSpaceId;
  return h;
}

/** request variant that includes the txId header. */
export async function txRequest(method, path, _userId, txId, body) {
  return doFetch(serviceBase('psm'), method, path, body, { txId });
}

export const dstApi = {
  downloadFile: async (uuid) => {
    const headers = { Authorization: `Bearer ${_sessionToken}` };
    if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;
    const res = await timedFetch(`/api/dst/data/${uuid}`, { method: 'GET', headers }, 'GET');
    if (!res.ok) throw new Error(`Download failed: HTTP ${res.status}`);
    return res.arrayBuffer();
  },

  getStats: async () => {
    const headers = { Authorization: `Bearer ${_sessionToken}` };
    if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;
    const res = await timedFetch('/api/dst/stats', { method: 'GET', headers }, 'GET');
    if (!res.ok) throw new Error(`Stats failed: HTTP ${res.status}`);
    return res.json();
  },
};

/** Generic job status poll — works for any service that returns jobStatusUrl in its upload response. */
export async function pollJobStatus(serviceCode, jobStatusUrl) {
  const headers = { 'Content-Type': 'application/json' };
  if (_sessionToken)    headers['Authorization']     = `Bearer ${_sessionToken}`;
  if (_projectSpaceId)  headers['X-PLM-ProjectSpace'] = _projectSpaceId;
  const res = await timedFetch(`/api/${serviceCode}${jobStatusUrl}`, { method: 'GET', headers }, 'GET');
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export const cadApi = {
  submitImport: async (file, rootNodeId, contextCode, onProgress) => {
    const headers = {};
    if (_sessionToken) headers['Authorization'] = `Bearer ${_sessionToken}`;
    if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;
    const fd = new FormData();
    fd.append('file', file);
    if (contextCode) fd.append('contextCode', contextCode);
    const res = onProgress
      ? await uploadWithProgress(`/api/psm/cad/import/${rootNodeId}`, 'POST', headers, fd, onProgress)
      : await timedFetch(`/api/psm/cad/import/${rootNodeId}`, { method: 'POST', headers, body: fd }, 'POST');
    if (!res.ok) { const msg = await res.text(); throw new Error(`HTTP ${res.status}: ${msg}`); }
    return res.json();
  },

  getJobStatus: async (jobId) => {
    const headers = { 'Content-Type': 'application/json' };
    if (_sessionToken) headers['Authorization'] = `Bearer ${_sessionToken}`;
    if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;
    const res = await timedFetch(`/api/psm/cad/jobs/${jobId}`, { method: 'GET', headers }, 'GET');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  getImportContexts: async () => {
    const headers = { 'Content-Type': 'application/json' };
    if (_sessionToken) headers['Authorization'] = `Bearer ${_sessionToken}`;
    if (_projectSpaceId) headers['X-PLM-ProjectSpace'] = _projectSpaceId;
    const res = await timedFetch('/api/psm/cad/import-contexts', { method: 'GET', headers }, 'GET');
    if (!res.ok) return [];
    return res.json();
  },
};

// All write operations go through the central action controller.
// actionCode matches action.action_code — from desc.actions[].actionCode.
// transitionId is required for LIFECYCLE-scope actions (appended to path).
export const authoringApi = {
  executeAction: (nodeId, actionCode, userId, txId, parameters, transitionId) => {
    const path = transitionId
      ? `/actions/${actionCode}/${nodeId}/${transitionId}`
      : `/actions/${actionCode}/${nodeId}`;
    return txRequest('POST', path, userId, txId, { parameters: parameters || {} });
  },

  // Use httpMethod + path from ActionDescriptor. path is service-relative (e.g. /actions/checkout/{id}).
  // txRequest prepends /api/psm; MULTIPART branch adds it explicitly.
  executeViaDescriptor: async (action, nodeId, userId, txId, parameters, onProgress) => {
    const path = (action.path || '')
      .replace('{id}', nodeId)
      .replace('{transitionId}', action.metadata?.transitionId || '');
    const method = action.httpMethod || 'POST';

    if (action.bodyShape === 'MULTIPART') {
      const fd = new FormData();
      for (const [k, v] of Object.entries(parameters || {})) {
        if (v != null) fd.append(k, v);
      }
      const headers = {};
      if (_sessionToken)    headers['Authorization']     = `Bearer ${_sessionToken}`;
      if (_projectSpaceId)  headers['X-PLM-ProjectSpace'] = _projectSpaceId;
      if (txId)             headers['X-PLM-Tx']           = txId;
      const res = onProgress
        ? await uploadWithProgress('/api/psm' + path, method, headers, fd, onProgress)
        : await timedFetch('/api/psm' + path, { method, headers, body: fd }, method);
      if (!res.ok) { const msg = await res.text(); throw new Error(`HTTP ${res.status}: ${msg}`); }
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    }

    return txRequest(method, path, userId, txId, { parameters: parameters || {} });
  },
};

// KV store for user preferences and basket.
// Basket API — dedicated first-class endpoints (PS from X-PLM-ProjectSpace header).
export const basketApi = {
  list:   (userId)                          =>
    pnoRequest('GET',    `/users/${encodeURIComponent(userId)}/basket`),
  add:    (userId, source, typeCode, itemId) =>
    pnoRequest('PUT',    `/users/${encodeURIComponent(userId)}/basket/${encodeURIComponent(source)}/${encodeURIComponent(typeCode)}/${encodeURIComponent(itemId)}`),
  remove: (userId, source, typeCode, itemId) =>
    pnoRequest('DELETE', `/users/${encodeURIComponent(userId)}/basket/${encodeURIComponent(source)}/${encodeURIComponent(typeCode)}/${encodeURIComponent(itemId)}`),
  clear:  (userId)                          =>
    pnoRequest('DELETE', `/users/${encodeURIComponent(userId)}/basket`),
};

// KV API — user preferences only (UI_PREF). PS header suppressed for global scope.
export const kvApi = {
  // UI_PREF is user-global — suppress X-PLM-ProjectSpace header so backend uses empty scope.
  getSingle: (userId, group, key) =>
    pnoRequest('GET', `/users/${encodeURIComponent(userId)}/kv/${encodeURIComponent(group)}/single/${encodeURIComponent(key)}`, undefined, undefined, { psOverride: '' }),

  setSingle: (userId, group, key, value) =>
    pnoRequest('PUT', `/users/${encodeURIComponent(userId)}/kv/${encodeURIComponent(group)}/single/${encodeURIComponent(key)}/${encodeURIComponent(value)}`, undefined, undefined, { psOverride: '' }),
};
