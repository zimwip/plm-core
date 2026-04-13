#!/usr/bin/env bash
# ============================================================
# PLM Core — dev runner with automatic rebuild
#
# Usage:
#   ./run.sh           # start containers + watch for changes
#   ./run.sh build     # rebuild images (layer cache), start + watch
#   ./run.sh reset     # down --volumes, rebuild, start + watch
#   ./run.sh down      # stop and remove containers
#   ./run.sh local     # run all services natively (java + node must be in PATH)
#
# File change → debounce 2s → rebuild/restart relevant service
# ============================================================
set -euo pipefail

# ── Config ──────────────────────────────────────────────────
BACKEND_WATCH="psm-api/src psm-api/pom.xml psm-api/Dockerfile"
PNO_WATCH="pno-api/src pno-api/pom.xml pno-api/Dockerfile"
FRONTEND_WATCH="frontend/src frontend/index.html frontend/vite.config.js frontend/package.json frontend/Dockerfile frontend/nginx.conf"

DEBOUNCE=2          # seconds after last event before triggering rebuild
HEALTH_TIMEOUT=120  # seconds to wait for backend health

# Temp files for inter-process signalling (include PID to avoid collisions)
NEED_BACKEND=/tmp/plm-need-backend-$$
NEED_FRONTEND=/tmp/plm-need-frontend-$$
REBUILD_LOCK=/tmp/plm-rebuild-lock-$$

# ── Helpers ─────────────────────────────────────────────────
log()  { printf '\033[1;36m[run.sh %s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '\033[1;32m[run.sh %s] ✓\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '\033[1;33m[run.sh %s] ⚠\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
err()  { printf '\033[1;31m[run.sh %s] ✗\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }

# PIDs for local mode processes
LOCAL_PSM_PID=""
LOCAL_PNO_PID=""
LOCAL_FRONTEND_PID=""
LOCAL_MODE=false

cleanup() {
    rm -f "$NEED_BACKEND" "$NEED_FRONTEND" "$REBUILD_LOCK" /tmp/plm-need-pno-$$
    [[ -n "${WATCHER_PID:-}" ]] && kill "$WATCHER_PID" 2>/dev/null || true
    [[ -n "${LOGS_PID:-}" ]]    && kill "$LOGS_PID"    2>/dev/null || true

    if $LOCAL_MODE; then
        log "Stopping local services…"
        [[ -n "$LOCAL_PSM_PID"      ]] && kill "$LOCAL_PSM_PID"      2>/dev/null || true
        [[ -n "$LOCAL_PNO_PID"      ]] && kill "$LOCAL_PNO_PID"      2>/dev/null || true
        [[ -n "$LOCAL_FRONTEND_PID" ]] && kill "$LOCAL_FRONTEND_PID" 2>/dev/null || true
        # Kill any child Maven processes spawned under those PIDs
        pkill -P "${LOCAL_PSM_PID:-0}"      2>/dev/null || true
        pkill -P "${LOCAL_PNO_PID:-0}"      2>/dev/null || true
        pkill -P "${LOCAL_FRONTEND_PID:-0}" 2>/dev/null || true
        log "All local services stopped."
    else
        log "Stopped watching. Containers are still running."
        log "  docker compose down   → stop and remove"
        log "  docker compose logs   → view logs"
    fi
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

    if [[ "$service" == "psm-api" ]]; then
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
                rebuild psm-api
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
                rebuild psm-api
            fi
        fi
    done
}

# ── Local mode helpers ───────────────────────────────────────

# Start (or restart) a local service process.
# Usage: local_start <service> <log-file> <pid-var> <cmd...>
local_start() {
    local service=$1 logfile=$2 pidvar=$3
    shift 3

    # Kill previous instance if running
    local old_pid="${!pidvar:-}"
    if [[ -n "$old_pid" ]] && kill -0 "$old_pid" 2>/dev/null; then
        log "   Stopping previous $service (PID $old_pid)…"
        kill "$old_pid" 2>/dev/null || true
        pkill -P "$old_pid" 2>/dev/null || true
        sleep 1
    fi

    log "   Starting $service…"
    "$@" >> "$logfile" 2>&1 &
    printf -v "$pidvar" '%s' "$!"
}

# Wait for an HTTP health endpoint to respond.
local_wait_health() {
    local name=$1 url=$2
    log "   Waiting for $name at $url (max ${HEALTH_TIMEOUT}s)…"
    local elapsed=0
    while (( elapsed < HEALTH_TIMEOUT )); do
        if curl -sf "$url" >/dev/null 2>&1; then
            ok "$name ready after ${elapsed}s"
            return 0
        fi
        sleep 2; (( elapsed += 2 )); printf '.'
    done
    echo ""
    warn "$name did not respond within ${HEALTH_TIMEOUT}s — it may still be starting"
}

# Rebuild and restart a local service on source change.
local_rebuild() {
    local service=$1

    if [[ -d "$REBUILD_LOCK" ]]; then
        warn "Rebuild already in progress — skipping $service trigger"
        return
    fi
    mkdir "$REBUILD_LOCK"
    log "▶  $service changed — restarting…"

    case "$service" in
        psm-api)
            local_start psm-api /tmp/plm-psm-$$.log LOCAL_PSM_PID \
                psm-api/mvnw -f psm-api/pom.xml spring-boot:run -q
            local_wait_health psm-api http://localhost:8080/actuator/health
            ;;
        pno-api)
            local_start pno-api /tmp/plm-pno-$$.log LOCAL_PNO_PID \
                pno-api/mvnw -f pno-api/pom.xml spring-boot:run -q
            local_wait_health pno-api http://localhost:8081/actuator/health
            ;;
        frontend)
            local_start frontend /tmp/plm-fe-$$.log LOCAL_FRONTEND_PID \
                bash -c 'cd frontend && npm run dev'
            ok "Frontend (Vite) restarted"
            ;;
    esac

    rmdir "$REBUILD_LOCK" 2>/dev/null || true
}

