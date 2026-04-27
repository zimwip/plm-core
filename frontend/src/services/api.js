// services/api.js — Couche d'accès à l'API PLM backend

import { recordApiCall } from './apiStats';

const BASE          = '/api/psm';
const BASE_ADMIN    = '/api/psa';
const BASE_PNO      = '/api/pno';
const BASE_PLATFORM = '/api/platform';

// Wrap fetch to record timing + status into apiStats.
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

// Module-level project space context — updated by App when user selects a space
let _projectSpaceId = null;
export function setProjectSpaceId(id) { _projectSpaceId = id; }

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
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.detail = payload;
    if (_onError) _onError(err);
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// userId args kept for API compatibility but no longer sent — the session token identifies the user.
async function pnoRequest(method, path, _userId, body) {
  return doFetch(BASE_PNO, method, path, body);
}

async function platformRequest(method, path, _userId, body) {
  return doFetch(BASE_PLATFORM, method, path, body);
}

async function request(method, path, _userId, body, psOverride) {
  return doFetch(BASE, method, path, body, { psOverride });
}

async function adminRequest(method, path, _userId, body) {
  return doFetch(BASE_ADMIN, method, path, body);
}

// ── SPE (gateway) platform status ──────────────────────────────────
export const speApi = {
  getStatus: async () => {
    const res = await timedFetch('/api/spe/status', { cache: 'no-store' }, 'GET');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },
  getRegistryTags: async () => {
    const res = await timedFetch('/api/spe/registry/tags', { cache: 'no-store' }, 'GET');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  },

  // Environment config (expected services)
  getEnvironment: async () => {
    return doFetch('/api/spe', 'GET', '/config/environment');
  },
  updateEnvironment: async (expectedServices) => {
    return doFetch('/api/spe', 'PUT', '/config/environment', { expectedServices });
  },
  addExpectedService: async (serviceCode) => {
    return doFetch('/api/spe', 'POST', '/config/environment/services', { serviceCode });
  },
  removeExpectedService: async (serviceCode) => {
    return doFetch('/api/spe', 'DELETE', `/config/environment/services/${serviceCode}`);
  },
  getNatsStatus: async () => {
    const res = await timedFetch('/api/spe/status/nats', { cache: 'no-store' }, 'GET');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
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

  // Lister les types de noeuds que l'utilisateur courant peut créer (permission-filtered, served by psm-api)
  getCreatableNodeTypes: (userId) =>
    request('GET', '/nodes/nodetypes/creatable', userId),

  // Lister tous les noeuds (dernière version committée)
  listNodes: (userId, page = 0, size = 50) =>
    request('GET', `/nodes?page=${page}&size=${size}`, userId),

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
    let params = `userId=${userId}`;
    if (txId)          params += `&txId=${txId}`;
    if (versionNumber) params += `&versionNumber=${versionNumber}`;
    return request('GET', `/nodes/${nodeId}/description?${params}`, userId);
  },

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

  /** Returns full permission catalog: code, scope, displayName. */
  listPermissions: (userId) =>
    adminRequest('GET', '/permissions', userId),

  /** Creates a new permission. */
  createPermission: (userId, permissionCode, scope, displayName, description, displayOrder) =>
    adminRequest('POST', '/permissions', userId, { permissionCode, scope, displayName, description, displayOrder }),

  /** Updates permission display metadata. */
  updatePermission: (userId, permissionCode, displayName, description, displayOrder) =>
    adminRequest('PUT', `/permissions/${permissionCode}`, userId, { displayName, description, displayOrder }),

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

  /** Returns the GLOBAL action permissions held by a specific role. pno-api (Phase D4+). */
  getRoleGlobalPermissions: (userId, roleId) =>
    pnoRequest('GET', `/roles/${roleId}/global-permissions`, userId),

  /** Grants a GLOBAL permission to a role. Requires MANAGE_ROLES. pno-api (Phase D4+). */
  addRoleGlobalPermission: (userId, roleId, permissionCode) =>
    pnoRequest('POST', `/roles/${roleId}/global-permissions`, userId, { permissionCode }),

  /** Revokes a GLOBAL permission from a role. Requires MANAGE_ROLES. pno-api (Phase D4+). */
  removeRoleGlobalPermission: (userId, roleId, permissionCode) =>
    pnoRequest('DELETE', `/roles/${roleId}/global-permissions/${permissionCode}`, userId),

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

  // ── Algorithms & Guards ─────────────────────────────────────────────

  listAlgorithmTypes: (userId) =>
    adminRequest('GET', '/algorithms/types', userId),

  listAlgorithms: (userId) =>
    adminRequest('GET', '/algorithms', userId),

  listAlgorithmsByType: (userId, typeId) =>
    adminRequest('GET', `/algorithms/by-type/${typeId}`, userId),

  listAlgorithmParameters: (userId, algorithmId) =>
    adminRequest('GET', `/algorithms/${algorithmId}/parameters`, userId),

  listAllInstances: (userId) =>
    adminRequest('GET', '/algorithms/instances', userId),

  listInstances: (userId, algorithmId) =>
    adminRequest('GET', `/algorithms/${algorithmId}/instances`, userId),

  createInstance: (userId, algorithmId, name) =>
    adminRequest('POST', '/algorithms/instances', userId, { algorithmId, name }),

  updateInstance: (userId, instanceId, name) =>
    adminRequest('PUT', `/algorithms/instances/${instanceId}`, userId, { name }),

  deleteInstance: (userId, instanceId) =>
    adminRequest('DELETE', `/algorithms/instances/${instanceId}`, userId),

  getInstanceParams: (userId, instanceId) =>
    adminRequest('GET', `/algorithms/instances/${instanceId}/params`, userId),

  setInstanceParam: (userId, instanceId, parameterId, value) =>
    adminRequest('PUT', `/algorithms/instances/${instanceId}/params/${parameterId}`, userId, { value }),

  listActionGuards: (userId, actionId) =>
    adminRequest('GET', `/algorithms/actions/${actionId}/guards`, userId),

  attachActionGuard: (userId, actionId, instanceId, effect, displayOrder) =>
    adminRequest('POST', `/algorithms/actions/${actionId}/guards`, userId, { instanceId, effect, displayOrder }),

  updateActionGuard: (userId, actionId, guardId, effect) =>
    adminRequest('PUT', `/algorithms/actions/${actionId}/guards/${guardId}`, userId, { effect }),

  detachActionGuard: (userId, actionId, guardId) =>
    adminRequest('DELETE', `/algorithms/actions/${actionId}/guards/${guardId}`, userId),

  // Action wrappers (middleware pipeline)
  listActionWrappers: (userId, actionId) =>
    adminRequest('GET', `/algorithms/actions/${actionId}/wrappers`, userId),

  attachActionWrapper: (userId, actionId, instanceId, executionOrder) =>
    adminRequest('POST', `/algorithms/actions/${actionId}/wrappers`, userId, { instanceId, executionOrder }),

  detachActionWrapper: (userId, actionId, wrapperId) =>
    adminRequest('DELETE', `/algorithms/actions/${actionId}/wrappers/${wrapperId}`, userId),

  listTransitionGuards: (userId, transitionId) =>
    adminRequest('GET', `/algorithms/transitions/${transitionId}/guards`, userId),

  attachTransitionGuard: (userId, transitionId, instanceId, effect, displayOrder) =>
    adminRequest('POST', `/algorithms/transitions/${transitionId}/guards`, userId,
      { instanceId, effect, displayOrder }),

  updateTransitionGuard: (userId, guardId, effect) =>
    adminRequest('PUT', `/algorithms/transitions/guards/${guardId}`, userId, { effect }),

  detachTransitionGuard: (userId, guardId) =>
    adminRequest('DELETE', `/algorithms/transitions/guards/${guardId}`, userId),

  listNodeActionGuards: (userId, nodeTypeId, actionCode, transitionId) =>
    adminRequest('GET',
      `/algorithms/node-actions/${nodeTypeId}/${actionCode}/guards${transitionId ? `?transitionId=${encodeURIComponent(transitionId)}` : ''}`,
      userId),

  attachNodeActionGuard: (userId, nodeTypeId, actionCode, transitionId, instanceId, effect, overrideAction, displayOrder) =>
    adminRequest('POST', `/algorithms/node-actions/${nodeTypeId}/${actionCode}/guards`, userId,
      { transitionId: transitionId || null, instanceId, effect, overrideAction, displayOrder }),

  updateNodeActionGuard: (userId, guardId, effect) =>
    adminRequest('PUT', `/algorithms/node-actions/guards/${guardId}`, userId, { effect }),

  detachNodeActionGuard: (userId, guardId) =>
    adminRequest('DELETE', `/algorithms/node-actions/guards/${guardId}`, userId),

  // ── Node-type state action overrides (tier 2) ──

  listNodeTypeStateActions: (userId, nodeTypeId, stateId) =>
    adminRequest('GET', `/algorithms/node-types/${nodeTypeId}/states/${stateId}/actions`, userId),

  attachNodeTypeStateAction: (userId, nodeTypeId, stateId, instanceId, trigger, executionMode, overrideAction, displayOrder = 0) =>
    adminRequest('POST', `/algorithms/node-types/${nodeTypeId}/states/${stateId}/actions`, userId,
      { instanceId, trigger, executionMode, overrideAction, displayOrder }),

  detachNodeTypeStateAction: (userId, attachmentId) =>
    adminRequest('DELETE', `/algorithms/node-type-state-actions/${attachmentId}`, userId),

  // ── Managed-with ──

  setManagedWith: (userId, actionId, managedWith) =>
    adminRequest('PUT', `/metamodel/actions/${actionId}/managed-with`, userId, { managedWith: managedWith || '' }),

  getManagedActions: (userId, actionId) =>
    adminRequest('GET', `/metamodel/actions/${actionId}/managed-actions`, userId),

  /** Returns persisted + in-memory merged stats. */
  getAlgorithmStats: (userId) =>
    adminRequest('GET', '/algorithms/stats', userId),

  /** Returns time-series stats in 15-min windows. */
  getAlgorithmTimeseries: (userId, hours = 24) =>
    adminRequest('GET', `/algorithms/stats/timeseries?hours=${hours}`, userId),

  /** Resets all stats (memory + DB). */
  resetAlgorithmStats: (userId) =>
    adminRequest('DELETE', '/algorithms/stats', userId),
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
  return doFetch(BASE, method, path, body, { txId });
}

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
};
