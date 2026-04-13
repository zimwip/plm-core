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
#   ./run.sh package   # build JARs + frontend → dist/ (compiler-free deploy)
#   ./run.sh package -y  # same, skip confirmation if dist/ exists
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

# ── Package ─────────────────────────────────────────────────
# Produces a dist/ directory containing pre-built JARs + static assets
# and a docker-compose.yml that starts everything without any compilation.
run_package() {
    local DIST="dist"
    local SKIP_CONFIRM=false
    [[ "${2:-}" == "-y" || "${2:-}" == "--yes" ]] && SKIP_CONFIRM=true

    if [[ -d "$DIST" ]]; then
        if ! $SKIP_CONFIRM; then
            warn "Directory '$DIST/' already exists and will be overwritten."
            read -rp "  Continue? [y/N] " confirm
            [[ "${confirm,,}" != "y" ]] && { log "Aborted."; exit 0; }
        fi
        rm -rf "$DIST"
    fi
    mkdir -p "$DIST/psm-api" "$DIST/pno-api" "$DIST/frontend/html"

    log "=== PLM Core — package ==="
    log "Building pre-compiled distribution in ./$DIST/"
    echo ""

    # ── Helper: build builder stage, extract a path, clean up ──
    extract_from_builder() {
        local service=$1       # human name
        local ctx=$2           # build context dir
        local tag=$3           # temporary image tag
        local src_path=$4      # path inside container to copy
        local dest=$5          # local destination

        log "[$service] Building builder stage…"
        docker build --target builder -t "$tag" "$ctx"

        log "[$service] Extracting artifacts…"
        local cid
        cid=$(docker create "$tag")
        docker cp "$cid:$src_path" "$dest"
        docker rm  "$cid" >/dev/null
        docker rmi "$tag" >/dev/null
        ok "[$service] Done."
    }

    # ── PSM API ────────────────────────────────────────────────
    extract_from_builder "psm-api" "psm-api" "plm-psm-pkg-builder" \
        "/build/target" "$DIST/psm-api/_target"
    local psm_jar
    psm_jar=$(ls "$DIST/psm-api/_target"/*.jar 2>/dev/null | grep -v 'original' | head -1)
    if [[ -z "$psm_jar" ]]; then
        err "No JAR found in psm-api/target — build may have failed"; exit 1
    fi
    cp "$psm_jar" "$DIST/psm-api/app.jar"
    rm -rf "$DIST/psm-api/_target"
    echo ""

    # ── PNO API ────────────────────────────────────────────────
    extract_from_builder "pno-api" "pno-api" "plm-pno-pkg-builder" \
        "/build/target" "$DIST/pno-api/_target"
    local pno_jar
    pno_jar=$(ls "$DIST/pno-api/_target"/*.jar 2>/dev/null | grep -v 'original' | head -1)
    if [[ -z "$pno_jar" ]]; then
        err "No JAR found in pno-api/target — build may have failed"; exit 1
    fi
    cp "$pno_jar" "$DIST/pno-api/app.jar"
    rm -rf "$DIST/pno-api/_target"
    echo ""

    # ── Frontend ───────────────────────────────────────────────
    extract_from_builder "frontend" "frontend" "plm-fe-pkg-builder" \
        "/app/dist/." "$DIST/frontend/html"
    cp frontend/nginx.conf "$DIST/frontend/nginx.conf"
    echo ""

    # ── Thin Dockerfiles ───────────────────────────────────────
    log "Writing thin runtime Dockerfiles…"

    cat > "$DIST/psm-api/Dockerfile" << 'EOF'
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S plm && adduser -S plm -G plm
USER plm
WORKDIR /app
COPY app.jar .
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
EOF

    cat > "$DIST/pno-api/Dockerfile" << 'EOF'
FROM eclipse-temurin:21-jre-alpine
RUN addgroup -S plm && adduser -S plm -G plm
USER plm
WORKDIR /app
COPY app.jar .
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8081/actuator/health || exit 1
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
EOF

    cat > "$DIST/frontend/Dockerfile" << 'EOF'
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY html /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
EOF

    # ── docker-compose.yml ─────────────────────────────────────
    log "Writing dist/docker-compose.yml…"

    cat > "$DIST/docker-compose.yml" << 'EOF'
# ============================================================
# PLM Core — pre-built distribution
# No compilation required: images are built from local JARs.
#
# Usage:
#   cd dist/
#   docker compose up --build   # first run (builds thin images)
#   docker compose up           # subsequent runs
#   docker compose down -v      # stop + wipe database
#
# Set PG_PASSWORD in a .env file or export it before running.
# ============================================================

services:

  postgres:
    image: postgres:16-alpine
    container_name: plm-postgres
    environment:
      POSTGRES_DB:       plmdb
      POSTGRES_USER:     plm
      POSTGRES_PASSWORD: ${PG_PASSWORD:-changeme}
    ports:
      - "5432:5432"
    volumes:
      - plm-pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U plm -d plmdb"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: unless-stopped
    networks:
      - plm-net

  pno-api:
    build: ./pno-api
    image: pno-api:dist
    container_name: pno-api
    ports:
      - "8081:8081"
    environment:
      SPRING_DATASOURCE_URL:               jdbc:postgresql://postgres:5432/plmdb
      SPRING_DATASOURCE_USERNAME:          plm
      SPRING_DATASOURCE_PASSWORD:          ${PG_PASSWORD:-changeme}
      SPRING_DATASOURCE_DRIVER_CLASS_NAME: org.postgresql.Driver
      SPRING_DATASOURCE_HIKARI_SCHEMA:     pno
      SPRING_JOOQ_SQL_DIALECT:             POSTGRES
      SPRING_FLYWAY_LOCATIONS:             classpath:db/migration
      SPRING_FLYWAY_DEFAULT_SCHEMA:        pno
      SPRING_FLYWAY_CREATE_SCHEMAS:        "true"
      LOGGING_LEVEL_ROOT:                  INFO
      LOGGING_LEVEL_COM_PNO:               INFO
    depends_on:
      postgres:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8081/actuator/health || exit 1"]
      interval: 20s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped
    networks:
      - plm-net

  psm-api:
    build: ./psm-api
    image: psm-api:dist
    container_name: psm-api
    ports:
      - "8080:8080"
    environment:
      SPRING_DATASOURCE_URL:               jdbc:postgresql://postgres:5432/plmdb
      SPRING_DATASOURCE_USERNAME:          plm
      SPRING_DATASOURCE_PASSWORD:          ${PG_PASSWORD:-changeme}
      SPRING_DATASOURCE_DRIVER_CLASS_NAME: org.postgresql.Driver
      SPRING_JOOQ_SQL_DIALECT:             POSTGRES
      SPRING_FLYWAY_LOCATIONS:             classpath:db/migration
      SPRING_FLYWAY_DEFAULT_SCHEMA:        psm
      SPRING_FLYWAY_CREATE_SCHEMAS:        "true"
      SPRING_DATASOURCE_HIKARI_SCHEMA:     psm
      PNO_API_URL:                         http://pno-api:8081
      LOGGING_LEVEL_ROOT:                  INFO
      LOGGING_LEVEL_COM_PLM:               INFO
    depends_on:
      postgres:
        condition: service_healthy
      pno-api:
        condition: service_healthy
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:8080/actuator/health || exit 1"]
      interval: 20s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped
    networks:
      - plm-net

  plm-frontend:
    build: ./frontend
    image: plm-frontend:dist
    container_name: plm-frontend
    ports:
      - "3000:80"
    depends_on:
      psm-api:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - plm-net

networks:
  plm-net:
    driver: bridge

volumes:
  plm-pgdata:
    driver: local
EOF

    # ── .env.example ───────────────────────────────────────────
    cat > "$DIST/.env.example" << 'EOF'
# Copy to .env and set a strong password before first launch.
PG_PASSWORD=changeme
EOF

    echo ""
    echo "  ┌──────────────────────────────────────────────────────┐"
    echo "  │  Distribution ready in ./$DIST/                      │"
    echo "  │                                                        │"
    echo "  │  Contents:                                             │"
    echo "  │    dist/psm-api/app.jar   + Dockerfile (no compiler)  │"
    echo "  │    dist/pno-api/app.jar   + Dockerfile (no compiler)  │"
    echo "  │    dist/frontend/html/    + Dockerfile (nginx)        │"
    echo "  │    dist/docker-compose.yml                             │"
    echo "  │                                                        │"
    echo "  │  To deploy:                                            │"
    echo "  │    cd dist/                                            │"
    echo "  │    cp .env.example .env && vi .env                     │"
    echo "  │    docker compose up --build                           │"
    echo "  └──────────────────────────────────────────────────────┘"
    echo ""
    ok "Package complete."
}

# ── Main ─────────────────────────────────────────────────────
trap cleanup INT TERM

CMD="${1:-}"

# Handle package (pre-build JARs + frontend, write dist/ for compiler-free deploy)
if [[ "$CMD" == "package" || "$CMD" == "--package" ]]; then
    run_package "$@"
    exit 0
fi

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
