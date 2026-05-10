import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';
import { mkdir, writeFile, rm } from 'fs/promises';
import { createReadStream } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

// In-memory job store: jobId → { status, parts?, error?, dir? }
const splitJobs = new Map();
const JOB_TTL_MS = 15 * 60 * 1000; // 15 minutes

app.get('/health', (_req, res) => res.json({ status: 'UP' }));

app.post('/parse', upload.single('file'), async (req, res) => {
  const format = (req.body?.format ?? 'STEP').toUpperCase();
  if (!req.file) return res.status(400).json({ error: 'No file provided' });

  try {
    const content = req.file.buffer.toString('utf8');
    const nodes = format === 'STEP'     ? parseStep(content)
                : format === 'CATIA_V5' ? parseCatiaProduct(content)
                : null;

    if (!nodes) return res.status(400).json({ error: `Unknown format: ${format}` });
    res.json({ format, nodes });
  } catch (err) {
    res.status(422).json({ error: err.message });
  }
});

// POST /split — submits async job, returns 202 + jobId immediately
app.post('/split', upload.single('file'), (req, res) => {
  const format = (req.body?.format ?? 'STEP').toUpperCase();
  if (!req.file) return res.status(400).json({ error: 'No file provided' });
  if (format !== 'STEP') return res.status(422).json({ error: `Split not supported for format: ${format}` });

  const jobId  = randomUUID();
  const jobDir = join(tmpdir(), 'cad-split', jobId);
  splitJobs.set(jobId, { status: 'PENDING' });

  res.status(202).json({ jobId });

  // Process in background — release the HTTP response immediately
  const content = req.file.buffer.toString('utf8');
  setImmediate(async () => {
    try {
      await mkdir(jobDir, { recursive: true });
      const parts = splitStep(content);

      const partMeta = [];
      for (let i = 0; i < parts.length; i++) {
        const { stepContent, ...meta } = parts[i];
        await writeFile(join(jobDir, `part-${i}.stp`), stepContent, 'utf8');
        partMeta.push(meta);
      }

      splitJobs.set(jobId, { status: 'DONE', parts: partMeta, dir: jobDir });
      console.log(`Split job ${jobId} done: ${partMeta.length} parts`);

      setTimeout(() => {
        rm(jobDir, { recursive: true, force: true }).catch(() => {});
        splitJobs.delete(jobId);
      }, JOB_TTL_MS);
    } catch (err) {
      console.error(`Split job ${jobId} failed:`, err.message);
      splitJobs.set(jobId, { status: 'ERROR', error: err.message });
    }
  });
});

// GET /split/:jobId — poll job status + metadata (no file bytes)
app.get('/split/:jobId', (req, res) => {
  const job = splitJobs.get(req.params.jobId);
  if (!job) return res.status(404).json({ error: 'Job not found' });
  if (job.status === 'PENDING') return res.json({ status: 'PENDING' });
  if (job.status === 'ERROR')   return res.status(422).json({ status: 'ERROR', error: job.error });
  res.json({ status: 'DONE', parts: job.parts });
});

// GET /split/:jobId/part/:index — stream part STEP file bytes
app.get('/split/:jobId/part/:index', (req, res) => {
  const job = splitJobs.get(req.params.jobId);
  if (!job)                    return res.status(404).json({ error: 'Job not found' });
  if (job.status !== 'DONE')   return res.status(409).json({ error: 'Job not ready' });

  const index = parseInt(req.params.index, 10);
  if (isNaN(index) || index < 0 || index >= job.parts.length) {
    return res.status(404).json({ error: 'Part index out of range' });
  }

  const partPath = join(job.dir, `part-${index}.stp`);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  createReadStream(partPath).pipe(res);
});

app.listen(8090, () => console.log('cad-parser listening on :8090'));

