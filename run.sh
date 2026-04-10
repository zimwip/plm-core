#!/usr/bin/env bash
# ============================================================
# PLM Core - Dev script with hot rebuild
#
# Usage:
#   ./run.sh          # start + watch for changes
#   ./run.sh --build  # force full rebuild before starting
#
# On source change → container is rebuilt and restarted.
# ============================================================
set -euo pipefail

BACKEND_WATCH="plm-api/src/main/java plm-api/src/main/resources plm-api/pom.xml plm-api/Dockerfile"
FRONTEND_WATCH="frontend/src frontend/index.html frontend/vite.config.js frontend/package.json frontend/Dockerfile"

# ---- helpers -----------------------------------------------

log() { echo "[run.sh] $*"; }

rebuild_backend() {
    log "Backend changed — rebuilding..."
    docker compose build --no-cache plm-backend
    docker compose up -d --no-deps --force-recreate plm-backend
    log "Backend restarted."
}

rebuild_frontend() {
    log "Frontend changed — rebuilding..."
    docker compose build --no-cache plm-frontend
    docker compose up -d --no-deps --force-recreate plm-frontend
    log "Frontend restarted."
}

watch_loop() {
    if command -v inotifywait &>/dev/null; then
        log "Watching for changes (inotifywait)..."
        log "  plm-api/  → Docker rebuild + restart"
        log "  frontend/ → Vite build + nginx restart"
        while true; do
            changed=$(inotifywait -r -e close_write,create,delete,move \
                --format '%w%f' --quiet \
                $BACKEND_WATCH $FRONTEND_WATCH 2>/dev/null || true)
            if [[ -z "$changed" ]]; then continue; fi
            log "Changed: $changed"
            if echo "$changed" | grep -q '^frontend/'; then
                rebuild_frontend
            else
                rebuild_backend
            fi
        done
    elif command -v fswatch &>/dev/null; then
        log "Watching for changes (fswatch)..."
        fswatch -r $BACKEND_WATCH $FRONTEND_WATCH | while read -r changed; do
            log "Changed: $changed"
            if echo "$changed" | grep -q '/frontend/'; then
                rebuild_frontend
            else
                rebuild_backend
            fi
        done
    else
        log "WARNING: neither inotifywait nor fswatch found."
        log "Install inotify-tools (Linux) or fswatch (macOS) for hot reload."
        log "Running without watch — press Ctrl+C to stop."
        wait
    fi
}

# ---- main --------------------------------------------------

if [[ "${1:-}" == "--build" ]]; then
    log "Full rebuild..."
    docker compose build --no-cache
fi

log "Starting services..."
docker compose up -d

echo ""
echo "  Frontend : http://localhost:3000"
echo "  API      : http://localhost:8080/api"
echo ""

# Open the frontend in the default browser (best-effort)
if command -v xdg-open &>/dev/null; then
    xdg-open http://localhost:3000 &>/dev/null &
elif command -v open &>/dev/null; then
    open http://localhost:3000 &>/dev/null &
fi

log "Tailing logs (Ctrl+C to stop watching, containers keep running)..."
docker compose logs -f &
LOGS_PID=$!

# trap Ctrl+C: stop log tailing but leave containers running
trap 'kill $LOGS_PID 2>/dev/null; log "Stopped watching. Containers still running."; log "Use: docker compose down  to stop."; exit 0' INT TERM

watch_loop
