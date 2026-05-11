#!/usr/bin/env node
// Usage: node test-parse.js path/to/assembly.step
// Prints: each node that has occurrences, with positionMatrix presence
import { readFileSync } from 'fs';

const filePath = process.argv[2];
if (!filePath) { console.error('Usage: node test-parse.js <file.step>'); process.exit(1); }

const content = readFileSync(filePath, 'utf8');

// ── inline the two functions from app.js ──────────────────────────────────────

function buildMatrix4x4(origin, dirX, dirZ) {
  const normalize = v => {
    const len = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return len > 0 ? v.map(c => c / len) : [0, 0, 0];
  };
  const cross = (a, b) => [a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const ox = origin[0] ?? 0, oy = origin[1] ?? 0, oz = origin[2] ?? 0;
  const z = normalize(dirZ ?? [0, 0, 1]);
  const x = normalize(dirX ?? [1, 0, 0]);
  const y = normalize(cross(z, x));
  return [x[0],y[0],z[0],ox, x[1],y[1],z[1],oy, x[2],y[2],z[2],oz, 0,0,0,1];
}

function makeNauoMatrixExtractor(data, nauoIdSet) {
  function byType(typeName) {
    const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
    const out = {}; let m;
    while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
    return out;
  }
  function split(s) {
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
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  const cartPoints = {};
  for (const [id, args] of Object.entries(byType('CARTESIAN_POINT'))) {
    const p = split(args);
    const nums = (p[1] ?? '').replace(/[()]/g, '').split(',').map(Number);
    if (nums.length >= 3 && !nums.some(isNaN)) cartPoints[id] = nums;
  }
  const directions = {};
  for (const [id, args] of Object.entries(byType('DIRECTION'))) {
    const p = split(args);
    const nums = (p[1] ?? '').replace(/[()]/g, '').split(',').map(Number);
    if (nums.length >= 3 && !nums.some(isNaN)) directions[id] = nums;
  }
  const axis2p3d = {};
  for (const [id, args] of Object.entries(byType('AXIS2_PLACEMENT_3D'))) {
    const p = split(args);
    axis2p3d[id] = { originId: ref(p[1]), dirZId: ref(p[2]), dirXId: ref(p[3]) };
  }
  const nauoToPds = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const defRef = ref(split(args)[2]);
    if (defRef && nauoIdSet.has(defRef)) nauoToPds[defRef] = pdsId;
  }
  const pdsToCdsr = {};
  for (const [, args] of Object.entries(byType('CONTEXT_DEPENDENT_SHAPE_REPRESENTATION'))) {
    const p = split(args);
    const srrId = ref(p[0]), pdsId = ref(p[1]);
    if (srrId && pdsId) pdsToCdsr[pdsId] = srrId;
  }
  const srrMap = {};
  for (const [id, args] of Object.entries(byType('SHAPE_REPRESENTATION_RELATIONSHIP'))) {
    const p = split(args);
    const sr1 = ref(p[2]), sr2 = ref(p[3]);
    if (sr1 && sr2) srrMap[id] = [sr1, sr2];
  }
  const compoundSrrToIdt = {};
  { const re = /#(\d+)\s*=\s*\(\s*REPRESENTATION_RELATIONSHIP\s*\([^)]*\)\s*REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION\s*\(\s*#(\d+)\s*\)/g; let m;
    while ((m = re.exec(data)) !== null) compoundSrrToIdt[m[1]] = m[2]; }
  const idtToA2p3d = {};
  for (const [id, args] of Object.entries(byType('ITEM_DEFINED_TRANSFORMATION'))) {
    const a2pId = ref(split(args)[2]);
    if (a2pId) idtToA2p3d[id] = a2pId;
  }
  const itemToSr = {};
  const srItems = {};
  for (const [id, args] of Object.entries({
    ...byType('SHAPE_REPRESENTATION'),
    ...byType('ADVANCED_BREP_SHAPE_REPRESENTATION'),
    ...byType('GEOMETRICALLY_BOUNDED_WIREFRAME_SHAPE_REPRESENTATION'),
  })) {
    const p = split(args);
    const refs = []; const re2 = /#(\d+)/g; let m;
    while ((m = re2.exec(p[1] ?? '')) !== null) { refs.push(m[1]); itemToSr[m[1]] = id; }
    srItems[id] = refs;
  }
  const nauoPdsIds = new Set(Object.values(nauoToPds));
  const pdsToPsr = {};
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = split(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (pdsId && srId && nauoPdsIds.has(pdsId)) pdsToPsr[pdsId] = srId;
  }
  const _fmts = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const pid = ref(split(args)[2]);
    if (pid) _fmts[id] = pid;
  }
  const _pdefs = {};
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(split(args)[2]);
    if (fid && _fmts[fid]) _pdefs[id] = _fmts[fid];
  }
  const nauoInfo = {};
  for (const [nauoId, args] of Object.entries({
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  })) {
    if (!nauoIdSet.has(nauoId)) continue;
    const p = split(args);
    const parPdId = ref(p[3]), chiPdId = ref(p[4]);
    if (parPdId && chiPdId && _pdefs[parPdId] && _pdefs[chiPdId]) {
      nauoInfo[nauoId] = { parentProduct: _pdefs[parPdId], childProduct: _pdefs[chiPdId] };
    }
  }
  const _productOfPds = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const defRef = ref(split(args)[2]);
    if (defRef && _pdefs[defRef]) _productOfPds[pdsId] = _pdefs[defRef];
  }
  const productToSr = {};
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = split(args);
    const pdsId = ref(p[0]), srId = ref(p[1]);
    if (pdsId && srId && _productOfPds[pdsId]) productToSr[_productOfPds[pdsId]] = srId;
  }
  const reprMapToSr = {};
  for (const [id, args] of Object.entries(byType('REPRESENTATION_MAP'))) {
    const srId = ref(split(args)[1]);
    if (srId) reprMapToSr[id] = srId;
  }
  const srToMappedItems = {};
  for (const [miId, args] of Object.entries(byType('MAPPED_ITEM'))) {
    const p = split(args);
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

  // Debug: dump entity counts
  console.log('\n=== ENTITY COUNTS ===');
  console.log('NAUO entities:', Object.keys(nauoToPds).length, 'have own PDS (AP214),',
    Object.keys(nauoInfo).length, 'total');
  console.log('productToSr entries:', Object.keys(productToSr).length);
  console.log('reprMapToSr entries:', Object.keys(reprMapToSr).length);
  console.log('MAPPED_ITEM groups:', Object.keys(srToMappedItems).length,
    'SRs, total items:', Object.values(srToMappedItems).reduce((s,a)=>s+a.length,0));
  console.log('axis2p3d entities:', Object.keys(axis2p3d).length);
  console.log('CDSR entities:', Object.keys(pdsToCdsr).length);
  console.log('SRR entities:', Object.keys(srrMap).length);
  console.log('Compound SRR (RR_WITH_TRANSFORM):', Object.keys(compoundSrrToIdt).length);
  console.log('IDT entities:', Object.keys(idtToA2p3d).length);
  // Diagnose CDSR indexing: does it reference NAUO or PDS?
  const _pdsIdSet = new Set(Object.values(nauoToPds));
  const _cdsrKeys = Object.keys(pdsToCdsr);
  console.log('CDSR keys match NAUO id:', _cdsrKeys.filter(k => nauoIdSet.has(k)).length,
    '/ PDS id:', _cdsrKeys.filter(k => _pdsIdSet.has(k)).length);

  return function getMatrixForNauo(nauoId) {
    const pdsId = nauoToPds[nauoId];
    if (pdsId) {
      // AP214: CDSR arg[1] may be NAUO (standard) or its PDS (some exporters) — try both
      const srrId = pdsToCdsr[pdsId] ?? pdsToCdsr[nauoId];
      if (srrId) {
        const srs = srrMap[srrId];
        if (srs) {
          for (const srId of srs) {
            for (const itemId of (srItems[srId] ?? [])) {
              const a2p = axis2p3d[itemId];
              if (!a2p) continue;
              const origin = cartPoints[a2p.originId] ?? [0,0,0];
              return buildMatrix4x4(origin, a2p.dirXId ? directions[a2p.dirXId] : null, a2p.dirZId ? directions[a2p.dirZId] : null);
            }
          }
        }
        // Compound SRR: REPRESENTATION_RELATIONSHIP_WITH_TRANSFORMATION → IDT → A2P3D
        const a2pId = idtToA2p3d[compoundSrrToIdt[srrId]];
        if (a2pId) {
          const a2p = axis2p3d[a2pId];
          if (a2p) {
            const origin = cartPoints[a2p.originId] ?? [0,0,0];
            return buildMatrix4x4(origin, a2p.dirXId ? directions[a2p.dirXId] : null, a2p.dirZId ? directions[a2p.dirZId] : null);
          }
        }
      }
      const srId = pdsToPsr[pdsId];
      if (srId) {
        for (const itemId of (srItems[srId] ?? [])) {
          const a2p = axis2p3d[itemId];
          if (!a2p) continue;
          const origin = cartPoints[a2p.originId] ?? [0,0,0];
          return buildMatrix4x4(origin, a2p.dirXId ? directions[a2p.dirXId] : null, a2p.dirZId ? directions[a2p.dirZId] : null);
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
    const origin = cartPoints[a2p.originId] ?? [0,0,0];
    return buildMatrix4x4(origin, a2p.dirXId ? directions[a2p.dirXId] : null, a2p.dirZId ? directions[a2p.dirZId] : null);
  };
}

// ── run parseStep inline ──────────────────────────────────────────────────────

const { randomUUID } = await import('crypto');

const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
if (!dataMatch) { console.error('No DATA section'); process.exit(1); }

const data = dataMatch[1].replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\r?\n\s*/g, ' ');

function byType(typeName) {
  const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
  const out = {}; let m;
  while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
  return out;
}
function split(s) {
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
const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };
const str = s => { const m = s?.match(/^'(.*)'$/s); return m ? m[1] : (s ?? '').trim(); };

const products = {};
for (const [id, args] of Object.entries(byType('PRODUCT'))) {
  const p = split(args);
  products[id] = { partNumber: str(p[0]), name: str(p[1]) };
}
const formations = {};
for (const [id, args] of Object.entries({
  ...byType('PRODUCT_DEFINITION_FORMATION'),
  ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
})) {
  const p = split(args);
  const pid = ref(p[2]);
  if (pid) formations[id] = { productId: pid };
}
const prodDefs = {};
for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
  const fid = ref(split(args)[2]);
  if (fid && formations[fid]) prodDefs[id] = formations[fid].productId;
}
const nauoEntities = {
  ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
  ...byType('ASSEMBLY_COMPONENT_USAGE'),
};
const occurrencesOf = {};
for (const [nauoId, args] of Object.entries(nauoEntities)) {
  const p = split(args);
  const par = ref(p[3]), chi = ref(p[4]);
  if (par && chi && prodDefs[par] && prodDefs[chi]) {
    (occurrencesOf[prodDefs[chi]] ??= []).push({ parentProductId: prodDefs[par], nauoId });
  }
}

const getMatrixForNauo = makeNauoMatrixExtractor(data, new Set(Object.keys(nauoEntities)));

const idMap = {};
for (const stepId of Object.keys(products)) idMap[stepId] = randomUUID();

console.log('\n=== OCCURRENCE POSITIONS ===');
let withPos = 0, withoutPos = 0;
for (const [stepId, prod] of Object.entries(products)) {
  const occs = occurrencesOf[stepId];
  if (!occs?.length) continue;
  for (const occ of occs) {
    const matrix = getMatrixForNauo(occ.nauoId);
    const parentName = products[occ.parentProductId]?.name ?? occ.parentProductId;
    if (matrix) {
      withPos++;
      const t = [matrix[3].toFixed(3), matrix[7].toFixed(3), matrix[11].toFixed(3)];
      console.log(`  OK  "${prod.name}" in "${parentName}" → translation [${t}]`);
    } else {
      withoutPos++;
      console.log(`  NULL "${prod.name}" in "${parentName}" → no matrix`);
    }
  }
}
console.log(`\nResult: ${withPos} with position, ${withoutPos} without`);
