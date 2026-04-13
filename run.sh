#!/usr/bin/env bash
# ============================================================
# PLM Core — dev runner with automatic container rebuild
#
# Usage:
#   ./run.sh           # start + watch for changes
#   ./run.sh --build   # force full rebuild before starting
#   ./run.sh --down    # stop and remove containers
#   ./run.sh --reset   # stop, wipe all volumes (DB data), rebuild from scratch
#
# File change → debounce 2s → docker compose build + up
# Uses layer cache (no --no-cache) for fast incremental rebuilds.
# ============================================================
set -euo pipefail

# ── Config ──────────────────────────────────────────────────
BACKEND_WATCH="plm-api/src plm-api/pom.xml plm-api/Dockerfile"
PNO_WATCH="pno-api/src pno-api/pom.xml pno-api/Dockerfile"
FRONTEND_WATCH="frontend/src frontend/index.html frontend/vite.config.js frontend/package.json frontend/Dockerfile frontend/nginx.conf"

DEBOUNCE=2          # seconds after last event before triggering rebuild
HEALTH_TIMEOUT=90   # seconds to wait for backend health

# Temp files for inter-process signalling (include PID to avoid collisions)
NEED_BACKEND=/tmp/plm-need-backend-$$
NEED_FRONTEND=/tmp/plm-need-frontend-$$
REBUILD_LOCK=/tmp/plm-rebuild-lock-$$

