// Worker thread for parallel STEP closure computation.
// Receives serialised reference graphs + BOM structures; computes per-product
// closures only. Main thread does the streaming pass 2 to write part files.

import { workerData, parentPort } from 'worker_threads';
import {
  findDefinitionalChain,
  collectForwardClosure,
  expandSRRClosure,
  buildNauoExtractor,
} from './step-lib.js';

const {
  refGraphArr,
  reverseRefGraphArr,
  reverseFromSRRArr,
  prodDefsByProductIdArr,
  productStepIdsArr,
  allEntrySRIdsArr,
  prodDefs,
  srToProductId,
  nauoData,
  idMap,
  occurrencesOf,
  hasChildrenArr,
  products,
} = workerData;

const refGraph = {};
for (const [id, arr] of Object.entries(refGraphArr))        refGraph[id]        = new Set(arr);
const reverseRefGraph = {};
for (const [id, arr] of Object.entries(reverseRefGraphArr)) reverseRefGraph[id] = new Set(arr);
const reverseFromSRR = {};
for (const [id, arr] of Object.entries(reverseFromSRRArr))  reverseFromSRR[id]  = new Set(arr);

const productStepIds      = new Set(productStepIdsArr);
const allEntrySRIds       = new Set(allEntrySRIdsArr);
const hasChildrenSet      = new Set(hasChildrenArr);
const prodDefsByProductId = new Map(prodDefsByProductIdArr.map(([k, arr]) => [k, new Set(arr)]));

const getMatrixForNauo = buildNauoExtractor(nauoData);

const results = products.map(({ stepId, prod }) => {
  const chain   = findDefinitionalChain(stepId, reverseRefGraph, refGraph, productStepIds, prodDefs, prodDefsByProductId);
  const closure = collectForwardClosure(chain, refGraph);
  expandSRRClosure(closure, reverseFromSRR, refGraph, reverseRefGraph, allEntrySRIds, srToProductId, stepId);

  return {
    stepId,
    closureArr: [...closure],
    nodeId:  idMap[stepId],
    name:    prod.name || prod.partNumber || `Part-${stepId}`,
    cadType: hasChildrenSet.has(stepId) ? 'ASSEMBLY' : 'PART',
    occurrences: (occurrencesOf[stepId] ?? [])
      .map(occ => ({ parentId: idMap[occ.parentProductId] ?? null, positionMatrix: getMatrixForNauo(occ.nauoId) }))
      .filter(o => o.parentId !== null),
    attributes: Object.fromEntries(
      [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
    ),
  };
});

parentPort.postMessage(results);
