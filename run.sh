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
#   ./run.sh package          # build JARs + frontend → dist/ (compiler-free deploy)
#   ./run.sh package -y       # same, skip confirmation if dist/ exists
#   ./run.sh package --native # GraalVM static binaries (~20 MB, ~200 ms startup)
#
# File change → debounce 2s → rebuild/restart relevant service
#
# Adding a new backend service:
#   1. Create <name>/ with pom.xml, Dockerfile, mvnw at project root.
#   2. Append a row to BACKEND_SVC_ROWS below.
#   3. Add the service to docker-compose.yml.
# ============================================================
set -euo pipefail

# ── Backend services registry ───────────────────────────────
# Columns (pipe-separated):
#   name    : directory / docker compose service name
#   port    : actuator/health port
#   schema  : Flyway schema (empty = no DB dependency)
#   exposed : "true" if port must be published in dist compose (gateway)
#   logpkg  : Java package suffix for LOGGING_LEVEL_COM_* (e.g. PLM, PNO, SPE)
BACKEND_SVC_ROWS=(
    "pno-api|8081|pno||PNO"
    "psm-api|8080|psm||PLM"
    "spe-api|8082||true|SPE"
)

SVC_NAMES=()
declare -A SVC_PORT SVC_SCHEMA SVC_EXPOSED SVC_LOGPKG
for row in "${BACKEND_SVC_ROWS[@]}"; do
    IFS='|' read -r name port schema exposed logpkg <<<"$row"
    SVC_NAMES+=("$name")
    SVC_PORT[$name]=$port
    SVC_SCHEMA[$name]=$schema
    SVC_EXPOSED[$name]=$exposed
    SVC_LOGPKG[$name]=$logpkg
done

FRONTEND_WATCH="frontend/src frontend/index.html frontend/vite.config.js frontend/package.json frontend/Dockerfile frontend/nginx.conf"

build_backend_watch() {
    local out=""
    for svc in "${SVC_NAMES[@]}"; do
        out="$out $svc/src $svc/pom.xml $svc/Dockerfile"
    done
    echo "${out# }"
}
BACKEND_WATCH=$(build_backend_watch)

DEBOUNCE=2          # seconds after last event before triggering rebuild
HEALTH_TIMEOUT=120  # seconds to wait for backend health

# Temp files for inter-process signalling (include PID to avoid collisions)
REBUILD_LOCK=/tmp/plm-rebuild-lock-$$
marker_for() { echo "/tmp/plm-need-$1-$$"; }

all_markers() {
    local out=()
    out+=("$(marker_for plm-frontend)")
    for svc in "${SVC_NAMES[@]}"; do
        out+=("$(marker_for "$svc")")
    done
    echo "${out[@]}"
}