# ── Helpers ─────────────────────────────────────────────────
log()  { printf '\033[1;36m[run.sh %s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '\033[1;32m[run.sh %s] ✓\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '\033[1;33m[run.sh %s] ⚠\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
err()  { printf '\033[1;31m[run.sh %s] ✗\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }

cleanup() {
    rm -f "$NEED_BACKEND" "$NEED_FRONTEND" "$REBUILD_LOCK" /tmp/plm-need-pno-$$
    # Kill the watcher sub-process if still running
    [[ -n "${WATCHER_PID:-}" ]] && kill "$WATCHER_PID" 2>/dev/null || true
    [[ -n "${LOGS_PID:-}" ]]    && kill "$LOGS_PID"    2>/dev/null || true
    log "Stopped watching. Containers are still running."
    log "  docker compose down   → stop and remove"
    log "  docker compose logs   → view logs"
    exit 0
}

rebuild() {
    local service=$1

    # Skip if a rebuild is already running
    if [[ -d "$REBUILD_LOCK" ]]; then
        warn "Rebuild already in progress — skipping $service trigger"
        return
    fi
    mkdir "$REBUILD_LOCK"

    log "▶  $service changed — rebuilding…"

    if docker compose build "$service"; then
        docker compose up -d --no-deps --force-recreate "$service"
    else
        err "Build failed for $service"
        rmdir "$REBUILD_LOCK" 2>/dev/null || true
        return 1
    fi

    if [[ "$service" == "plm-backend" ]]; then
        log "   Waiting for backend health (max ${HEALTH_TIMEOUT}s)…"
        local elapsed=0
        while (( elapsed < HEALTH_TIMEOUT )); do
            if curl -sf http://localhost:8080/actuator/health >/dev/null 2>&1; then
                ok "Backend ready after ${elapsed}s"
                # Reload nginx so it re-resolves upstream IPs (avoids 502 after restart)
                if docker exec plm-frontend nginx -s reload >/dev/null 2>&1; then
                    ok "nginx reloaded — frontend proxy reconnected"
                else
                    warn "nginx reload failed (frontend may still serve stale backend IP)"
                fi
                rmdir "$REBUILD_LOCK" 2>/dev/null || true
                return 0
            fi
            sleep 3
            (( elapsed += 3 ))
            printf '.'
        done
        echo ""
        warn "Backend did not respond within ${HEALTH_TIMEOUT}s — it may still be starting"
    elif [[ "$service" == "pno-api" ]]; then
        log "   Waiting for pno-api health (max ${HEALTH_TIMEOUT}s)…"
        local elapsed=0
        while (( elapsed < HEALTH_TIMEOUT )); do
            if curl -sf http://localhost:8081/actuator/health >/dev/null 2>&1; then
                ok "pno-api ready after ${elapsed}s"
                if docker exec plm-frontend nginx -s reload >/dev/null 2>&1; then
                    ok "nginx reloaded — pno-api proxy reconnected"
                fi
                rmdir "$REBUILD_LOCK" 2>/dev/null || true
                return 0
            fi
            sleep 3
            (( elapsed += 3 ))
            printf '.'
        done
        echo ""
        warn "pno-api did not respond within ${HEALTH_TIMEOUT}s — it may still be starting"
    else
        ok "$service restarted"
    fi

    rmdir "$REBUILD_LOCK" 2>/dev/null || true
}

# ── Watch loop (inotifywait) ─────────────────────────────────
watch_inotify() {
    log "Watching for changes with inotifywait…"
    log "  Backend  : $BACKEND_WATCH"
    log "  PNO API  : $PNO_WATCH"
    log "  Frontend : $FRONTEND_WATCH"

    NEED_PNO=/tmp/plm-need-pno-$$

    # Run inotifywait in monitor mode (-m) piped into a classifier.
    # The classifier writes to marker files so the main loop can debounce.
    # shellcheck disable=SC2086
    inotifywait -m -r \
        -e close_write -e create -e delete -e moved_to \
        --format '%w%f' \
        --exclude '(/target/|/\.git/|/node_modules/|\.swp$|\.swx$|\.tmp$|~$|\.class$)' \
        $BACKEND_WATCH $PNO_WATCH $FRONTEND_WATCH 2>/dev/null \
    | while IFS= read -r changed; do
        # Additional filter: skip common editor / build artefacts
        [[ "$changed" =~ \.(swp|swx|tmp|orig|bak|class|pyc)$ ]] && continue
        [[ "$changed" =~ (/target/|/\.git/|/__pycache__/) ]]     && continue

        if [[ "$changed" == frontend/* || "$changed" == */frontend/* ]]; then
            touch "$NEED_FRONTEND"
        elif [[ "$changed" == pno-api/* || "$changed" == */pno-api/* ]]; then
            touch "$NEED_PNO"
        else
            touch "$NEED_BACKEND"
        fi
    done &
    WATCHER_PID=$!

    while kill -0 "$WATCHER_PID" 2>/dev/null; do
        sleep 1
        local now
        now=$(date +%s)

        # Frontend rebuild
        if [[ -f "$NEED_FRONTEND" ]]; then
            local mtime
            mtime=$(stat -c %Y "$NEED_FRONTEND" 2>/dev/null || stat -f %m "$NEED_FRONTEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_FRONTEND"
                rebuild plm-frontend
            fi
        fi

        # PNO API rebuild
        if [[ -f "$NEED_PNO" ]]; then
            local mtime
            mtime=$(stat -c %Y "$NEED_PNO" 2>/dev/null || stat -f %m "$NEED_PNO" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_PNO"
                rebuild pno-api
            fi
        fi

        # Backend rebuild
        if [[ -f "$NEED_BACKEND" ]]; then
            local mtime
            mtime=$(stat -c %Y "$NEED_BACKEND" 2>/dev/null || stat -f %m "$NEED_BACKEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_BACKEND"
                rebuild plm-backend
            fi
        fi
    done

    err "inotifywait exited unexpectedly"
}

# ── Watch loop (fswatch — macOS fallback) ────────────────────
watch_fswatch() {
    log "Watching for changes with fswatch…"
    NEED_PNO=/tmp/plm-need-pno-$$

    # shellcheck disable=SC2086
    fswatch -r --event Created --event Updated --event Removed \
        --exclude '\.swp$' --exclude '\.swx$' --exclude '\.tmp$' \
        --exclude '/target/' --exclude '/node_modules/' --exclude '/\.git/' \
        $BACKEND_WATCH $PNO_WATCH $FRONTEND_WATCH \
    | while IFS= read -r changed; do
        if echo "$changed" | grep -qE '/frontend/|^frontend/'; then
            touch "$NEED_FRONTEND"
        elif echo "$changed" | grep -qE '/pno-api/|^pno-api/'; then
            touch "$NEED_PNO"
        else
            touch "$NEED_BACKEND"
        fi
    done &
    WATCHER_PID=$!

    while kill -0 "$WATCHER_PID" 2>/dev/null; do
        sleep 1
        local now
        now=$(date +%s)

        if [[ -f "$NEED_FRONTEND" ]]; then
            local mtime
            mtime=$(stat -f %m "$NEED_FRONTEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_FRONTEND"
                rebuild plm-frontend
            fi
        fi

        if [[ -f "$NEED_PNO" ]]; then
            local mtime
            mtime=$(stat -f %m "$NEED_PNO" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_PNO"
                rebuild pno-api
            fi
        fi

        if [[ -f "$NEED_BACKEND" ]]; then
            local mtime
            mtime=$(stat -f %m "$NEED_BACKEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_BACKEND"
                rebuild plm-backend
            fi
        fi
    done
}

# ── Main ─────────────────────────────────────────────────────
trap cleanup INT TERM

# Handle --down
if [[ "${1:-}" == "--down" ]]; then
    log "Stopping containers…"
    docker compose down
    exit 0
fi

# Handle --reset (wipe volumes + rebuild from scratch)
if [[ "${1:-}" == "--reset" ]]; then
    warn "This will destroy all database volumes and seed data."
    read -rp "  Continue? [y/N] " confirm
    if [[ "${confirm,,}" != "y" ]]; then
        log "Aborted."
        exit 0
    fi
    log "Stopping containers and wiping volumes…"
    docker compose down --volumes --remove-orphans
    log "Rebuilding images (no cache)…"
    docker compose build --no-cache
    log "Starting fresh…"
    docker compose up -d
    ok "Reset complete — DB re-seeded from migrations."
    exit 0
fi

# Handle --build (rebuild using layer cache — use --reset for a clean slate)
if [[ "${1:-}" == "--build" ]]; then
    log "Rebuilding images (layer cache)…"
    docker compose build
fi

# Start services
log "Starting services…"
docker compose up -d

echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Frontend : http://localhost:3000        │"
echo "  │  PLM API  : http://localhost:8080/api    │"
echo "  │  PNO API  : http://localhost:8081/api/pno│"
echo "  └─────────────────────────────────────────┘"
echo ""
echo "  DBeaver connection (PostgreSQL):"
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Host     : localhost                    │"
echo "  │  Port     : 5432                         │"
echo "  │  Database : plmdb                        │"
echo "  │  User     : plm                          │"
echo "  │  Password : ${PG_PASSWORD:-changeme}"
echo "  └─────────────────────────────────────────┘"
echo ""

# Open browser (best-effort)
if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:3000 &>/dev/null &
elif command -v open &>/dev/null; then
    open http://localhost:3000 &>/dev/null &
fi

# Tail logs in background
docker compose logs -f &
LOGS_PID=$!

echo ""

# Start the appropriate watcher
if command -v inotifywait &>/dev/null; then
    watch_inotify
elif command -v fswatch &>/dev/null; then
    watch_fswatch
else
    warn "Neither inotifywait nor fswatch found — no auto-rebuild."
    warn "  Linux : sudo dnf install inotify-tools"
    warn "  macOS : brew install fswatch"
    log "Running without watch. Press Ctrl+C to stop log tailing (containers keep running)."
    wait "$LOGS_PID"
fi