# Watch loop for local mode — same inotify/fswatch logic but calls local_rebuild.
local_watch_inotify() {
    NEED_PNO=/tmp/plm-need-pno-$$
    log "Watching for changes with inotifywait…"

    # shellcheck disable=SC2086
    inotifywait -m -r \
        -e close_write -e create -e delete -e moved_to \
        --format '%w%f' \
        --exclude '(/target/|/\.git/|/node_modules/|\.swp$|\.swx$|\.tmp$|~$|\.class$)' \
        $BACKEND_WATCH $PNO_WATCH $FRONTEND_WATCH 2>/dev/null \
    | while IFS= read -r changed; do
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
        local now; now=$(date +%s)

        if [[ -f "$NEED_FRONTEND" ]]; then
            local mtime; mtime=$(stat -c %Y "$NEED_FRONTEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_FRONTEND"; local_rebuild frontend
            fi
        fi
        if [[ -f "$NEED_PNO" ]]; then
            local mtime; mtime=$(stat -c %Y "$NEED_PNO" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_PNO"; local_rebuild pno-api
            fi
        fi
        if [[ -f "$NEED_BACKEND" ]]; then
            local mtime; mtime=$(stat -c %Y "$NEED_BACKEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_BACKEND"; local_rebuild psm-api
            fi
        fi
    done
}

local_watch_fswatch() {
    NEED_PNO=/tmp/plm-need-pno-$$
    log "Watching for changes with fswatch…"

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
        local now; now=$(date +%s)

        if [[ -f "$NEED_FRONTEND" ]]; then
            local mtime; mtime=$(stat -f %m "$NEED_FRONTEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_FRONTEND"; local_rebuild frontend
            fi
        fi
        if [[ -f "$NEED_PNO" ]]; then
            local mtime; mtime=$(stat -f %m "$NEED_PNO" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_PNO"; local_rebuild pno-api
            fi
        fi
        if [[ -f "$NEED_BACKEND" ]]; then
            local mtime; mtime=$(stat -f %m "$NEED_BACKEND" 2>/dev/null || echo 0)
            if (( now - mtime >= DEBOUNCE )); then
                rm -f "$NEED_BACKEND"; local_rebuild psm-api
            fi
        fi
    done
}

# Entry point for the local command.
run_local() {
    LOCAL_MODE=true

    # Check prerequisites
    for bin in java node npm; do
        command -v "$bin" &>/dev/null || { err "$bin not found in PATH — install it first"; exit 1; }
    done
    log "java  : $(java --version 2>&1 | head -1)"
    log "node  : $(node --version)"
    # mvnw will download Maven on first run if mvn is not installed
    log "mvnw  : psm-api/mvnw + pno-api/mvnw (downloads Maven 3.9.9 if needed)"

    log "Starting all services locally (H2 in-memory, no Docker required)…"
    echo ""

    # Start pno-api first — psm-api calls it for auth
    local_start pno-api /tmp/plm-pno-$$.log LOCAL_PNO_PID \
        pno-api/mvnw -f pno-api/pom.xml spring-boot:run -q
    local_wait_health pno-api http://localhost:8081/actuator/health

    local_start psm-api /tmp/plm-psm-$$.log LOCAL_PSM_PID \
        psm-api/mvnw -f psm-api/pom.xml spring-boot:run -q
    local_wait_health psm-api http://localhost:8080/actuator/health

    local_start frontend /tmp/plm-fe-$$.log LOCAL_FRONTEND_PID \
        bash -c 'cd frontend && npm run dev'

    echo ""
    echo "  ┌─────────────────────────────────────────┐"
    echo "  │  Frontend : http://localhost:5173        │"
    echo "  │  PSM API  : http://localhost:8080/api    │"
    echo "  │  PNO API  : http://localhost:8081/api/pno│"
    echo "  └─────────────────────────────────────────┘"
    echo "  Logs: /tmp/plm-{pno,psm,fe}-$$.log"
    echo ""
    echo "  Ctrl+C stops all services."
    echo ""

    # Open browser (best-effort)
    if command -v xdg-open &>/dev/null; then
        xdg-open http://localhost:5173 &>/dev/null &
    elif command -v open &>/dev/null; then
        open http://localhost:5173 &>/dev/null &
    fi

    # Tail all logs
    tail -f /tmp/plm-pno-$$.log /tmp/plm-psm-$$.log /tmp/plm-fe-$$.log &
    LOGS_PID=$!

    # Watch and auto-restart on changes
    if command -v inotifywait &>/dev/null; then
        local_watch_inotify
    elif command -v fswatch &>/dev/null; then
        local_watch_fswatch
    else
        warn "Neither inotifywait nor fswatch found — no auto-restart on file changes."
        wait "$LOGS_PID"
    fi
}

# ── Main ─────────────────────────────────────────────────────
trap cleanup INT TERM

CMD="${1:-}"

# Handle down
if [[ "$CMD" == "down" || "$CMD" == "--down" ]]; then
    log "Stopping containers…"
    docker compose down
    exit 0
fi

# Handle local (native java + node, no Docker)
if [[ "$CMD" == "local" || "$CMD" == "--local" ]]; then
    run_local
    exit 0
fi

DO_BUILD=false

# Handle reset (wipe volumes, then build + watch)
if [[ "$CMD" == "reset" || "$CMD" == "--reset" ]]; then
    warn "This will destroy all database volumes and seed data."
    read -rp "  Continue? [y/N] " confirm
    if [[ "${confirm,,}" != "y" ]]; then
        log "Aborted."
        exit 0
    fi
    log "Stopping containers and wiping volumes…"
    docker compose down --volumes --remove-orphans
    DO_BUILD=true
fi

# Handle build
if [[ "$CMD" == "build" || "$CMD" == "--build" ]]; then
    DO_BUILD=true
fi

# Start services (with or without image rebuild)
log "Starting services…"
if $DO_BUILD; then
    docker compose up -d --build
else
    docker compose up -d
fi

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
