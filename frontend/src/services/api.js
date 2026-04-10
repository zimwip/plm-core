// services/api.js — Couche d'accès à l'API PLM backend

const BASE = '/api';

function headers(userId) {
  return {
    'Content-Type': 'application/json',
    'X-PLM-User': userId,
  };
}

async function request(method, path, userId, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: headers(userId),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.detail = payload; // { error, type, path, status, stackTrace }
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Nodes ──────────────────────────────────────────────────────────

export const api = {
  // Lister les types de noeuds disponibles
  getNodeTypes: (userId) =>
    request('GET', '/metamodel/nodetypes', userId),

  // Lister tous les noeuds (dernière version committée)
  listNodes: (userId) =>
    request('GET', '/nodes', userId),

  // Historique complet des versions d'un noeud
  getVersionHistory: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/versions`, userId),

  // Créer un noeud
  createNode: (userId, nodeTypeId, attributes) =>
    request('POST', '/nodes', userId, { nodeTypeId, userId, attributes }),

  // Description complète (Server-Driven UI) — txId optionnel pour voir les versions OPEN
  getNodeDescription: (userId, nodeId, txId) => {
    const params = `userId=${userId}${txId ? `&txId=${txId}` : ''}`;
    return request('GET', `/nodes/${nodeId}/description?${params}`, userId);
  },

  // Modifier le contenu
  modifyNode: (userId, nodeId, attributes, description) =>
    request('PUT', `/nodes/${nodeId}`, userId, { userId, attributes, description }),

  // Transitions disponibles
  getTransitions: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/transitions`, userId),

  // Appliquer une transition
  applyTransition: (userId, nodeId, transitionId) =>
    request('POST', `/nodes/${nodeId}/transitions/${transitionId}`, userId, { userId }),

  // Signatures
  getSignatures: (userId, nodeId) =>
    request('GET', `/nodes/${nodeId}/signatures`, userId),

  sign: (userId, nodeId, meaning, comment) =>
    request('POST', `/nodes/${nodeId}/signatures`, userId, { userId, meaning, comment }),

  // Liens
  createLink: (userId, linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId) =>
    request('POST', '/nodes/links', userId, {
      userId, linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId: pinnedVersionId || null,
    }),

  getLinkTypes: (userId) =>
    request('GET', '/metamodel/linktypes', userId),

  // Meta-model
  getLifecycles: (userId) =>
    request('GET', '/metamodel/lifecycles', userId),

  getLifecycleStates: (userId, id) =>
    request('GET', `/metamodel/lifecycles/${id}/states`, userId),

  getLifecycleTransitions: (userId, id) =>
    request('GET', `/metamodel/lifecycles/${id}/transitions`, userId),

  getNodeTypeAttributes: (userId, nodeTypeId) =>
    request('GET', `/metamodel/nodetypes/${nodeTypeId}/attributes`, userId),

  createNodeType: (userId, body) =>
    request('POST', '/metamodel/nodetypes', userId, body),

  createAttribute: (userId, nodeTypeId, body) =>
    request('POST', `/metamodel/nodetypes/${nodeTypeId}/attributes`, userId, body),

  createLinkType: (userId, body) =>
    request('POST', '/metamodel/linktypes', userId, body),

  // Baselines
  listBaselines: (userId) =>
    request('GET', '/baselines', userId),

  createBaseline: (userId, rootNodeId, name, description) =>
    request('POST', '/baselines', userId, { userId, rootNodeId, name, description }),

  getBaselineContent: (userId, baselineId) =>
    request('GET', `/baselines/${baselineId}/content`, userId),
};

// ── Transactions ────────────────────────────────────────────────────

export const txApi = {
  /** Ouvre une nouvelle transaction. Retourne { txId }. */
  open: (userId, title) =>
    request('POST', '/transactions', userId, { userId, title }),

  /** Statut de la transaction courante OPEN de l'utilisateur. */
  current: (userId) =>
    request('GET', `/transactions/current?userId=${userId}`, userId),

  /** Commite avec un commentaire. */
  commit: (userId, txId, comment) =>
    request('POST', `/transactions/${txId}/commit`, userId, { userId, comment }),

  /** Annule et supprime la transaction. */
  rollback: (userId, txId) =>
    request('POST', `/transactions/${txId}/rollback`, userId, { userId }),

  /** Détail d'une transaction. */
  get: (userId, txId) =>
    request('GET', `/transactions/${txId}`, userId),

  /** Versions dans une transaction. */
  versions: (userId, txId) =>
    request('GET', `/transactions/${txId}/versions`, userId),
};

/** Construit les headers avec X-PLM-User + X-PLM-Tx (si txId fourni). */
export function authHeaders(userId, txId) {
  const h = { 'Content-Type': 'application/json', 'X-PLM-User': userId };
  if (txId) h['X-PLM-Tx'] = txId;
  return h;
}

/** Version de request qui inclut le txId dans le header. */
export async function txRequest(method, path, userId, txId, body) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: authHeaders(userId, txId),
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({ error: res.statusText }));
    const err = new Error(payload.error || `HTTP ${res.status}`);
    err.detail = payload;
    throw err;
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Surcharges avec txId explicite
export const authoringApi = {
  checkout: (userId, txId, nodeId) =>
    txRequest('POST', `/nodes/${nodeId}/checkout`, userId, txId, { userId }),

  modify: (userId, txId, nodeId, attributes, description) =>
    txRequest('PUT', `/nodes/${nodeId}`, userId, txId, { userId, attributes, description }),

  transition: (userId, txId, nodeId, transitionId) =>
    txRequest('POST', `/nodes/${nodeId}/transitions/${transitionId}`, userId, txId, { userId }),

  sign: (userId, txId, nodeId, meaning, comment) =>
    txRequest('POST', `/nodes/${nodeId}/signatures`, userId, txId, { userId, meaning, comment }),

  createLink: (userId, txId, linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId) =>
    txRequest('POST', '/nodes/links', userId, txId,
      { userId, linkTypeId, sourceNodeId, targetNodeId, pinnedVersionId: pinnedVersionId || null }),
};
