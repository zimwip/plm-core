#!/bin/sh
# ============================================================
# Garage demo bootstrap (one-shot, idempotent)
#   - waits for the Garage admin API
#   - assigns + applies a single-node cluster layout
#   - creates the dst bucket
#   - imports the fixed S3 access key
#   - grants the key read/write/owner on the bucket
#
# Drives the Garage admin API v2 (port 3903). DEMO ONLY.
# ============================================================
set -eu

ADMIN=${GARAGE_ADMIN_URL:-http://garage:3903}
TOKEN=${GARAGE_ADMIN_TOKEN:?GARAGE_ADMIN_TOKEN required}
AK=${GARAGE_S3_ACCESS_KEY:?GARAGE_S3_ACCESS_KEY required}
SK=${GARAGE_S3_SECRET_KEY:?GARAGE_S3_SECRET_KEY required}
BUCKET=${GARAGE_S3_BUCKET:-plm-dst}

log() { printf '[garage-bootstrap] %s\n' "$*"; }

log "Installing curl + jq…"
apk add --no-cache curl jq >/dev/null

api() {
    # api METHOD PATH [JSON_BODY]
    _m=$1; _p=$2; _b=${3:-}
    if [ -n "$_b" ]; then
        curl -fsS -X "$_m" "$ADMIN$_p" \
            -H "Authorization: Bearer $TOKEN" \
            -H "Content-Type: application/json" \
            -d "$_b"
    else
        curl -fsS -X "$_m" "$ADMIN$_p" -H "Authorization: Bearer $TOKEN"
    fi
}

# ── Wait for the admin API ──────────────────────────────────
i=0
until curl -fsS "$ADMIN/v2/GetClusterStatus" -H "Authorization: Bearer $TOKEN" >/dev/null 2>&1; do
    i=$((i + 1))
    [ "$i" -gt 60 ] && { log "Garage admin API never responded — aborting"; exit 1; }
    sleep 1
done
log "Garage admin API ready (after ${i}s)"

STATUS=$(api GET /v2/GetClusterStatus)
NODE_ID=$(echo "$STATUS" | jq -r '.nodes[0].id')
NODE_ROLE=$(echo "$STATUS" | jq -r '.nodes[0].role')
LAYOUT_VERSION=$(echo "$STATUS" | jq -r '.layoutVersion')
log "Node id: $NODE_ID (layout v$LAYOUT_VERSION)"

# ── Cluster layout (skip if this node already has a role) ───
if [ "$NODE_ROLE" = "null" ]; then
    log "Staging layout: node → zone dc1, capacity 1GB"
    api POST /v2/UpdateClusterLayout \
        "{\"roles\":[{\"id\":\"$NODE_ID\",\"zone\":\"dc1\",\"capacity\":1000000000,\"tags\":[]}]}" >/dev/null
    NEW_VERSION=$((LAYOUT_VERSION + 1))
    log "Applying layout v$NEW_VERSION"
    api POST /v2/ApplyClusterLayout "{\"version\":$NEW_VERSION}" >/dev/null
else
    log "Layout already assigned — skipping"
fi

# ── Bucket ──────────────────────────────────────────────────
BUCKET_ID=$(api GET "/v2/ListBuckets" \
    | jq -r ".[] | select(.globalAliases[]? == \"$BUCKET\") | .id" | head -n1)
if [ -z "$BUCKET_ID" ]; then
    log "Creating bucket '$BUCKET'"
    BUCKET_ID=$(api POST /v2/CreateBucket "{\"globalAlias\":\"$BUCKET\"}" | jq -r '.id')
else
    log "Bucket '$BUCKET' already exists ($BUCKET_ID)"
fi
log "Bucket id: $BUCKET_ID"

# ── Access key (import the fixed key; ignore "already exists") ─
if api GET "/v2/GetKeyInfo?id=$AK" >/dev/null 2>&1; then
    log "Access key already imported"
else
    log "Importing access key"
    api POST /v2/ImportKey \
        "{\"accessKeyId\":\"$AK\",\"secretAccessKey\":\"$SK\",\"name\":\"dst\"}" >/dev/null
fi

# ── Grant permissions ───────────────────────────────────────
log "Granting read/write/owner on '$BUCKET' to the key"
api POST /v2/AllowBucketKey \
    "{\"bucketId\":\"$BUCKET_ID\",\"accessKeyId\":\"$AK\",\"permissions\":{\"read\":true,\"write\":true,\"owner\":true}}" >/dev/null

log "Done."