# ── Helpers ─────────────────────────────────────────────────
log()  { printf '\033[1;36m[run.sh %s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '\033[1;32m[run.sh %s] ✓\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '\033[1;33m[run.sh %s] ⚠\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
err()  { printf '\033[1;31m[run.sh %s] ✗\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }

# Local mode state
declare -A LOCAL_PID
LOCAL_MODE=false

cleanup() {
    # shellcheck disable=SC2046
    rm -f $(all_markers)
    rm -rf "$REBUILD_LOCK" 2>/dev/null || true
    [[ -n "${WATCHER_PID:-}" ]] && kill "$WATCHER_PID" 2>/dev/null || true
    [[ -n "${LOGS_PID:-}" ]]    && kill -- -"$LOGS_PID" 2>/dev/null || true

    if $LOCAL_MODE; then
        log "Stopping local services…"
        for target in "plm-frontend" "${SVC_NAMES[@]}"; do
            local pid="${LOCAL_PID[$target]:-}"
            if [[ -n "$pid" ]]; then
                kill  "$pid" 2>/dev/null || true
                pkill -P "$pid" 2>/dev/null || true
            fi
        done
        log "All local services stopped."
    else
        log "Stopped watching. Containers are still running."
        log "  docker compose down   → stop and remove"
        log "  docker compose logs   → view logs"
    fi
    exit 0
}

# Which compose service should be rebuilt for a given logical target?
compose_service_for() {
    case "$1" in
        plm-frontend) echo "plm-frontend" ;;
        *)            echo "$1" ;;
    esac
}

# ── Docker-based rebuild ────────────────────────────────────
rebuild() {
    local target=$1

    if [[ -d "$REBUILD_LOCK" ]]; then
        warn "Rebuild already in progress — skipping $target trigger"
        return
    fi
    mkdir "$REBUILD_LOCK"

    local service
    service=$(compose_service_for "$target")

    log "▶  $target changed — rebuilding…"

    if ! docker compose build "$service"; then
        err "Build failed for $service"
        rmdir "$REBUILD_LOCK" 2>/dev/null || true
        return 1
    fi
    docker compose up -d --no-deps --force-recreate "$service"

    local port="${SVC_PORT[$target]:-}"
    if [[ -n "$port" ]]; then
        log "   Waiting for $target health on :$port (max ${HEALTH_TIMEOUT}s)…"
        local elapsed=0
        while (( elapsed < HEALTH_TIMEOUT )); do
            if curl -sf "http://localhost:$port/actuator/health" >/dev/null 2>&1; then
                ok "$target ready after ${elapsed}s"
                if docker exec plm-frontend nginx -s reload >/dev/null 2>&1; then
                    ok "nginx reloaded — frontend proxy reconnected"
                else
                    warn "nginx reload failed (frontend may still serve stale IP)"
                fi
                rmdir "$REBUILD_LOCK" 2>/dev/null || true
                return 0
            fi
            sleep 3; (( elapsed += 3 )); printf '.'
        done
        echo ""
        warn "$target did not respond within ${HEALTH_TIMEOUT}s"
    else
        ok "$target restarted"
    fi

    rmdir "$REBUILD_LOCK" 2>/dev/null || true
}

# ── Change classifier ───────────────────────────────────────
classify_change() {
    local changed=$1
    [[ "$changed" =~ \.(swp|swx|tmp|orig|bak|class|pyc)$ ]] && return
    [[ "$changed" =~ (/target/|/\.git/|/__pycache__/) ]]    && return

    if [[ "$changed" == frontend/* || "$changed" == */frontend/* ]]; then
        touch "$(marker_for plm-frontend)"
        return
    fi
    for svc in "${SVC_NAMES[@]}"; do
        if [[ "$changed" == "$svc"/* || "$changed" == */"$svc"/* ]]; then
            touch "$(marker_for "$svc")"
            return
        fi
    done
}

# ── Debounce dispatcher (called from watch loops) ───────────
dispatch_rebuilds() {
    local rebuild_fn=$1
    local now; now=$(date +%s)
    for target in "plm-frontend" "${SVC_NAMES[@]}"; do
        local marker; marker=$(marker_for "$target")
        [[ -f "$marker" ]] || continue
        local mtime
        mtime=$(stat -c %Y "$marker" 2>/dev/null || stat -f %m "$marker" 2>/dev/null || echo 0)
        if (( now - mtime >= DEBOUNCE )); then
            rm -f "$marker"
            "$rebuild_fn" "$target"
        fi
    done
}

# ── Watch loops ─────────────────────────────────────────────
watch_inotify_with() {
    local rebuild_fn=$1
    log "Watching for changes with inotifywait…"
    log "  Backend  : $BACKEND_WATCH"
    log "  Frontend : $FRONTEND_WATCH"

    # shellcheck disable=SC2086
    inotifywait -m -r \
        -e close_write -e create -e delete -e moved_to \
        --format '%w%f' \
        --exclude '(/target/|/\.git/|/node_modules/|\.swp$|\.swx$|\.tmp$|~$|\.class$)' \
        $BACKEND_WATCH $FRONTEND_WATCH 2>/dev/null \
    | while IFS= read -r changed; do
        classify_change "$changed"
    done &
    WATCHER_PID=$!

    while kill -0 "$WATCHER_PID" 2>/dev/null; do
        sleep 1
        dispatch_rebuilds "$rebuild_fn"
    done
    err "inotifywait exited unexpectedly"
}

watch_fswatch_with() {
    local rebuild_fn=$1
    log "Watching for changes with fswatch…"

    # shellcheck disable=SC2086
    fswatch -r --event Created --event Updated --event Removed \
        --exclude '\.swp$' --exclude '\.swx$' --exclude '\.tmp$' \
        --exclude '/target/' --exclude '/node_modules/' --exclude '/\.git/' \
        $BACKEND_WATCH $FRONTEND_WATCH \
    | while IFS= read -r changed; do
        classify_change "$changed"
    done &
    WATCHER_PID=$!

    while kill -0 "$WATCHER_PID" 2>/dev/null; do
        sleep 1
        dispatch_rebuilds "$rebuild_fn"
    done
}

# ── Local mode helpers ──────────────────────────────────────
local_log() { echo "/tmp/plm-${1}-$$.log"; }

local_start() {
    local service=$1
    shift

    local old="${LOCAL_PID[$service]:-}"
    if [[ -n "$old" ]] && kill -0 "$old" 2>/dev/null; then
        log "   Stopping previous $service (PID $old)…"
        kill  "$old" 2>/dev/null || true
        pkill -P "$old" 2>/dev/null || true
        sleep 1
    fi

    log "   Starting $service…"
    "$@" >>"$(local_log "$service")" 2>&1 &
    LOCAL_PID[$service]=$!
}

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
    warn "$name did not respond within ${HEALTH_TIMEOUT}s"
}

local_start_backend() {
    local svc=$1
    local_start "$svc" \
        "$svc/mvnw" -f "$svc/pom.xml" spring-boot:run -q
    local_wait_health "$svc" "http://localhost:${SVC_PORT[$svc]}/actuator/health"
}

local_start_frontend() {
    local_start plm-frontend bash -c 'cd frontend && npm run dev'
}

local_rebuild() {
    local target=$1
    if [[ -d "$REBUILD_LOCK" ]]; then
        warn "Rebuild already in progress — skipping $target trigger"
        return
    fi
    mkdir "$REBUILD_LOCK"
    log "▶  $target changed — restarting…"

    if [[ "$target" == "plm-frontend" ]]; then
        local_start_frontend
        ok "Frontend (Vite) restarted"
    elif [[ -n "${SVC_PORT[$target]:-}" ]]; then
        local_start_backend "$target"
    else
        warn "Unknown target: $target"
    fi
    rmdir "$REBUILD_LOCK" 2>/dev/null || true
}

run_local() {
    LOCAL_MODE=true

    for bin in java node npm; do
        command -v "$bin" &>/dev/null || { err "$bin not found in PATH — install it first"; exit 1; }
    done
    log "java  : $(java --version 2>&1 | head -1)"
    log "node  : $(node --version)"
    log "mvnw  : per-service mvnw (downloads Maven 3.9.9 if needed)"

    log "Starting all services locally (H2 in-memory, no Docker required)…"
    echo ""

    for svc in "${SVC_NAMES[@]}"; do
        local_start_backend "$svc"
    done
    local_start_frontend

    echo ""
    echo "  ┌─────────────────────────────────────────┐"
    echo "  │  Frontend : http://localhost:5173        │"
    for svc in "${SVC_NAMES[@]}"; do
        printf "  │  %-8s : http://localhost:%-5s        │\n" "$svc" "${SVC_PORT[$svc]}"
    done
    echo "  └─────────────────────────────────────────┘"
    echo "  Logs: /tmp/plm-*-$$.log"
    echo ""
    echo "  Ctrl+C stops all services."
    echo ""

    if   command -v xdg-open &>/dev/null; then xdg-open http://localhost:5173 &>/dev/null &
    elif command -v open     &>/dev/null; then open     http://localhost:5173 &>/dev/null &
    fi

    local logs=()
    for target in "${SVC_NAMES[@]}" plm-frontend; do
        logs+=("$(local_log "$target")")
    done
    setsid tail -f "${logs[@]}" &
    LOGS_PID=$!

    if   command -v inotifywait &>/dev/null; then watch_inotify_with local_rebuild
    elif command -v fswatch     &>/dev/null; then watch_fswatch_with local_rebuild
    else
        warn "Neither inotifywait nor fswatch found — no auto-restart on file changes."
        wait "$LOGS_PID"
    fi
}

# ── Package ─────────────────────────────────────────────────
# Produces a dist/ directory containing pre-built artifacts + static assets
# and a docker-compose.yml that starts everything without any compilation.
#
#   ./run.sh package            → JVM JARs (eclipse-temurin JRE at runtime)
#   ./run.sh package --native   → GraalVM static binaries (~20 MB, ~200 ms)
#
# Services without Dockerfile.native are skipped in --native mode (with warning).

extract_from_builder() {
    local service=$1 ctx=$2 tag=$3 src_path=$4 dest=$5
    local build_args="${6:-}" dockerfile="${7:-Dockerfile}"

    log "[$service] Building builder stage (${dockerfile})…"
    # shellcheck disable=SC2086
    docker build --target builder $build_args --file "$ctx/$dockerfile" -t "$tag" "$ctx"

    log "[$service] Extracting artifacts…"
    local cid
    cid=$(docker create "$tag")
    docker cp "$cid:$src_path" "$dest"
    docker rm  "$cid" >/dev/null
    docker rmi "$tag" >/dev/null
    ok "[$service] Done."
}

write_jvm_dockerfile() {
    local out=$1 port=$2
    cat > "$out" <<EOF
FROM eclipse-temurin:21-jre-alpine
RUN apk add --no-cache wget
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app
COPY app.jar .
EXPOSE $port
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \\
    CMD wget -qO- http://localhost:$port/actuator/health || exit 1
ENTRYPOINT ["java", \\
    "-XX:+UseContainerSupport", \\
    "-XX:MaxRAMPercentage=75.0", \\
    "-Djava.awt.headless=true", \\
    "-Djava.security.egd=file:/dev/./urandom", \\
    "-jar", "app.jar"]
EOF
}

write_native_dockerfile() {
    local out=$1 port=$2
    cat > "$out" <<EOF
FROM alpine:3.21
RUN apk add --no-cache wget
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app
COPY server .
EXPOSE $port
HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \\
    CMD wget -qO- http://localhost:$port/actuator/health || exit 1
ENTRYPOINT ["./server"]
EOF
}

write_frontend_dockerfile() {
    cat > "$1" << 'EOF'
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.sh /docker-entrypoint.sh
RUN chmod +x /docker-entrypoint.sh
COPY html /usr/share/nginx/html
EXPOSE 80
ENTRYPOINT ["/docker-entrypoint.sh"]
EOF
}

# Emit one backend service block for dist docker-compose.yml
emit_backend_compose_block() {
    local svc=$1 tag=$2
    local port="${SVC_PORT[$svc]}"
    local schema="${SVC_SCHEMA[$svc]}"
    local exposed="${SVC_EXPOSED[$svc]}"
    local logpkg="${SVC_LOGPKG[$svc]}"

    echo ""
    echo "  $svc:"
    echo "    build: ./$svc"
    echo "    image: $svc:$tag"
    echo "    container_name: $svc"
    if [[ "$exposed" == "true" ]]; then
        echo "    ports:"
        echo "      - \"$port:$port\""
    fi
    echo "    environment:"
    if [[ -n "$schema" ]]; then
        cat <<EOF
      SPRING_DATASOURCE_URL:               jdbc:postgresql://postgres:5432/plmdb
      SPRING_DATASOURCE_USERNAME:          plm
      SPRING_DATASOURCE_PASSWORD:          \${PG_PASSWORD:-changeme}
      SPRING_DATASOURCE_DRIVER_CLASS_NAME: org.postgresql.Driver
      SPRING_DATASOURCE_HIKARI_SCHEMA:     $schema
      SPRING_JOOQ_SQL_DIALECT:             POSTGRES
      SPRING_FLYWAY_LOCATIONS:             classpath:db/migration
      SPRING_FLYWAY_DEFAULT_SCHEMA:        $schema
      SPRING_FLYWAY_CREATE_SCHEMAS:        "true"
EOF
    fi
    cat <<EOF
      PLM_SERVICE_SECRET:                  \${PLM_SERVICE_SECRET:?Set PLM_SERVICE_SECRET in .env (must be >= 32 bytes)}
      SPE_API_URL:                         http://spe-api:${SVC_PORT[spe-api]}
      SPE_SELF_BASE_URL:                   http://$svc:$port
      PNO_API_URL:                         http://pno-api:${SVC_PORT[pno-api]}
      LOGGING_LEVEL_ROOT:                  INFO
      LOGGING_LEVEL_COM_$logpkg:               INFO
EOF
    if [[ -n "$schema" ]]; then
        cat <<EOF
    depends_on:
      postgres:
        condition: service_healthy
EOF
    fi
    cat <<EOF
    healthcheck:
      test: ["CMD-SHELL", "wget -qO- http://localhost:$port/actuator/health || exit 1"]
      interval: 20s
      timeout: 10s
      retries: 5
      start_period: 60s
    restart: unless-stopped
    networks:
      - plm-net
EOF
}

write_dist_compose() {
    local out=$1 tag=$2 native=$3
    local any_db=false
    for svc in "${SVC_NAMES[@]}"; do
        [[ -n "${SVC_SCHEMA[$svc]}" ]] && any_db=true
    done

    # Which service does the frontend depend on? First exposed service (gateway).
    local gateway=""
    for svc in "${SVC_NAMES[@]}"; do
        if [[ "${SVC_EXPOSED[$svc]}" == "true" ]]; then gateway=$svc; break; fi
    done
    [[ -z "$gateway" ]] && gateway="${SVC_NAMES[0]}"

    local header_comment="pre-built distribution"
    [[ "$native" == "true" ]] && header_comment="pre-built native distribution (static binaries, no JVM)"

    {
        cat <<EOF
# ============================================================
# PLM Core — $header_comment
#
# Usage:
#   cd dist/
#   docker compose up --build   # first run (builds thin images)
#   docker compose up           # subsequent runs
#   docker compose down -v      # stop + wipe database
#
# Set PG_PASSWORD and PLM_SERVICE_SECRET in a .env file before running.
# ============================================================

services:
EOF

        if $any_db; then
            cat <<'EOF'

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
EOF
        fi

        for svc in "${SVC_NAMES[@]}"; do
            emit_backend_compose_block "$svc" "$tag"
        done

        cat <<EOF

  plm-frontend:
    build: ./frontend
    image: plm-frontend:$tag
    container_name: plm-frontend
    ports:
      - "3000:80"
    depends_on:
      $gateway:
        condition: service_healthy
    restart: unless-stopped
    networks:
      - plm-net

networks:
  plm-net:
    driver: bridge
EOF

        if $any_db; then
            cat <<'EOF'

volumes:
  plm-pgdata:
    driver: local
EOF
        fi
    } > "$out"
}

run_package() {
    local DIST="dist"
    local SKIP_CONFIRM=false
    local NATIVE_MODE=false

    for arg in "$@"; do
        case "$arg" in
            -y|--yes)   SKIP_CONFIRM=true ;;
            --native)   NATIVE_MODE=true  ;;
        esac
    done

    if [[ -d "$DIST" ]]; then
        if ! $SKIP_CONFIRM; then
            warn "Directory '$DIST/' already exists and will be overwritten."
            read -rp "  Continue? [y/N] " confirm
            [[ "${confirm,,}" != "y" ]] && { log "Aborted."; exit 0; }
        fi
        rm -rf "$DIST"
    fi

    mkdir -p "$DIST/frontend/html"
    for svc in "${SVC_NAMES[@]}"; do mkdir -p "$DIST/$svc"; done

    if $NATIVE_MODE; then
        log "=== PLM Core — package (native) ==="
        log "GraalVM static binaries — this takes ~5–10 min per service"
    else
        log "=== PLM Core — package ==="
    fi
    log "Building pre-compiled distribution in ./$DIST/"
    echo ""

    # Track which services were actually built (native mode may skip some)
    local BUILT_SVCS=()

    if $NATIVE_MODE; then
        for svc in "${SVC_NAMES[@]}"; do
            if [[ ! -f "$svc/Dockerfile.native" ]]; then
                warn "[$svc] no Dockerfile.native — skipping in --native mode"
                rm -rf "${DIST:?}/$svc"
                continue
            fi
            extract_from_builder "$svc" "$svc" "plm-$svc-native-builder" \
                "/build/target/server" "$DIST/$svc/server" \
                "" "Dockerfile.native"
            chmod +x "$DIST/$svc/server"
            BUILT_SVCS+=("$svc")
            echo ""
        done
    else
        for svc in "${SVC_NAMES[@]}"; do
            local build_args=""
            # -Pdist only passed if the service actually defines the profile
            if grep -q '<id>dist</id>' "$svc/pom.xml" 2>/dev/null; then
                build_args="--build-arg MAVEN_EXTRA_OPTS=-Pdist"
            fi
            extract_from_builder "$svc" "$svc" "plm-$svc-pkg-builder" \
                "/build/target" "$DIST/$svc/_target" \
                "$build_args"
            local jar
            jar=$(ls "$DIST/$svc/_target"/*.jar 2>/dev/null | grep -v 'original' | head -1 || true)
            if [[ -z "$jar" ]]; then
                err "No JAR found in $svc/target — build may have failed"; exit 1
            fi
            cp "$jar" "$DIST/$svc/app.jar"
            rm -rf "$DIST/$svc/_target"
            BUILT_SVCS+=("$svc")
            echo ""
        done
    fi

    # Replace SVC_NAMES with successfully-built services for subsequent steps
    SVC_NAMES=("${BUILT_SVCS[@]}")

    # Frontend (same for both modes)
    extract_from_builder "frontend" "frontend" "plm-fe-pkg-builder" \
        "/app/dist/." "$DIST/frontend/html"
    cp frontend/nginx.conf           "$DIST/frontend/nginx.conf"
    cp frontend/docker-entrypoint.sh "$DIST/frontend/docker-entrypoint.sh"
    echo ""

    # Per-service runtime Dockerfile
    log "Writing runtime Dockerfiles…"
    for svc in "${SVC_NAMES[@]}"; do
        if $NATIVE_MODE; then
            write_native_dockerfile "$DIST/$svc/Dockerfile" "${SVC_PORT[$svc]}"
        else
            write_jvm_dockerfile    "$DIST/$svc/Dockerfile" "${SVC_PORT[$svc]}"
        fi
    done
    write_frontend_dockerfile "$DIST/frontend/Dockerfile"

    # docker-compose.yml
    log "Writing dist/docker-compose.yml…"
    local tag="dist"
    $NATIVE_MODE && tag="native"
    write_dist_compose "$DIST/docker-compose.yml" "$tag" "$NATIVE_MODE"

    # .env.example
    cat > "$DIST/.env.example" << 'EOF'
# Copy to .env and set strong values before first launch.
PG_PASSWORD=changeme
# Must be >= 32 bytes — generate with: openssl rand -base64 32
PLM_SERVICE_SECRET=
EOF

    echo ""
    if $NATIVE_MODE; then
        echo "  Native distribution ready in ./$DIST/"
        echo "  Images: ~20 MB per service  |  Startup: ~200 ms"
    else
        echo "  Distribution ready in ./$DIST/"
    fi
    echo "  Contents:"
    for svc in "${SVC_NAMES[@]}"; do
        if $NATIVE_MODE; then
            echo "    dist/$svc/server    + Dockerfile"
        else
            echo "    dist/$svc/app.jar   + Dockerfile"
        fi
    done
    echo "    dist/frontend/html/    + Dockerfile (nginx)"
    echo "    dist/docker-compose.yml"
    echo ""
    echo "  To deploy:"
    echo "    cd dist/"
    echo "    cp .env.example .env && vi .env"
    echo "    docker compose up --build"
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

if [[ "$CMD" == "build" || "$CMD" == "--build" ]]; then
    DO_BUILD=true
fi

log "Starting services…"
if $DO_BUILD; then
    docker compose up -d --build
else
    docker compose up -d
fi

echo ""
echo "  ┌─────────────────────────────────────────┐"
echo "  │  Frontend : http://localhost:3000        │"
for svc in "${SVC_NAMES[@]}"; do
    printf "  │  %-8s : http://localhost:%-5s        │\n" "$svc" "${SVC_PORT[$svc]}"
done
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

if   command -v xdg-open &>/dev/null; then xdg-open http://localhost:3000 &>/dev/null &
elif command -v open     &>/dev/null; then open     http://localhost:3000 &>/dev/null &
fi

setsid docker compose logs -f &
LOGS_PID=$!

echo ""

if   command -v inotifywait &>/dev/null; then watch_inotify_with rebuild
elif command -v fswatch     &>/dev/null; then watch_fswatch_with rebuild
else
    warn "Neither inotifywait nor fswatch found — no auto-rebuild."
    warn "  Linux : sudo dnf install inotify-tools"
    warn "  macOS : brew install fswatch"
    log "Running without watch. Press Ctrl+C to stop log tailing (containers keep running)."
    wait "$LOGS_PID"
fi
