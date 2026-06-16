// ============================================================
// Garage demo bootstrap (one-shot, idempotent)
//   - waits for the Garage admin API
//   - assigns + applies a single-node cluster layout
//   - creates the dst bucket
//   - imports the fixed S3 access key
//   - grants the key read/write/owner on the bucket
//
// Drives the Garage admin API v2 (port 3903). DEMO ONLY.
//
// Runs on node:20-slim (global fetch + native JSON) — no curl, no jq,
// no `apk add`, so it works in locked-down environments with no package
// network. Replaces the former bootstrap.sh.
// ============================================================

const ADMIN  = process.env.GARAGE_ADMIN_URL || 'http://garage:3903';
const TOKEN  = required('GARAGE_ADMIN_TOKEN');
const AK     = required('GARAGE_S3_ACCESS_KEY');
const SK     = required('GARAGE_S3_SECRET_KEY');
const BUCKET = process.env.GARAGE_S3_BUCKET || 'plm-dst';

function required(name) {
  const v = process.env[name];
  if (!v) { console.error(`[garage-bootstrap] ${name} required`); process.exit(1); }
  return v;
}

const log = (...m) => console.log('[garage-bootstrap]', ...m);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// api(method, path, body?) → parsed JSON (or null for empty body). Throws on !ok.
async function api(method, path, body) {
  const res = await fetch(ADMIN + path, {
    method,
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw new Error(`${method} ${path} → HTTP ${res.status}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// ── Wait for the admin API ──────────────────────────────────
let i = 0;
for (;;) {
  try {
    const r = await fetch(`${ADMIN}/v2/GetClusterStatus`, {
      headers: { Authorization: `Bearer ${TOKEN}` },
    });
    if (r.ok) break;
  } catch { /* not up yet */ }
  if (++i > 60) { log('Garage admin API never responded — aborting'); process.exit(1); }
  await sleep(1000);
}
log(`Garage admin API ready (after ${i}s)`);

const status = await api('GET', '/v2/GetClusterStatus');
const node = status.nodes[0];
const nodeId = node.id;
const layoutVersion = status.layoutVersion;
log(`Node id: ${nodeId} (layout v${layoutVersion})`);

// ── Cluster layout (skip if this node already has a role) ───
if (node.role == null) {
  log('Staging layout: node → zone dc1, capacity 1GB');
  await api('POST', '/v2/UpdateClusterLayout', {
    roles: [{ id: nodeId, zone: 'dc1', capacity: 1000000000, tags: [] }],
  });
  const newVersion = layoutVersion + 1;
  log(`Applying layout v${newVersion}`);
  await api('POST', '/v2/ApplyClusterLayout', { version: newVersion });
} else {
  log('Layout already assigned — skipping');
}

// ── Bucket ──────────────────────────────────────────────────
const buckets = await api('GET', '/v2/ListBuckets');
let bucketId = buckets.find((b) => (b.globalAliases || []).includes(BUCKET))?.id;
if (!bucketId) {
  log(`Creating bucket '${BUCKET}'`);
  bucketId = (await api('POST', '/v2/CreateBucket', { globalAlias: BUCKET })).id;
} else {
  log(`Bucket '${BUCKET}' already exists (${bucketId})`);
}
log(`Bucket id: ${bucketId}`);

// ── Access key (import the fixed key; ignore "already exists") ─
let keyExists = false;
try {
  await api('GET', `/v2/GetKeyInfo?id=${encodeURIComponent(AK)}`);
  keyExists = true;
} catch { /* not imported yet */ }
if (keyExists) {
  log('Access key already imported');
} else {
  log('Importing access key');
  await api('POST', '/v2/ImportKey', { accessKeyId: AK, secretAccessKey: SK, name: 'dst' });
}

// ── Grant permissions ───────────────────────────────────────
log(`Granting read/write/owner on '${BUCKET}' to the key`);
await api('POST', '/v2/AllowBucketKey', {
  bucketId,
  accessKeyId: AK,
  permissions: { read: true, write: true, owner: true },
});

log('Done.');
