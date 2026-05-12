// Worker thread for parallel STEP file splitting.
// Receives a batch of products + all shared read-only structures via workerData.
// Posts back an array of part results (with stepContent) for the batch.

import { workerData, parentPort } from 'worker_threads';
import {
  findDefinitionalChain,
  collectForwardClosure,
  expandSRRClosure,
  reconstructStepFile,
  buildNauoExtractor,
} from './step-lib.js';

const {
  entityMap,
  refGraphArr,
  reverseRefGraphArr,
  reverseFromSRRArr,
  productStepIdsArr,
  allEntrySRIdsArr,
  prodDefs,
  srToProductId,
  headerSection,
  nauoData,
  idMap,
  occurrencesOf,
  hasChildrenArr,
  products,
} = workerData;

// Reconstruct Sets from serialised arrays
const refGraph = {};
for (const [id, arr] of Object.entries(refGraphArr))      refGraph[id]      = new Set(arr);
const reverseRefGraph = {};
for (const [id, arr] of Object.entries(reverseRefGraphArr)) reverseRefGraph[id] = new Set(arr);
const reverseFromSRR = {};
for (const [id, arr] of Object.entries(reverseFromSRRArr))  reverseFromSRR[id]  = new Set(arr);
const productStepIds = new Set(productStepIdsArr);
const allEntrySRIds  = new Set(allEntrySRIdsArr);
const hasChildrenSet = new Set(hasChildrenArr);

const getMatrixForNauo = buildNauoExtractor(nauoData);

const results = products.map(({ stepId, prod }) => {
  const chain   = findDefinitionalChain(stepId, reverseRefGraph, refGraph, productStepIds, prodDefs);
  const closure = collectForwardClosure(chain, refGraph);
  expandSRRClosure(closure, reverseFromSRR, refGraph, reverseRefGraph, allEntrySRIds, srToProductId, stepId);

  const stepContent = reconstructStepFile(headerSection, closure, entityMap);

  return {
    nodeId:   idMap[stepId],
    name:     prod.name || prod.partNumber || `Part-${stepId}`,
    cadType:  hasChildrenSet.has(stepId) ? 'ASSEMBLY' : 'PART',
    occurrences: (occurrencesOf[stepId] ?? [])
      .map(occ => ({
        parentId:       idMap[occ.parentProductId] ?? null,
        positionMatrix: getMatrixForNauo(occ.nauoId),
      }))
      .filter(o => o.parentId !== null),
    attributes: Object.fromEntries(
      [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
    ),
    stepContent,
  };
});

parentPort.postMessage(results);
