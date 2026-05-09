import express from 'express';
import multer from 'multer';
import { XMLParser } from 'fast-xml-parser';
import { randomUUID } from 'crypto';

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 500 * 1024 * 1024 } });

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
