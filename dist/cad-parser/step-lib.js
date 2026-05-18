// Shared STEP processing helpers — imported by app.js and worker-split.js

// ── Module-private helpers ───────────────────────────────────────────────────

function splitArgs(s) {
  const parts = []; let depth = 0, cur = '';
  for (const ch of s) {
    if ('(['.includes(ch)) depth++;
    else if (')]'.includes(ch)) depth--;
    else if (ch === ',' && depth === 0) { parts.push(cur.trim()); cur = ''; continue; }
    cur += ch;
  }
  if (cur.trim()) parts.push(cur.trim());
  return parts;
}

function byType(data, typeName) {
  const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
  const out = {}; let m;
  while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
  return out;
}

const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

// ── Graph builders ───────────────────────────────────────────────────────────

export function buildEntityMap(normalizedData) {
  const map = {};
  for (const seg of normalizedData.split(';')) {
    const t = seg.trim();
    const m = t.match(/^#(\d+)\s*=/);
    if (m) map[m[1]] = t + ';';
  }
  return map;
}

export function buildRefGraph(entityMap) {
  const graph = {};
  for (const [id, line] of Object.entries(entityMap)) {
    graph[id] = new Set();
    const body = line.replace(/^#\d+\s*=\s*/, '');
    const refRe = /#(\d+)/g; let m;
    while ((m = refRe.exec(body)) !== null) graph[id].add(m[1]);
  }
  return graph;
}

export function buildReverseRefGraph(entityMap) {
  const rg = {};
  for (const [id, line] of Object.entries(entityMap)) {
    const body = line.replace(/^#\d+\s*=\s*/, '');
    const refRe = /#(\d+)/g; let m;
    while ((m = refRe.exec(body)) !== null) (rg[m[1]] ??= new Set()).add(id);
  }
  return rg;
}

// ── Closure computation ──────────────────────────────────────────────────────

export function findDefinitionalChain(productStepId, reverseRefGraph, refGraph, productStepIds, prodDefs) {
  const myProdDefIds = new Set(
    Object.entries(prodDefs).filter(([, pid]) => pid === productStepId).map(([id]) => id)
  );
  const chain = new Set([productStepId]);
  const queue = [productStepId];
  let ptr = 0;
  while (ptr < queue.length) {
    const id = queue[ptr++];
    for (const referrer of (reverseRefGraph[id] ?? [])) {
      if (chain.has(referrer)) continue;
      if (productStepIds.has(referrer)) continue;
      const refs = refGraph[referrer] ?? new Set();
      const refsOurPD   = [...refs].some(r => myProdDefIds.has(r));
      const refsOtherPD = [...refs].some(r => prodDefs[r] !== undefined && prodDefs[r] !== productStepId);
      if (refsOurPD && refsOtherPD) continue;
      chain.add(referrer);
      queue.push(referrer);
    }
  }
  return chain;
}

export function collectForwardClosure(seeds, refGraph) {
  const visited = new Set(seeds);
  const queue = [...seeds];
  let ptr = 0;
  while (ptr < queue.length) {
    const id = queue[ptr++];
    const deps = refGraph[id];
    if (deps) for (const dep of deps) if (!visited.has(dep)) { visited.add(dep); queue.push(dep); }
  }
  return visited;
}

// Expands `closure` in-place by traversing SHAPE_REPRESENTATION_RELATIONSHIP edges.
// Same algorithm as the SRR expansion block in splitStep, extracted for worker reuse.
export function expandSRRClosure(closure, reverseFromSRR, refGraph, reverseRefGraph, allEntrySRIds, srToProductId, stepId) {
  const srrCheckQueue = [...closure];
  const checkedForSRR = new Set();

  for (let i = 0; i < srrCheckQueue.length; i++) {
    const entityId = srrCheckQueue[i];
    if (checkedForSRR.has(entityId)) continue;
    checkedForSRR.add(entityId);

    for (const srrId of (reverseFromSRR[entityId] ?? [])) {
      if (closure.has(srrId)) continue;

      const srrRefs = refGraph[srrId] ?? new Set();
      const newRefs = [...srrRefs].filter(r => !closure.has(r));
      const crossRefs = newRefs.filter(r => allEntrySRIds.has(r) && srToProductId[r] !== stepId);
      const safeRefs  = newRefs.filter(r => !crossRefs.includes(r));

      closure.add(srrId);
      srrCheckQueue.push(srrId);

      if (crossRefs.length > 0) {
        for (const r of crossRefs) closure.add(r);
        const sub = collectForwardClosure(new Set(safeRefs), refGraph);
        for (const e of sub) { if (!closure.has(e)) { closure.add(e); srrCheckQueue.push(e); } }
        for (const cdsr of (reverseRefGraph[srrId] ?? [])) {
          if (closure.has(cdsr)) continue;
          closure.add(cdsr); srrCheckQueue.push(cdsr);
          for (const r of (refGraph[cdsr] ?? [])) {
            if (!closure.has(r)) { closure.add(r); srrCheckQueue.push(r); }
          }
        }
      } else {
        const sub = collectForwardClosure(new Set(newRefs), refGraph);
        for (const e of sub) { if (!closure.has(e)) { closure.add(e); srrCheckQueue.push(e); } }
      }
    }
  }
}

export function reconstructStepFile(headerSection, closureIds, entityMap) {
  const sorted = Array.from(closureIds)
    .filter(id => entityMap[id])
    .sort((a, b) => parseInt(a) - parseInt(b));
  const renumber = {};
  sorted.forEach((oldId, i) => { renumber[oldId] = String(i + 1); });
  const dataLines = sorted.map(oldId =>
    entityMap[oldId].replace(/#(\d+)/g, (_, refId) => '#' + (renumber[refId] ?? refId))
  );
  return ['ISO-10303-21;', headerSection, 'DATA;', ...dataLines, 'ENDSEC;', 'END-ISO-10303-21;'].join('\n');
}

// ── Matrix ───────────────────────────────────────────────────────────────────

export function buildMatrix4x4(origin, dirX, dirZ) {
  const normalize = v => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return len > 0 ? v.map(c => c / len) : [0, 0, 0];
  };
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const ox = origin[0] ?? 0, oy = origin[1] ?? 0, oz = origin[2] ?? 0;
  const z = normalize(dirZ ?? [0, 0, 1]);
  const x = normalize(dirX ?? [1, 0, 0]);
  const y = normalize(cross(z, x));
  return [x[0], y[0], z[0], ox, x[1], y[1], z[1], oy, x[2], y[2], z[2], oz, 0, 0, 0, 1];
}

// ── NAUO matrix extractor ────────────────────────────────────────────────────

// Pre-computes all NAUO positioning structures from the normalized data string
// into a plain serialisable object (no Sets/closures) suitable for worker transfer.
export function precomputeNauoData(data, nauoIdSet) {
  const cartPoints = {};
  for (const [id, args] of Object.entries(byType(data, 'CARTESIAN_POINT'))) {
    const p = splitArgs(args);
    const nums = (p[1] ?? '').replace(/[()]/g, '').split(',').map(Number);
    if (nums.length >= 3 && !nums.some(isNaN)) cartPoints[id] = nums;
  }
  const directions = {};
  for (const [id, args] of Object.entries(byType(data, 'DIRECTION'))) {
    const p = splitArgs(args);
    const nums = (p[1] ?? '').replace(/[()]/g, '').split(',').map(Number);
    if (nums.length >= 3 && !nums.some(isNaN)) directions[id] = nums;
  }
  const axis2p3d = {};
  for (const [id, args] of Object.entries(byType(data, 'AXIS2_PLACEMENT_3D'))) {
    const p = splitArgs(args);
    axis2p3d[id] = { originId: ref(p[1]), dirZId: ref(p[2]), dirXId: ref(p[3]) };
  }

  const nauoToPds = {};
  for (const [pdsId, args] of Object.entries(byType(data, 'PRODUCT_DEFINITION_SHAPE'))) {
    const p = splitArgs(args);
    const defRef = ref(p[2]);
    if (defRef && nauoIdSet.has(defRef)) nauoToPds[defRef] = pdsId;
  }

  const pdsToCdsr = {};
  for (const [, args] of Object.entries(byType(data, 'CONTEXT_DEPENDENT_SHAPE_REPRESENTATION'))) {
    const p = splitArgs(args);
    const srrId = ref(p[0]), pdsId = ref(p[1]);
    if (srrId && pdsId) pdsToCdsr[pdsId] = srrId;
  }

  const srrMap = {};
  for (const [id, args] of Object.entries(byType(data, 'SHAPE_REPRESENTATION_RELATIONSHIP'))) {
    const p = splitArgs(args);
    const sr1 = ref(p[2]), sr2 = ref(p[3]);
    if (sr1 && sr2) srrMap[id] = [sr1, sr2];
  }

  const compoundSrrToIdt = {};
  { const re = /#(\d+)\s*=\s*\(\s*REPRESENTATION_RELATIONSHIP\s*\([^)]*\)\s*REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION\s*\(\s*#(\d+)\s*\)/g; let m;
    while ((m = re.exec(data)) !== null) compoundSrrToIdt[m[1]] = m[2]; }

  const idtToA2p3d = {};
  for (const [id, args] of Object.entries(byType(data, 'ITEM_DEFINED_TRANSFORMATION'))) {
    const a2pId = ref(splitArgs(args)[2]);
    if (a2pId) idtToA2p3d[id] = a2pId;
  }

  const itemToSr = {};
  const srItems = {};
  for (const [id, args] of Object.entries({
    ...byType(data, 'SHAPE_REPRESENTATION'),
    ...byType(data, 'ADVANCED_BREP_SHAPE_REPRESENTATION'),
    ...byType(data, 'GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION'),
  })) {
    const p = splitArgs(args);
    const refs = []; const re2 = /#(\d+)/g; let m;
    while ((m = re2.exec(p[1] ?? '')) !== null) { refs.push(m[1]); itemToSr[m[1]] = id; }
    srItems[id] = refs;
  }

  const nauoPdsIds = new Set(Object.values(nauoToPds));
  const pdsToPsr = {};
  for (const [, args] of Object.entries(byType(data, 'SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = splitArgs(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (pdsId && srId && nauoPdsIds.has(pdsId)) pdsToPsr[pdsId] = srId;
  }

  const _fmts = {};
  for (const [id, args] of Object.entries({
    ...byType(data, 'PRODUCT_DEFINITION_FORMATION'),
    ...byType(data, 'PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const pid = ref(splitArgs(args)[2]);
    if (pid) _fmts[id] = pid;
  }
  const _pdefs = {};
  for (const [id, args] of Object.entries(byType(data, 'PRODUCT_DEFINITION'))) {
    const fid = ref(splitArgs(args)[2]);
    if (fid && _fmts[fid]) _pdefs[id] = _fmts[fid];
  }
  const nauoInfo = {};
  for (const [nauoId, args] of Object.entries({
    ...byType(data, 'NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType(data, 'ASSEMBLY_COMPONENT_USAGE'),
  })) {
    if (!nauoIdSet.has(nauoId)) continue;
    const p = splitArgs(args);
    const parPdId = ref(p[3]), chiPdId = ref(p[4]);
    if (parPdId && chiPdId && _pdefs[parPdId] && _pdefs[chiPdId]) {
      nauoInfo[nauoId] = { parentProduct: _pdefs[parPdId], childProduct: _pdefs[chiPdId] };
    }
  }

  const _productOfPds = {};
  for (const [pdsId, args] of Object.entries(byType(data, 'PRODUCT_DEFINITION_SHAPE'))) {
    const defRef = ref(splitArgs(args)[2]);
    if (defRef && _pdefs[defRef]) _productOfPds[pdsId] = _pdefs[defRef];
  }
  const productToSr = {};
  for (const [, args] of Object.entries(byType(data, 'SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = splitArgs(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (pdsId && srId && _productOfPds[pdsId]) productToSr[_productOfPds[pdsId]] = srId;
  }

  const reprMapToSr = {};
  for (const [id, args] of Object.entries(byType(data, 'REPRESENTATION_MAP'))) {
    const srId = ref(splitArgs(args)[1]);
    if (srId) reprMapToSr[id] = srId;
  }

  const srToMappedItems = {};
  for (const [miId, args] of Object.entries(byType(data, 'MAPPED_ITEM'))) {
    const p = splitArgs(args);
    const reprMapId = ref(p[1]), targetId = ref(p[2]);
    if (!reprMapId || !targetId) continue;
    const parentSrId = itemToSr[miId];
    if (parentSrId) (srToMappedItems[parentSrId] ??= []).push({ reprMapId, targetId });
  }

  const nauosByPairKey = {};
  for (const [nauoId, info] of Object.entries(nauoInfo)) {
    const key = `${info.parentProduct}:${info.childProduct}`;
    (nauosByPairKey[key] ??= []).push(nauoId);
  }

  return {
    cartPoints, directions, axis2p3d,
    nauoToPds, pdsToCdsr, srrMap, compoundSrrToIdt, idtToA2p3d,
    itemToSr, srItems, pdsToPsr,
    nauoInfo, productToSr, reprMapToSr, srToMappedItems, nauosByPairKey,
  };
}

// Builds a getMatrixForNauo(nauoId) closure from a precomputeNauoData() result.
export function buildNauoExtractor({ cartPoints, directions, axis2p3d, nauoToPds, pdsToCdsr, srrMap,
                                      compoundSrrToIdt, idtToA2p3d, itemToSr, srItems, pdsToPsr,
                                      nauoInfo, productToSr, reprMapToSr, srToMappedItems, nauosByPairKey }) {
  return function getMatrixForNauo(nauoId) {
    const pdsId = nauoToPds[nauoId];

    if (pdsId) {
      const srrId = pdsToCdsr[pdsId] ?? pdsToCdsr[nauoId];
      if (srrId) {
        const srs = srrMap[srrId];
        if (srs) {
          for (const srId of srs) {
            for (const itemId of (srItems[srId] ?? [])) {
              const a2p = axis2p3d[itemId];
              if (!a2p) continue;
              const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
              const dirZ   = a2p.dirZId ? directions[a2p.dirZId] : null;
              const dirX   = a2p.dirXId ? directions[a2p.dirXId] : null;
              return buildMatrix4x4(origin, dirX, dirZ);
            }
          }
        }
        const a2pId = idtToA2p3d[compoundSrrToIdt[srrId]];
        if (a2pId) {
          const a2p = axis2p3d[a2pId];
          if (a2p) {
            const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
            return buildMatrix4x4(origin, a2p.dirXId ? directions[a2p.dirXId] : null, a2p.dirZId ? directions[a2p.dirZId] : null);
          }
        }
      }
      const srId = pdsToPsr[pdsId];
      if (srId) {
        for (const itemId of (srItems[srId] ?? [])) {
          const a2p = axis2p3d[itemId];
          if (!a2p) continue;
          const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
          const dirZ   = a2p.dirZId ? directions[a2p.dirZId] : null;
          const dirX   = a2p.dirXId ? directions[a2p.dirXId] : null;
          return buildMatrix4x4(origin, dirX, dirZ);
        }
      }
    }

    const info = nauoInfo[nauoId];
    if (!info) return null;
    const parentSrId = productToSr[info.parentProduct];
    const childSrId  = productToSr[info.childProduct];
    if (!parentSrId || !childSrId) return null;

    const candidates = (srToMappedItems[parentSrId] ?? []).filter(mi => reprMapToSr[mi.reprMapId] === childSrId);
    if (!candidates.length) return null;

    const key = `${info.parentProduct}:${info.childProduct}`;
    const siblings = nauosByPairKey[key] ?? [nauoId];
    const idx = Math.max(0, siblings.indexOf(nauoId));
    const mi = candidates[Math.min(idx, candidates.length - 1)];

    const a2p = axis2p3d[mi.targetId];
    if (!a2p) return null;
    const origin = cartPoints[a2p.originId] ?? [0, 0, 0];
    const dirZ   = a2p.dirZId ? directions[a2p.dirZId] : null;
    const dirX   = a2p.dirXId ? directions[a2p.dirXId] : null;
    return buildMatrix4x4(origin, dirX, dirZ);
  };
}
