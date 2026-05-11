// psm-admin/ui/src/psaApi.js — PSA (psm-admin) service API module.
// Owns all /api/psa/* endpoint calls.
// Call initPsaApi(shellAPI) once in the plugin init() before any API call.

let _http = null;

export function initPsaApi(shellAPI) {
  _http = shellAPI.http;
}

const r = (method, path, body) => _http.serviceRequest('psa', method, path, body);

export const psaApi = {
  // ── Metadata keys ─────────────────────────────────────────────────
  getMetadataKeys: (_userId, targetType) =>
    r('GET', targetType ? `/metamodel/metadata/keys/${targetType}` : '/metamodel/metadata/keys'),

  // ── Node types ────────────────────────────────────────────────────
  getNodeTypes: (_userId) => r('GET', '/metamodel/nodetypes'),
  createNodeType: (_userId, body) => r('POST', '/metamodel/nodetypes', body),
  deleteNodeType: (_userId, nodeTypeId) => r('DELETE', `/metamodel/nodetypes/${nodeTypeId}`),
  updateNodeTypeIdentity: (_userId, nodeTypeId, body) => r('PUT', `/metamodel/nodetypes/${nodeTypeId}/identity`, body),
  updateNodeTypeNumberingScheme: (_userId, nodeTypeId, numberingScheme) =>
    r('PUT', `/metamodel/nodetypes/${nodeTypeId}/numbering-scheme`, { numberingScheme }),
  updateNodeTypeVersionPolicy: (_userId, nodeTypeId, versionPolicy) =>
    r('PUT', `/metamodel/nodetypes/${nodeTypeId}/version-policy`, { versionPolicy }),
  updateNodeTypeCollapseHistory: (_userId, nodeTypeId, collapseHistory) =>
    r('PUT', `/metamodel/nodetypes/${nodeTypeId}/collapse-history`, { collapseHistory }),
  updateNodeTypeLifecycle: (_userId, nodeTypeId, lifecycleId) =>
    r('PUT', `/metamodel/nodetypes/${nodeTypeId}/lifecycle`, { lifecycleId: lifecycleId || null }),
  updateNodeTypeAppearance: (_userId, nodeTypeId, color, icon) =>
    r('PUT', `/metamodel/nodetypes/${nodeTypeId}/appearance`, { color: color || null, icon: icon || null }),
  updateNodeTypeParent: (_userId, nodeTypeId, parentNodeTypeId) =>
    r('PUT', `/metamodel/nodetypes/${nodeTypeId}/parent`, { parentNodeTypeId: parentNodeTypeId || null }),

  // ── Node type attributes ──────────────────────────────────────────
  getNodeTypeAttributes: (_userId, nodeTypeId) => r('GET', `/metamodel/nodetypes/${nodeTypeId}/attributes`),
  createAttribute: (_userId, nodeTypeId, body) => r('POST', `/metamodel/nodetypes/${nodeTypeId}/attributes`, body),
  updateAttribute: (_userId, nodeTypeId, attrId, body) => r('PUT', `/metamodel/nodetypes/${nodeTypeId}/attributes/${attrId}`, body),
  deleteAttribute: (_userId, nodeTypeId, attrId) => r('DELETE', `/metamodel/nodetypes/${nodeTypeId}/attributes/${attrId}`),

  // ── Node type actions ─────────────────────────────────────────────
  getAllActions: (_userId) => r('GET', '/metamodel/actions'),
  getActionsForNodeType: (_userId, nodeTypeId) => r('GET', `/metamodel/nodetypes/${nodeTypeId}/actions`),
  registerCustomAction: (_userId, body) => r('POST', '/metamodel/actions', body),

  // ── Link types ────────────────────────────────────────────────────
  getLinkTypes: (_userId) => r('GET', '/metamodel/linktypes'),
  getNodeTypeLinkTypes: (_userId, nodeTypeId) => r('GET', `/metamodel/nodetypes/${nodeTypeId}/linktypes`),
  createLinkType: (_userId, body) => r('POST', '/metamodel/linktypes', body),
  updateLinkType: (_userId, linkTypeId, body) => r('PUT', `/metamodel/linktypes/${linkTypeId}`, body),
  deleteLinkType: (_userId, linkTypeId) => r('DELETE', `/metamodel/linktypes/${linkTypeId}`),

  // ── Link type attributes ──────────────────────────────────────────
  getLinkTypeAttributes: (_userId, linkTypeId) => r('GET', `/metamodel/linktypes/${linkTypeId}/attributes`),
  createLinkTypeAttribute: (_userId, linkTypeId, body) => r('POST', `/metamodel/linktypes/${linkTypeId}/attributes`, body),
  updateLinkTypeAttribute: (_userId, linkTypeId, attrId, body) => r('PUT', `/metamodel/linktypes/${linkTypeId}/attributes/${attrId}`, body),
  deleteLinkTypeAttribute: (_userId, linkTypeId, attrId) => r('DELETE', `/metamodel/linktypes/${linkTypeId}/attributes/${attrId}`),

  // ── Link type cascade rules ───────────────────────────────────────
  getLinkTypeCascades: (_userId, linkTypeId) => r('GET', `/metamodel/linktypes/${linkTypeId}/cascades`),
  createLinkTypeCascade: (_userId, linkTypeId, parentTransitionId, childFromStateId, childTransitionId) =>
    r('POST', `/metamodel/linktypes/${linkTypeId}/cascades`, { parentTransitionId, childFromStateId, childTransitionId }),
  deleteLinkTypeCascade: (_userId, linkTypeId, cascadeId) => r('DELETE', `/metamodel/linktypes/${linkTypeId}/cascades/${cascadeId}`),

  // ── Lifecycles ────────────────────────────────────────────────────
  getLifecycles: (_userId) => r('GET', '/metamodel/lifecycles'),
  getLifecycleStates: (_userId, id) => r('GET', `/metamodel/lifecycles/${id}/states`),
  getLifecycleTransitions: (_userId, id) => r('GET', `/metamodel/lifecycles/${id}/transitions`),
  createLifecycle: (_userId, body) => r('POST', '/metamodel/lifecycles', body),
  duplicateLifecycle: (_userId, sourceId, name) => r('POST', `/metamodel/lifecycles/${sourceId}/duplicate`, { name }),
  deleteLifecycle: (_userId, lifecycleId) => r('DELETE', `/metamodel/lifecycles/${lifecycleId}`),

  // ── Lifecycle states ──────────────────────────────────────────────
  addLifecycleState: (_userId, lifecycleId, body) => r('POST', `/metamodel/lifecycles/${lifecycleId}/states`, body),
  updateLifecycleState: (_userId, lifecycleId, stateId, body) => r('PUT', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`, body),
  deleteLifecycleState: (_userId, lifecycleId, stateId) => r('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}`),

  // ── Lifecycle state actions ───────────────────────────────────────
  listLifecycleStateActions: (_userId, lifecycleId, stateId) =>
    r('GET', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions`),
  attachLifecycleStateAction: (_userId, lifecycleId, stateId, instanceId, trigger, executionMode, displayOrder = 0) =>
    r('POST', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions`, { instanceId, trigger, executionMode, displayOrder }),
  detachLifecycleStateAction: (_userId, lifecycleId, stateId, actionId) =>
    r('DELETE', `/metamodel/lifecycles/${lifecycleId}/states/${stateId}/actions/${actionId}`),

  // ── Lifecycle transitions ─────────────────────────────────────────
  addLifecycleTransition: (_userId, lifecycleId, body) => r('POST', `/metamodel/lifecycles/${lifecycleId}/transitions`, body),
  updateLifecycleTransition: (_userId, lifecycleId, transId, body) => r('PUT', `/metamodel/lifecycles/${lifecycleId}/transitions/${transId}`, body),
  deleteLifecycleTransition: (_userId, lifecycleId, transId) => r('DELETE', `/metamodel/lifecycles/${lifecycleId}/transitions/${transId}`),

  // ── Transition signature requirements ────────────────────────────
  addTransitionSignatureRequirement: (_userId, transId, roleId, displayOrder = 0) =>
    r('POST', `/metamodel/transitions/${transId}/signature-requirements`, { roleId, displayOrder }),
  removeTransitionSignatureRequirement: (_userId, transId, reqId) =>
    r('DELETE', `/metamodel/transitions/${transId}/signature-requirements/${reqId}`),

  // ── Transition guards ─────────────────────────────────────────────
  listTransitionGuards: (_userId, transitionId) =>
    r('GET', `/metamodel/lifecycles/transitions/${transitionId}/guards`),
  attachTransitionGuard: (_userId, transitionId, instanceId, effect, displayOrder) =>
    r('POST', `/metamodel/lifecycles/transitions/${transitionId}/guards`, { instanceId, effect, displayOrder }),
  updateTransitionGuard: (_userId, guardId, effect) =>
    r('PUT', `/metamodel/lifecycles/transitions/guards/${guardId}`, { effect }),
  detachTransitionGuard: (_userId, guardId) =>
    r('DELETE', `/metamodel/lifecycles/transitions/guards/${guardId}`),

  // ── Sources ───────────────────────────────────────────────────────
  getSources: (_userId) => r('GET', '/sources'),
  getSourceResolvers: (_userId) => r('GET', '/sources/resolvers'),
  createSource: (_userId, body) => r('POST', '/sources', body),
  updateSource: (_userId, id, body) => r('PUT', `/sources/${id}`, body),
  deleteSource: (_userId, id) => r('DELETE', `/sources/${id}`),

  // ── Import contexts ───────────────────────────────────────────────
  getImportContexts: () => r('GET', '/admin/import-contexts'),
  createImportContext: (body) => r('POST', '/admin/import-contexts', body),
  updateImportContext: (id, body) => r('PUT', `/admin/import-contexts/${id}`, body),
  deleteImportContext: (id) => r('DELETE', `/admin/import-contexts/${id}`),
  getImportAlgorithmInstances: () => r('GET', '/admin/import-contexts/algorithm-instances/import'),
  getValidationAlgorithmInstances: () => r('GET', '/admin/import-contexts/algorithm-instances/validation'),

  // ── Domains ───────────────────────────────────────────────────────
  getDomains: (_userId) => r('GET', '/domains'),
  createDomain: (_userId, body) => r('POST', '/domains', body),
  updateDomain: (_userId, domainId, body) => r('PUT', `/domains/${domainId}`, body),
  deleteDomain: (_userId, domainId) => r('DELETE', `/domains/${domainId}`),
  getDomainAttributes: (_userId, domainId) => r('GET', `/domains/${domainId}/attributes`),
  createDomainAttribute: (_userId, domainId, body) => r('POST', `/domains/${domainId}/attributes`, body),
  updateDomainAttribute: (_userId, domainId, attrId, body) => r('PUT', `/domains/${domainId}/attributes/${attrId}`, body),
  deleteDomainAttribute: (_userId, domainId, attrId) => r('DELETE', `/domains/${domainId}/attributes/${attrId}`),

  // ── Enums ─────────────────────────────────────────────────────────
  getEnums: (_userId) => r('GET', '/enums'),
  getEnumDetail: (_userId, enumId) => r('GET', `/enums/${enumId}`),
  createEnum: (_userId, body) => r('POST', '/enums', body),
  updateEnum: (_userId, enumId, body) => r('PUT', `/enums/${enumId}`, body),
  deleteEnum: (_userId, enumId) => r('DELETE', `/enums/${enumId}`),
  getEnumValues: (_userId, enumId) => r('GET', `/enums/${enumId}/values`),
  addEnumValue: (_userId, enumId, body) => r('POST', `/enums/${enumId}/values`, body),
  updateEnumValue: (_userId, enumId, valueId, body) => r('PUT', `/enums/${enumId}/values/${valueId}`, body),
  deleteEnumValue: (_userId, enumId, valueId) => r('DELETE', `/enums/${enumId}/values/${valueId}`),
  reorderEnumValues: (_userId, enumId, valueIds) => r('PUT', `/enums/${enumId}/values/reorder`, valueIds),
};