// ---------------------------------------------------------------------------
// STEP P21 BOM parser — pure text, no WASM
// Handles AP203 / AP214 / AP242 assembly structures.
// ---------------------------------------------------------------------------
function parseStep(content) {
  const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
  if (!dataMatch) throw new Error('No DATA section in STEP file');

  // Strip inline comments and normalise multi-line entities into one line each
  const data = dataMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, ' ')   // /* comments */
    .replace(/\r?\n\s*/g, ' ');

  // ── entity extractor ──────────────────────────────────────────────────────
  function byType(typeName) {
    const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
    const out = {};
    let m;
    while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
    return out;
  }

  // Split top-level comma args respecting nested parentheses
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

  const str = s => { const m = s?.match(/^'(.*)'$/s); return m ? m[1] : (s ?? '').trim(); };
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  // PRODUCT('partNumber','name','description', context_refs)
  const products = {};
  for (const [id, args] of Object.entries(byType('PRODUCT'))) {
    const p = split(args);
    products[id] = { partNumber: str(p[0]), name: str(p[1]), description: str(p[2] ?? '') };
  }

  // PRODUCT_DEFINITION_FORMATION[_WITH_SPECIFIED_SOURCE]('rev','desc',#PRODUCT)
  const formations = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const p = split(args);
    const pid = ref(p[2]);
    if (pid) formations[id] = { revision: str(p[0]), productId: pid };
  }

  // PRODUCT_DEFINITION('design','desc',#FORMATION, #CONTEXT)
  const prodDefs = {};   // productDefId → productId
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(split(args)[2]);
    if (fid && formations[fid]) prodDefs[id] = formations[fid].productId;
  }

  // NEXT_ASSEMBLY_USAGE_OCCURRENCE('','','',#PARENT_PD,#CHILD_PD, ...)
  const parentOf = {};   // childProductId → parentProductId
  for (const [, args] of Object.entries({
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  })) {
    const p = split(args);
    const par = ref(p[3]), chi = ref(p[4]);
    if (par && chi && prodDefs[par] && prodDefs[chi]) {
      parentOf[prodDefs[chi]] = prodDefs[par];
    }
  }

  if (!Object.keys(products).length) throw new Error('No PRODUCT entities found — may not be an assembly STEP file');

  // Build flat node list
  const idMap = {};
  const nodes = Object.entries(products).map(([stepId, prod]) => {
    const id = randomUUID();
    idMap[stepId] = id;
    return { _s: stepId, id, name: prod.name || prod.partNumber || `Part-${stepId}`,
             type: 'PART', parentId: null,
             attributes: Object.fromEntries(
               [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
             ) };
  });

  const hasChildren = new Set();
  for (const n of nodes) {
    const parStepId = parentOf[n._s];
    if (parStepId && idMap[parStepId]) { n.parentId = idMap[parStepId]; hasChildren.add(idMap[parStepId]); }
    delete n._s;
  }
  for (const n of nodes) n.type = hasChildren.has(n.id) ? 'ASSEMBLY' : 'PART';

  return nodes;
}

// ---------------------------------------------------------------------------
// CATIA V5 CATProduct — XML parse
// ---------------------------------------------------------------------------
function parseCatiaProduct(xml) {
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_' });
  let doc;
  try { doc = parser.parse(xml); } catch (e) { throw new Error(`Invalid CATProduct XML: ${e.message}`); }

  const nodes = [];
  walkXml(doc, null, nodes);
  if (!nodes.length) nodes.push({ id: randomUUID(), name: 'Unknown', type: 'PART', parentId: null, attributes: {} });
  return nodes;
}

const CAT_TAGS = new Set(['Node', 'ProductInstance', 'Reference3D', 'Product', 'PRODUCTSTRUCTURE']);

