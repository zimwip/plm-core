// services/api.js — Couche d'accès à l'API PLM backend

const BASE     = '/api/psm';
const BASE_PNO = '/api/pno';

// Module-level project space context — updated by App when user selects a space
let _projectSpaceId = null;
export function setProjectSpaceId(id) { _projectSpaceId = id; }

// Global error handler — set once by App so every unhandled API error shows a toast
let _onError = null;
export function setApiErrorHandler(fn) { _onError = fn; }

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

/** Sends a request to pno-api (People & Organisation). */
async function pnoRequest(method, path, userId, body) {
  let res;
  try {
    const h = { 'Content-Type': 'application/json' };
    if (userId) h['X-PLM-User'] = userId;
    res = await fetch(`${BASE_PNO}${path}`, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    onBackendUnreachable();
    const err = new Error('Backend unreachable');
    if (_onError) _onError(err);
    throw err;
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

async function request(method, path, userId, body, psOverride) {
  const h = {
    'Content-Type': 'application/json',
    'X-PLM-User': userId,
  };
  const ps = psOverride ?? _projectSpaceId;
  if (ps) h['X-PLM-ProjectSpace'] = ps;

  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: h,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    onBackendUnreachable();
    const err = new Error('Backend unreachable');
    if (_onError) _onError(err);
    throw err;
  }
  if (!res.ok) {
    if (res.status === 502 || res.status === 503) onBackendUnreachable();
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.detail = payload; // { error, type, path, status, stackTrace }
    if (_onError) _onError(err);
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

const requestForSpace = (method, path, userId, psId, body) =>
  request(method, path, userId, body, psId);

// ── Nodes ──────────────────────────────────────────────────────────

export const api = {
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

  // Créer un noeud
  createNode: (userId, nodeTypeId, attributes, logicalId, externalId) =>
    request('POST', '/nodes', userId, { nodeTypeId, userId, attributes, logicalId, externalId }),

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

  deleteLifecycle: (userId, lifecycleId) =>
    request('DELETE', `/metamodel/lifecycles/${lifecycleId}`, userId),

  addLifecycleState: (userId, lifecycleId, body) =>
    request('POST', `/metamodel/lifecycles/${lifecycleId}/states`, userId, body),

  updateLifecycleState: (userId, lifecycleId, stateId, body) =>
    request('PUT', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, userId, body),

  deleteLifecycleState: (userId, lifecycleId, stateId) =>
    request('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, userId),

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

  getActionPermissions: (userId, nodeTypeId, actionCode, transitionId) =>
    request('GET',
      `/metamodel/nodetypes/${nodeTypeId}/actions/${actionCode}/permissions${transitionId ? `?transitionId=${encodeURIComponent(transitionId)}` : ''}`,
      userId),

  addActionPermission: (userId, nodeTypeId, actionCode, roleId, transitionId) =>
    request('POST', `/metamodel/nodetypes/${nodeTypeId}/actions/${actionCode}/permissions`, userId,
      { roleId, transitionId: transitionId || null }),

  removeActionPermission: (userId, nodeTypeId, actionCode, roleId, transitionId) =>
    request('DELETE', `/metamodel/nodetypes/${nodeTypeId}/actions/${actionCode}/permissions`, userId,
      { roleId, transitionId: transitionId || null }),

  // Space-scoped variants — used in the Project Spaces settings view where the
  // target space may differ from the currently active project space.
  getActionPermissionsForSpace: (userId, psId, nodeTypeId, actionCode, transitionId) =>
    requestForSpace('GET',
      `/metamodel/nodetypes/${nodeTypeId}/actions/${actionCode}/permissions${transitionId ? `?transitionId=${encodeURIComponent(transitionId)}` : ''}`,
      userId, psId),

  addActionPermissionForSpace: (userId, psId, nodeTypeId, actionCode, roleId, transitionId) =>
    requestForSpace('POST',
      `/metamodel/nodetypes/${nodeTypeId}/actions/${actionCode}/permissions`,
      userId, psId, { roleId, transitionId: transitionId || null }),

  removeActionPermissionForSpace: (userId, psId, nodeTypeId, actionCode, roleId, transitionId) =>
    requestForSpace('DELETE',
      `/metamodel/nodetypes/${nodeTypeId}/actions/${actionCode}/permissions`,
      userId, psId, { roleId, transitionId: transitionId || null }),

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

  // Users — served by pno-api
  listUsers: (userId) =>
    pnoRequest('GET', '/users', userId),

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

  // ── Global action permissions (Access Rights section) ──────────────

  /** Returns all GLOBAL actions from the action catalog. */
  listGlobalActions: (userId) =>
    request('GET', '/admin/global-actions', userId),

  /** Returns the GLOBAL action codes the current user can execute (e.g. ['MANAGE_METAMODEL']). */
  getMyGlobalPermissions: (userId) =>
    request('GET', '/admin/my-global-permissions', userId),

  /** Returns the GLOBAL action permissions held by a specific role. */
  getRoleGlobalPermissions: (userId, roleId) =>
    request('GET', `/admin/roles/${roleId}/global-permissions`, userId),

  /** Grants a GLOBAL action to a role. Requires MANAGE_ROLES. */
  addRoleGlobalPermission: (userId, roleId, actionId) =>
    request('POST', `/admin/roles/${roleId}/global-permissions`, userId, { actionId }),

  /** Revokes a GLOBAL action from a role. Requires MANAGE_ROLES. */
  removeRoleGlobalPermission: (userId, roleId, actionId) =>
    request('DELETE', `/admin/roles/${roleId}/global-permissions/${actionId}`, userId),

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

  /** Returns persisted + in-memory merged stats. */
  getAlgorithmStats: (userId) =>
    request('GET', '/algorithms/stats', userId),

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
    request('POST', `/transactions/${txId}/commit`, userId,
      { comment, ...(nodeIds ? { nodeIds } : {}) }),

  /** Libère une liste de noeuds d'une transaction (rollback partiel). */
  release: (userId, txId, nodeIds) =>
    request('POST', `/transactions/${txId}/release`, userId, { nodeIds }),

  /** Annule et supprime la transaction. */
  rollback: (userId, txId) =>
    request('POST', `/transactions/${txId}/rollback`, userId, null),

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

/** Construit les headers avec X-PLM-User + X-PLM-Tx (si txId fourni). */
export function authHeaders(userId, txId) {
  const h = { 'Content-Type': 'application/json', 'X-PLM-User': userId };
  if (txId) h['X-PLM-Tx'] = txId;
  if (_projectSpaceId) h['X-PLM-ProjectSpace'] = _projectSpaceId;
  return h;
}

/** Version de request qui inclut le txId dans le header. */
export async function txRequest(method, path, userId, txId, body) {
  let res;
  try {
    res = await fetch(`${BASE}${path}`, {
      method,
      headers: authHeaders(userId, txId),
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    onBackendUnreachable();
    const err = new Error('Backend unreachable');
    if (_onError) _onError(err);
    throw err;
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

// All write operations go through the action registry.
// actionCode matches action.action_code — from desc.actions[].actionCode.
// transitionId is required for LIFECYCLE-scope actions.
export const authoringApi = {
  executeAction: (nodeId, actionCode, userId, txId, parameters, transitionId) =>
    txRequest('POST', `/nodes/${nodeId}/actions/${actionCode}`, userId, txId,
      { parameters: parameters || {}, transitionId: transitionId || null }),
};
