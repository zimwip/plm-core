#!/bin/sh
# ============================================================
# Vault demo bootstrap
#   - initializes Vault on first run (unseal + root keys → volume)
#   - unseals on every subsequent run
#   - creates a stable service token (plm-demo-services) with a
#     policy allowing read/write on secret/data/plm/*
#   - seeds secret/plm on first run (idempotent: won't overwrite)
#
# DEMO ONLY. Unseal key and root token live on a docker volume
# as plaintext. Do NOT copy this volume to production.
# ============================================================
set -eu
export VAULT_ADDR=${VAULT_ADDR:-http://vault:8200}
INIT=/vault/init/keys.json
SERVICE_TOKEN=plm-demo-services
SECRET_PATH=secret/plm
POLICY_NAME=secret-plm-rw

log() { printf '[bootstrap] %s\n' "$*"; }

# Wait for Vault to answer. `vault status` exits:
#   0 = unsealed + initialized
#   1 = connection failure (not ready yet)
#   2 = sealed or not yet initialized (server IS up — valid signal)
i=0
while :; do
    set +e
    vault status >/dev/null 2>&1
    rc=$?
    set -e
    if [ "$rc" -eq 0 ] || [ "$rc" -eq 2 ]; then break; fi
    i=$((i + 1))
    if [ "$i" -gt 60 ]; then log "Vault never responded — aborting"; exit 1; fi
    sleep 1
done
log "Vault responded (rc=$rc after ${i}s)"

if [ ! -f "$INIT" ]; then
    log "First run — initializing Vault (key-shares=1, key-threshold=1)"
    # Plain-text output — predictable line format, parses without jq:
    #   Unseal Key 1: <base64>
    #   Initial Root Token: <token>
    vault operator init -key-shares=1 -key-threshold=1 > "$INIT"
fi

UNSEAL=$(awk -F': *' '/^Unseal Key 1:/ {print $2; exit}' "$INIT")
ROOT=$(awk  -F': *' '/^Initial Root Token:/ {print $2; exit}' "$INIT")

if [ -z "$UNSEAL" ] || [ -z "$ROOT" ]; then
    log "Failed to parse keys file — aborting"
    log "--- keys file contents ---"
    cat "$INIT" >&2
    exit 1
fi

# Unseal (no-op if already unsealed)
vault operator unseal "$UNSEAL" >/dev/null
export VAULT_TOKEN="$ROOT"

# Enable KV v2 at secret/ (ignore "already enabled")
vault secrets enable -path=secret -version=2 kv >/dev/null 2>&1 || true

# Policy: full CRUD on secret/data/plm/* + metadata for list/delete
vault policy write "$POLICY_NAME" - <<'POLICY' >/dev/null
path "secret/data/plm/*"     { capabilities = ["create", "read", "update", "delete", "list"] }
path "secret/data/plm"       { capabilities = ["create", "read", "update", "delete", "list"] }
path "secret/metadata/plm/*" { capabilities = ["read", "list", "delete"] }
path "secret/metadata/plm"   { capabilities = ["read", "list", "delete"] }
POLICY

# Static service token (recreate if revoked/expired)
if ! vault token lookup "$SERVICE_TOKEN" >/dev/null 2>&1; then
    log "Creating service token '$SERVICE_TOKEN'"
    vault token create -id="$SERVICE_TOKEN" -policy="$POLICY_NAME" -period=720h >/dev/null
else
    log "Service token '$SERVICE_TOKEN' already exists"
fi

# Seed only if secret/plm absent
if vault kv get "$SECRET_PATH" >/dev/null 2>&1; then
    log "$SECRET_PATH already present — not overwriting (UI edits preserved)"
else
    : "${PLM_SERVICE_SECRET:?PLM_SERVICE_SECRET env var required for initial seed}"
    : "${PG_PASSWORD:?PG_PASSWORD env var required for initial seed}"
    # Keys are named after the Spring property they override so Spring Cloud
    # Vault auto-binds them into the Environment at bootstrap.
    vault kv put "$SECRET_PATH" \
        plm.service.secret="$PLM_SERVICE_SECRET" \
        spring.datasource.password="$PG_PASSWORD" \
        plm.jwt.ttl-seconds=60 \
        plm.jwt.session-ttl-seconds=3600 \
        plm.jwt.clock-skew-seconds=5 >/dev/null
    log "Seeded $SECRET_PATH"
fi

log "Done."