function walkXml(el, parentId, out) {
  if (typeof el !== 'object' || el === null) return;
  for (const [tag, value] of Object.entries(el)) {
    if (tag.startsWith('@_') || tag === '#text') continue;
    const items = Array.isArray(value) ? value : [value];
    for (const child of items) {
      if (typeof child !== 'object') continue;
      if (CAT_TAGS.has(tag)) {
        const id       = child['@_id'] ?? randomUUID();
        const name     = child['@_NodeName'] ?? child['@_PartNumber'] ?? child['@_name'] ?? tag;
        const revision = child['@_Revision'] ?? child['@_revision'] ?? '';
        const desc     = child['@_DescriptionRef'] ?? child['@_description'] ?? '';
        const childKeys = Object.keys(child).filter(k => !k.startsWith('@_') && k !== '#text');
        const hasKids   = childKeys.some(k => CAT_TAGS.has(k));
        out.push({ id, name, type: hasKids ? 'ASSEMBLY' : 'PART', parentId,
                   attributes: Object.fromEntries([['revision', revision], ['description', desc]].filter(([, v]) => v)) });
        walkXml(child, id, out);
      } else {
        walkXml({ [tag]: child }, parentId, out);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// STEP per-part file splitter
// For each PRODUCT entity: computes the transitive entity closure (stopping at
// other product boundaries) and reconstructs a minimal valid STEP file.
// ---------------------------------------------------------------------------

function buildEntityMap(normalizedData) {
  const map = {};
  for (const seg of normalizedData.split(';')) {
    const t = seg.trim();
    const m = t.match(/^#(\d+)\s*=/);
    if (m) map[m[1]] = t + ';';
  }
  return map;
}

function buildRefGraph(entityMap) {
  const graph = {};
  for (const [id, line] of Object.entries(entityMap)) {
    graph[id] = new Set();
    const body = line.replace(/^#\d+\s*=\s*/, '');
    const refRe = /#(\d+)/g;
    let m;
    while ((m = refRe.exec(body)) !== null) graph[id].add(m[1]);
  }
  return graph;
}

// Build reverse reference graph: entity B → Set of entity IDs that reference B.
function buildReverseRefGraph(entityMap) {
  const rg = {};
  for (const [id, line] of Object.entries(entityMap)) {
    const body = line.replace(/^#\d+\s*=\s*/, '');
    const refRe = /#(\d+)/g;
    let m;
    while ((m = refRe.exec(body)) !== null) (rg[m[1]] ??= new Set()).add(id);
  }
  return rg;
}

// Phase 1 — reverse BFS from productStepId.
// Finds the product's own definitional chain: PRODUCT_DEFINITION_FORMATION,
// PRODUCT_DEFINITION, PRODUCT_DEFINITION_SHAPE, SHAPE_DEFINITION_REPRESENTATION.
// Stops at other PRODUCT entities AND skips cross-product linking entities
// (NAUO/ASSEMBLY_COMPONENT_USAGE) to prevent pulling in parent/sibling geometry.
function findDefinitionalChain(productStepId, reverseRefGraph, refGraph, productStepIds, prodDefs) {
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
      if (productStepIds.has(referrer)) continue; // other PRODUCT entity — stop

      // Skip cross-product linking entities (NAUO, ASSEMBLY_COMPONENT_USAGE, etc.):
      // detected as any entity that references one of our PDs AND also references a
      // PD belonging to a DIFFERENT product. Including them would contaminate forward
      // BFS with parent/sibling product definitions.
      const refs = refGraph[referrer] ?? new Set();
      const refsOurPD    = [...refs].some(r => myProdDefIds.has(r));
      const refsOtherPD  = [...refs].some(r => prodDefs[r] !== undefined && prodDefs[r] !== productStepId);
      if (refsOurPD && refsOtherPD) continue;

      chain.add(referrer);
      queue.push(referrer);
    }
  }
  return chain;
}

// Phase 2 — unrestricted forward BFS from the clean definitional chain.
// No product boundary stopping: the chain already excludes cross-product entities,
// so forward refs lead only to this product's own geometry and shared contexts.
function collectForwardClosure(seeds, refGraph) {
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

function reconstructStepFile(headerSection, closureIds, entityMap) {
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

function splitStep(content) {
  const headerMatch = content.match(/(HEADER;[\s\S]*?ENDSEC;)/);
  const headerSection = headerMatch ? headerMatch[1] : 'HEADER;\nENDSEC;';

  const dataMatch = content.match(/DATA;([\s\S]*?)ENDSEC;/);
  if (!dataMatch) throw new Error('No DATA section in STEP file');
  const data = dataMatch[1]
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/\r?\n\s*/g, ' ');

  const entityMap      = buildEntityMap(data);
  const refGraph       = buildRefGraph(entityMap);
  const reverseRefGraph = buildReverseRefGraph(entityMap);

  // ── BOM extraction (mirrors parseStep) ───────────────────────────────────
  function byType(typeName) {
    const re = new RegExp(`#(\\d+)\\s*=\\s*${typeName}\\s*\\(([^;]*)\\)\\s*;`, 'g');
    const out = {}; let m;
    while ((m = re.exec(data)) !== null) out[m[1]] = m[2];
    return out;
  }
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
  const str = s => { const m = s?.match(/^'(.*)'$/s); return m ? m[1] : (s ?? '').trim(); };
  const ref = s => { const m = s?.trim().match(/^#(\d+)$/); return m ? m[1] : null; };

  const products = {};
  for (const [id, args] of Object.entries(byType('PRODUCT'))) {
    const p = splitArgs(args);
    products[id] = { partNumber: str(p[0]), name: str(p[1]), description: str(p[2] ?? '') };
  }
  const formations = {};
  for (const [id, args] of Object.entries({
    ...byType('PRODUCT_DEFINITION_FORMATION'),
    ...byType('PRODUCT_DEFINITION_FORMATION_WITH_SPECIFIED_SOURCE'),
  })) {
    const p = splitArgs(args);
    const pid = ref(p[2]);
    if (pid) formations[id] = { productId: pid };
  }
  const prodDefs = {};
  for (const [id, args] of Object.entries(byType('PRODUCT_DEFINITION'))) {
    const fid = ref(splitArgs(args)[2]);
    if (fid && formations[fid]) prodDefs[id] = formations[fid].productId;
  }
  const parentOf = {};
  for (const [, args] of Object.entries({
    ...byType('NEXT_ASSEMBLY_USAGE_OCCURRENCE'),
    ...byType('ASSEMBLY_COMPONENT_USAGE'),
  })) {
    const p = splitArgs(args);
    const par = ref(p[3]), chi = ref(p[4]);
    if (par && chi && prodDefs[par] && prodDefs[chi]) parentOf[prodDefs[chi]] = prodDefs[par];
  }

  if (!Object.keys(products).length) throw new Error('No PRODUCT entities found — may not be an assembly STEP file');

  const hasChildren    = new Set(Object.values(parentOf));
  const productStepIds = new Set(Object.keys(products));
  const idMap = {};
  for (const stepId of Object.keys(products)) idMap[stepId] = randomUUID();

  // ── Pre-compute SRR expansion structures (computed once, used per product) ──
  //
  // In AP214, SDR links to a "positioning" SHAPE_REPRESENTATION (contains only
  // AXIS2_PLACEMENT_3D). The actual B-rep geometry lives in a second SR reachable
  // only via SHAPE_REPRESENTATION_RELATIONSHIP (SRR), which REFERENCES the
  // positioning SR — not the other way around. Forward BFS from SDR therefore
  // misses all geometry. Phase 3 below repairs this by traversing SRR edges.
  //
  // Guard: an SRR whose "other end" is another product's SDR-entry SR is an
  // assembly-context positioning link (child in parent assembly). Skip those to
  // avoid pulling child geometry into parent assembly files.

  // PRODUCT_DEFINITION_SHAPE: pds_id → pd_id (arg[2])
  const pdsToPdId = {};
  for (const [pdsId, args] of Object.entries(byType('PRODUCT_DEFINITION_SHAPE'))) {
    const pdId = ref(splitArgs(args)[2]);
    if (pdId) pdsToPdId[pdsId] = pdId;
  }

  // SDR: maps the SR directly linked from each product's SDR → that product's step ID
  // (these are the "entry-point" SRs — crossing into one of these means crossing a product boundary)
  const srToProductId = {}; // sr_id → product_step_id
  for (const [, args] of Object.entries(byType('SHAPE_DEFINITION_REPRESENTATION'))) {
    const p = splitArgs(args);
    const pdsId = ref(p[0]);
    const srId  = ref(p[1]);
    if (!pdsId || !srId) continue;
    const pdId      = pdsToPdId[pdsId];
    const productId = pdId ? prodDefs[pdId] : null;
    if (productId) srToProductId[srId] = productId;
  }
  const allEntrySRIds = new Set(Object.keys(srToProductId));

  // SRR entity IDs — catches both simple and complex (AP203 compound) entities
  const allSRRIds = new Set();
  for (const [id, line] of Object.entries(entityMap)) {
    if (line.includes('SHAPE_REPRESENTATION_RELATIONSHIP')) allSRRIds.add(id);
  }

  // reverseFromSRR[entity_id] = Set of SRR ids that reference entity_id
  const reverseFromSRR = {};
  for (const srrId of allSRRIds) {
    for (const refId of (refGraph[srrId] ?? [])) {
      (reverseFromSRR[refId] ??= new Set()).add(srrId);
    }
  }

  return Object.entries(products).map(([stepId, prod]) => {
    // Phase 1: reverse BFS — definitional chain (PRODUCT → PDF → PD → PDS → SDR),
    // skipping NAUO/ACU cross-product linking entities.
    const chain = findDefinitionalChain(stepId, reverseRefGraph, refGraph, productStepIds, prodDefs);

    // Phase 2: forward BFS from the chain — reaches the entry-point SR and
    // in AP203 (where SDR links directly to the geometry SR) all geometry too.
    const closure = collectForwardClosure(chain, refGraph);

    // Phase 3: SRR expansion — for each entity in the closure, find any
    // SHAPE_REPRESENTATION_RELATIONSHIP that references it, then include the SRR
    // and the geometry SR on the other end (plus its full forward closure).
    // Skip SRRs that bridge to another product's entry SR (assembly-context links).
    //
    // Uses a growing array with a forward pointer (O(n)) instead of shift() (O(n²)).
    // New entities discovered during expansion are appended to the array and processed
    // in subsequent iterations of the same loop.
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

        // Always include the SRR itself (both same-product geometry bridges and
        // cross-product assembly-context links with their transformation matrices).
        closure.add(srrId);
        srrCheckQueue.push(srrId);

        if (crossRefs.length > 0) {
          // Assembly-context SRR: include the SRR + transformation entities (safeRefs),
          // plus the child's entry SR as a stub (referenced by the SRR, but don't
          // forward-expand into the child's geometry — that lives in the child's file).
          // Also include CDSRs that tie this SRR to the assembly occurrence PDS.
          for (const r of crossRefs) closure.add(r); // entity stub, no expansion

          const sub = collectForwardClosure(new Set(safeRefs), refGraph);
          for (const e of sub) {
            if (!closure.has(e)) { closure.add(e); srrCheckQueue.push(e); }
          }

          // Pull in CDSRs (CONTEXT_DEPENDENT_SHAPE_REPRESENTATION) that reference
          // this SRR — they link the positioning to the NAUO occurrence PDS.
          for (const cdsr of (reverseRefGraph[srrId] ?? [])) {
            if (closure.has(cdsr)) continue;
            closure.add(cdsr);
            srrCheckQueue.push(cdsr);
            for (const r of (refGraph[cdsr] ?? [])) {
              if (!closure.has(r)) { closure.add(r); srrCheckQueue.push(r); }
            }
          }
        } else {
          // Same-product SRR (geometry bridge): full forward expansion.
          const sub = collectForwardClosure(new Set(newRefs), refGraph);
          for (const e of sub) {
            if (!closure.has(e)) { closure.add(e); srrCheckQueue.push(e); }
          }
        }
      }
    }

    const stepContent = reconstructStepFile(headerSection, closure, entityMap);
    return {
      nodeId:       idMap[stepId],
      name:         prod.name || prod.partNumber || `Part-${stepId}`,
      cadType:      hasChildren.has(stepId) ? 'ASSEMBLY' : 'PART',
      parentNodeId: parentOf[stepId] ? (idMap[parentOf[stepId]] ?? null) : null,
      attributes:   Object.fromEntries(
        [['partNumber', prod.partNumber], ['description', prod.description]].filter(([, v]) => v)
      ),
      stepContent,
    };
  });
}
