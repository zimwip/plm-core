// services/api.js — Couche d'accès à l'API PLM backend

import { recordApiCall } from './apiStats';

const BASE     = '/api/psm';
const BASE_PNO = '/api/pno';

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

async function request(method, path, _userId, body, psOverride) {
  return doFetch(BASE, method, path, body, { psOverride });
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
};

// ── Nodes ──────────────────────────────────────────────────────────

export const api = {
  // Metadata keys (discovered from @Metadata annotations)
  getMetadataKeys: (userId, targetType) =>
    request('GET', targetType ? `/metamodel/metadata/keys/${targetType}` : '/metamodel/metadata/keys', userId),

  // Lister les types de noeuds disponibles
  getNodeTypes: (userId) =>
    request('GET', '/metamodel/nodetypes', userId),

  // Lister les types de noeuds que l'utilisateur courant peut créer
  getCreatableNodeTypes: (userId) =>
    request('GET', '/metamodel/nodetypes/creatable', userId),

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
    request('GET', '/metamodel/linktypes', userId),

  getNodeTypeLinkTypes: (userId, nodeTypeId) =>
    request('GET', `/metamodel/nodetypes/${nodeTypeId}/linktypes`, userId),

  // Liens d'un noeud — lecture
  getChildLinks: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/links/children`, userId),

  getParentLinks: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/links/parents`, userId),

  // Meta-model
  getLifecycles: (userId) =>
    request('GET', '/metamodel/lifecycles', userId),

  getLifecycleStates: (userId, id) =>
    request('GET', `/metamodel/lifecycles/${id}/states`, userId),

  getLifecycleTransitions: (userId, id) =>
    request('GET', `/metamodel/lifecycles/${id}/transitions`, userId),

  createLifecycle: (userId, body) =>
    request('POST', '/metamodel/lifecycles', userId, body),

  duplicateLifecycle: (userId, sourceId, name) =>
    request('POST', `/metamodel/lifecycles/${sourceId}/duplicate`, userId, { name }),

  deleteLifecycle: (userId, lifecycleId) =>
    request('DELETE', `/metamodel/lifecycles/${lifecycleId}`, userId),

  addLifecycleState: (userId, lifecycleId, body) =>
    request('POST', `/metamodel/lifecycles/${lifecycleId}/states`, userId, body),

  updateLifecycleState: (userId, lifecycleId, stateId, body) =>
    request('PUT', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, userId, body),

  deleteLifecycleState: (userId, lifecycleId, stateId) =>
    request('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, userId),

  // State actions (lifecycle state level)
  listLifecycleStateActions: (userId, lifecycleId, stateId) =>
    request('GET', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions`, userId),

  attachLifecycleStateAction: (userId, lifecycleId, stateId, instanceId, trigger, executionMode, displayOrder = 0) =>
    request('POST', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions`, userId, { instanceId, trigger, executionMode, displayOrder }),

  detachLifecycleStateAction: (userId, lifecycleId, stateId, actionId) =>
    request('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions/${actionId}`, userId),

  addLifecycleTransition: (userId, lifecycleId, body) =>
    request('POST', `/metamodel/lifecycles/${lifecycleId}/transitions`, userId, body),

  updateLifecycleTransition: (userId, lifecycleId, transId, body) =>
    request('PUT', `/metamodel/lifecycles/${lifecycleId}/transitions/${transId}`, userId, body),

  deleteLifecycleTransition: (userId, lifecycleId, transId) =>
    request('DELETE', `/metamodel/lifecycles/${lifecycleId}/transitions/${transId}`, userId),

  addTransitionSignatureRequirement: (userId, transId, roleId, displayOrder = 0) =>
    request('POST', `/metamodel/transitions/${transId}/signature-requirements`, userId, { roleId, displayOrder }),

  removeTransitionSignatureRequirement: (userId, transId, reqId) =>
    request('DELETE', `/metamodel/transitions/${transId}/signature-requirements/${reqId}`, userId),

  deleteNodeType: (userId, nodeTypeId) =>
    request('DELETE', `/metamodel/nodetypes/${nodeTypeId}`, userId),

  updateNodeTypeIdentity: (userId, nodeTypeId, body) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/identity`, userId, body),

  updateNodeTypeNumberingScheme: (userId, nodeTypeId, numberingScheme) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/numbering-scheme`, userId, { numberingScheme }),

  updateNodeTypeVersionPolicy: (userId, nodeTypeId, versionPolicy) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/version-policy`, userId, { versionPolicy }),

  updateNodeTypeCollapseHistory: (userId, nodeTypeId, collapseHistory) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/collapse-history`, userId, { collapseHistory }),

  updateNodeTypeLifecycle: (userId, nodeTypeId, lifecycleId) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/lifecycle`, userId, { lifecycleId: lifecycleId || null }),

  updateNodeTypeAppearance: (userId, nodeTypeId, color, icon) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/appearance`, userId, { color: color || null, icon: icon || null }),

  updateAttribute: (userId, nodeTypeId, attrId, body) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/attributes/${attrId}`, userId, body),

  deleteAttribute: (userId, nodeTypeId, attrId) =>
    request('DELETE', `/metamodel/nodetypes/${nodeTypeId}/attributes/${attrId}`, userId),

  updateLinkType: (userId, linkTypeId, body) =>
    request('PUT', `/metamodel/linktypes/${linkTypeId}`, userId, body),

  deleteLinkType: (userId, linkTypeId) =>
    request('DELETE', `/metamodel/linktypes/${linkTypeId}`, userId),

  getLinkTypeAttributes: (userId, linkTypeId) =>
    request('GET', `/metamodel/linktypes/${linkTypeId}/attributes`, userId),

  createLinkTypeAttribute: (userId, linkTypeId, body) =>
    request('POST', `/metamodel/linktypes/${linkTypeId}/attributes`, userId, body),

  updateLinkTypeAttribute: (userId, linkTypeId, attrId, body) =>
    request('PUT', `/metamodel/linktypes/${linkTypeId}/attributes/${attrId}`, userId, body),

  deleteLinkTypeAttribute: (userId, linkTypeId, attrId) =>
    request('DELETE', `/metamodel/linktypes/${linkTypeId}/attributes/${attrId}`, userId),

  // Link type cascade rules
  getLinkTypeCascades: (userId, linkTypeId) =>
    request('GET', `/metamodel/linktypes/${linkTypeId}/cascades`, userId),

  createLinkTypeCascade: (userId, linkTypeId, parentTransitionId, childFromStateId, childTransitionId) =>
    request('POST', `/metamodel/linktypes/${linkTypeId}/cascades`, userId, { parentTransitionId, childFromStateId, childTransitionId }),

  deleteLinkTypeCascade: (userId, linkTypeId, cascadeId) =>
    request('DELETE', `/metamodel/linktypes/${linkTypeId}/cascades/${cascadeId}`, userId),

  getNodeTypeAttributes: (userId, nodeTypeId) =>
    request('GET', `/metamodel/nodetypes/${nodeTypeId}/attributes`, userId),

  createNodeType: (userId, body) =>
    request('POST', '/metamodel/nodetypes', userId, body),

  updateNodeTypeParent: (userId, nodeTypeId, parentNodeTypeId) =>
    request('PUT', `/metamodel/nodetypes/${nodeTypeId}/parent`, userId, { parentNodeTypeId: parentNodeTypeId || null }),

  createAttribute: (userId, nodeTypeId, body) =>
    request('POST', `/metamodel/nodetypes/${nodeTypeId}/attributes`, userId, body),

  createLinkType: (userId, body) =>
    request('POST', '/metamodel/linktypes', userId, body),

  // Action registry (meta-model)
  getAllActions: (userId) =>
    request('GET', '/metamodel/actions', userId),

  getActionsForNodeType: (userId, nodeTypeId) =>
    request('GET', `/metamodel/nodetypes/${nodeTypeId}/actions`, userId),

  registerCustomAction: (userId, body) =>
    request('POST', '/metamodel/actions', userId, body),

  // Permission grants — manage authorization_policy rows keyed by permission_code.
  getPermissionGrants: (userId, nodeTypeId, permissionCode, transitionId) =>
    request('GET',
      `/metamodel/nodetypes/${nodeTypeId}/permissions/${permissionCode}${transitionId ? `?transitionId=${encodeURIComponent(transitionId)}` : ''}`,
      userId),

  addPermissionGrant: (userId, nodeTypeId, permissionCode, roleId, transitionId) =>
    request('POST',
      `/metamodel/nodetypes/${nodeTypeId}/permissions/${permissionCode}`,
      userId, { roleId, transitionId: transitionId || null }),

  removePermissionGrant: (userId, nodeTypeId, permissionCode, roleId, transitionId) =>
    request('DELETE',
      `/metamodel/nodetypes/${nodeTypeId}/permissions/${permissionCode}`,
      userId, { roleId, transitionId: transitionId || null }),

  // Domains
  getDomains: (userId) =>
    request('GET', '/domains', userId),

  createDomain: (userId, body) =>
    request('POST', '/domains', userId, body),

  updateDomain: (userId, domainId, body) =>
    request('PUT', `/domains/${domainId}`, userId, body),

  deleteDomain: (userId, domainId) =>
    request('DELETE', `/domains/${domainId}`, userId),

  getDomainAttributes: (userId, domainId) =>
    request('GET', `/domains/${domainId}/attributes`, userId),

  createDomainAttribute: (userId, domainId, body) =>
    request('POST', `/domains/${domainId}/attributes`, userId, body),

  updateDomainAttribute: (userId, domainId, attrId, body) =>
    request('PUT', `/domains/${domainId}/attributes/${attrId}`, userId, body),

  deleteDomainAttribute: (userId, domainId, attrId) =>
    request('DELETE', `/domains/${domainId}/attributes/${attrId}`, userId),

  // Enums
  getEnums: (userId) =>
    request('GET', '/enums', userId),

  getEnumDetail: (userId, enumId) =>
    request('GET', `/enums/${enumId}`, userId),

  createEnum: (userId, body) =>
    request('POST', '/enums', userId, body),

  updateEnum: (userId, enumId, body) =>
    request('PUT', `/enums/${enumId}`, userId, body),

  deleteEnum: (userId, enumId) =>
    request('DELETE', `/enums/${enumId}`, userId),

  getEnumValues: (userId, enumId) =>
    request('GET', `/enums/${enumId}/values`, userId),

  addEnumValue: (userId, enumId, body) =>
    request('POST', `/enums/${enumId}/values`, userId, body),

  updateEnumValue: (userId, enumId, valueId, body) =>
    request('PUT', `/enums/${enumId}/values/${valueId}`, userId, body),

  deleteEnumValue: (userId, enumId, valueId) =>
    request('DELETE', `/enums/${enumId}/values/${valueId}`, userId),

  reorderEnumValues: (userId, enumId, valueIds) =>
    request('PUT', `/enums/${enumId}/values/reorder`, userId, valueIds),

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
    request('GET', '/admin/permissions', userId),

  /** Creates a new permission. */
  createPermission: (userId, permissionCode, scope, displayName, description, displayOrder) =>
    request('POST', '/admin/permissions', userId, { permissionCode, scope, displayName, description, displayOrder }),

  /** Updates permission display metadata. */
  updatePermission: (userId, permissionCode, displayName, description, displayOrder) =>
    request('PUT', `/admin/permissions/${permissionCode}`, userId, { displayName, description, displayOrder }),

  /** Returns ALL authorization_policy rows for a role (all scopes, bulk). */
  getRolePolicies: (userId, roleId) =>
    request('GET', `/admin/roles/${roleId}/policies`, userId),

  /** Returns all GLOBAL actions from the action catalog. */
  listGlobalActions: (userId) =>
    request('GET', '/admin/global-actions', userId),

  /** Returns the GLOBAL action codes the current user can execute (e.g. ['MANAGE_METAMODEL']). */
  getMyGlobalPermissions: (userId) =>
    request('GET', '/admin/my-global-permissions', userId),

  /** Returns settings sections grouped by category, filtered by user permissions. */
  getSettingsSections: (userId) =>
    request('GET', '/admin/settings-sections', userId),

  /** Returns the GLOBAL action permissions held by a specific role. */
  getRoleGlobalPermissions: (userId, roleId) =>
    request('GET', `/admin/roles/${roleId}/global-permissions`, userId),

  /** Grants a GLOBAL permission to a role. Requires MANAGE_ROLES. */
  addRoleGlobalPermission: (userId, roleId, permissionCode) =>
    request('POST', `/admin/roles/${roleId}/global-permissions`, userId, { permissionCode }),

  /** Revokes a GLOBAL permission from a role. Requires MANAGE_ROLES. */
  removeRoleGlobalPermission: (userId, roleId, permissionCode) =>
    request('DELETE', `/admin/roles/${roleId}/global-permissions/${permissionCode}`, userId),

  // ── Secrets (Vault-backed) ──────────────────────────────────────────

  listSecrets: (userId) =>
    request('GET', '/admin/secrets', userId),

  revealSecret: (userId, key) =>
    request('GET', `/admin/secrets/${encodeURIComponent(key)}`, userId),

  createSecret: (userId, key, value) =>
    request('POST', '/admin/secrets', userId, { key, value }),

  updateSecret: (userId, key, value) =>
    request('PUT', `/admin/secrets/${encodeURIComponent(key)}`, userId, { value }),

  deleteSecret: (userId, key) =>
    request('DELETE', `/admin/secrets/${encodeURIComponent(key)}`, userId),

  // ── Algorithms & Guards ─────────────────────────────────────────────

  listAlgorithmTypes: (userId) =>
    request('GET', '/algorithms/types', userId),

  listAlgorithms: (userId) =>
    request('GET', '/algorithms', userId),

  listAlgorithmsByType: (userId, typeId) =>
    request('GET', `/algorithms/by-type/${typeId}`, userId),

  listAlgorithmParameters: (userId, algorithmId) =>
    request('GET', `/algorithms/${algorithmId}/parameters`, userId),

  listAllInstances: (userId) =>
    request('GET', '/algorithms/instances', userId),

  listInstances: (userId, algorithmId) =>
    request('GET', `/algorithms/${algorithmId}/instances`, userId),

  createInstance: (userId, algorithmId, name) =>
    request('POST', '/algorithms/instances', userId, { algorithmId, name }),

  updateInstance: (userId, instanceId, name) =>
    request('PUT', `/algorithms/instances/${instanceId}`, userId, { name }),

  deleteInstance: (userId, instanceId) =>
    request('DELETE', `/algorithms/instances/${instanceId}`, userId),

  getInstanceParams: (userId, instanceId) =>
    request('GET', `/algorithms/instances/${instanceId}/params`, userId),

  setInstanceParam: (userId, instanceId, parameterId, value) =>
    request('PUT', `/algorithms/instances/${instanceId}/params/${parameterId}`, userId, { value }),

  listActionGuards: (userId, actionId) =>
    request('GET', `/algorithms/actions/${actionId}/guards`, userId),

  attachActionGuard: (userId, actionId, instanceId, effect, displayOrder) =>
    request('POST', `/algorithms/actions/${actionId}/guards`, userId, { instanceId, effect, displayOrder }),

  detachActionGuard: (userId, actionId, guardId) =>
    request('DELETE', `/algorithms/actions/${actionId}/guards/${guardId}`, userId),

  // Action wrappers (middleware pipeline)
  listActionWrappers: (userId, actionId) =>
    request('GET', `/algorithms/actions/${actionId}/wrappers`, userId),

  attachActionWrapper: (userId, actionId, instanceId, executionOrder) =>
    request('POST', `/algorithms/actions/${actionId}/wrappers`, userId, { instanceId, executionOrder }),

  detachActionWrapper: (userId, actionId, wrapperId) =>
    request('DELETE', `/algorithms/actions/${actionId}/wrappers/${wrapperId}`, userId),

  listTransitionGuards: (userId, transitionId) =>
    request('GET', `/algorithms/transitions/${transitionId}/guards`, userId),

  attachTransitionGuard: (userId, transitionId, instanceId, effect, displayOrder) =>
    request('POST', `/algorithms/transitions/${transitionId}/guards`, userId,
      { instanceId, effect, displayOrder }),

  detachTransitionGuard: (userId, guardId) =>
    request('DELETE', `/algorithms/transitions/guards/${guardId}`, userId),

  listNodeActionGuards: (userId, nodeTypeId, actionCode, transitionId) =>
    request('GET',
      `/algorithms/node-actions/${nodeTypeId}/${actionCode}/guards${transitionId ? `?transitionId=${encodeURIComponent(transitionId)}` : ''}`,
      userId),

  attachNodeActionGuard: (userId, nodeTypeId, actionCode, transitionId, instanceId, effect, overrideAction, displayOrder) =>
    request('POST', `/algorithms/node-actions/${nodeTypeId}/${actionCode}/guards`, userId,
      { transitionId: transitionId || null, instanceId, effect, overrideAction, displayOrder }),

  detachNodeActionGuard: (userId, guardId) =>
    request('DELETE', `/algorithms/node-actions/guards/${guardId}`, userId),

  // ── Node-type state action overrides (tier 2) ──

  listNodeTypeStateActions: (userId, nodeTypeId, stateId) =>
    request('GET', `/algorithms/node-types/${nodeTypeId}/states/${stateId}/actions`, userId),

  attachNodeTypeStateAction: (userId, nodeTypeId, stateId, instanceId, trigger, executionMode, overrideAction, displayOrder = 0) =>
    request('POST', `/algorithms/node-types/${nodeTypeId}/states/${stateId}/actions`, userId,
      { instanceId, trigger, executionMode, overrideAction, displayOrder }),

  detachNodeTypeStateAction: (userId, attachmentId) =>
    request('DELETE', `/algorithms/node-type-state-actions/${attachmentId}`, userId),

  // ── Managed-with ──

  setManagedWith: (userId, actionId, managedWith) =>
    request('PUT', `/metamodel/actions/${actionId}/managed-with`, userId, { managedWith: managedWith || '' }),

  getManagedActions: (userId, actionId) =>
    request('GET', `/metamodel/actions/${actionId}/managed-actions`, userId),

  /** Returns persisted + in-memory merged stats. */
  getAlgorithmStats: (userId) =>
    request('GET', '/algorithms/stats', userId),

  /** Returns time-series stats in 15-min windows. */
  getAlgorithmTimeseries: (userId, hours = 24) =>
    request('GET', `/algorithms/stats/timeseries?hours=${hours}`, userId),

  /** Resets all stats (memory + DB). */
  resetAlgorithmStats: (userId) =>
    request('DELETE', '/algorithms/stats', userId),
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
