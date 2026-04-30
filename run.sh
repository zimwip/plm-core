#!/usr/bin/env bash
# ============================================================
# PLM Core — dev runner (no file watcher)
#
# Usage:
#   ./run.sh                     start; exit when healthy
#   ./run.sh build               rebuild projects with git changes, then start
#   ./run.sh build all           rebuild every image, then start
#   ./run.sh build <svc>...      rebuild listed compose services, then start
#   ./run.sh reset               destroy volumes, rebuild all, start
#   ./run.sh down                stop and remove containers
#   ./run.sh local               run all services natively (java + node in PATH)
#   ./run.sh package             build dist/ (JVM JARs) for compiler-free deploy
#   ./run.sh package -y          same, skip confirm if dist/ exists
#   ./run.sh package --native    GraalVM static binaries
#
# Change detection (for `./run.sh build`):
#   Uses `git diff --name-only HEAD` + untracked files to find which top-level
#   projects have pending changes. platform-lib change = rebuild all backends.
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
#   port    : actuator/health port (container-internal)
#   schema  : Flyway schema (empty = no DB dependency)
#   (unused): reserved (keep empty or any value)
#   logpkg  : Java package suffix for LOGGING_LEVEL_COM_* (e.g. PLM, PNO, SPE)
BACKEND_SVC_ROWS=(
    "pno-api|8081|pno||PNO"
    "psm-admin|8083|psm_admin||PLM"
    "psm-api|8080|psm||PLM"
    "ws-gateway|8085|||PLM"
    "platform-api|8084|||PLM"
    "spe-api|8082||true|SPE"
    "dst|8086|dst||DST"
)

SVC_NAMES=()
declare -A SVC_PORT SVC_SCHEMA SVC_LOGPKG
for row in "${BACKEND_SVC_ROWS[@]}"; do
    IFS='|' read -r name port schema _exposed logpkg <<<"$row"
    SVC_NAMES+=("$name")
    SVC_PORT[$name]=$port
    SVC_SCHEMA[$name]=$schema
    SVC_LOGPKG[$name]=$logpkg
done

HEALTH_TIMEOUT=180  # seconds to wait for all services healthy
PLATFORM_LIB_IMAGE="plm-platform-lib:dev"

# ── Helpers ─────────────────────────────────────────────────
log()  { printf '\033[1;36m[run.sh %s]\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
ok()   { printf '\033[1;32m[run.sh %s] ✓\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
warn() { printf '\033[1;33m[run.sh %s] ⚠\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }
err()  { printf '\033[1;31m[run.sh %s] ✗\033[0m %s\n' "$(date +%H:%M:%S)" "$*"; }

# Build platform-lib as a shared base image consumed by every service's
# Dockerfile stage 0 (`FROM plm-platform-lib:dev AS lib-builder`).
# Compiles platform-lib once; Docker layer cache makes this a no-op when
# platform-lib/ source is unchanged.
build_platform_lib_image() {
    log "Building $PLATFORM_LIB_IMAGE (shared lib-builder base)…"
    if ! docker build -t "$PLATFORM_LIB_IMAGE" platform-lib/; then
        err "Failed to build $PLATFORM_LIB_IMAGE"
        return 1
    fi
    ok "$PLATFORM_LIB_IMAGE ready"
}

# Local mode state
declare -A LOCAL_PID
LOCAL_MODE=false

cleanup() {
    [[ -n "${LOGS_PID:-}" ]] && kill -- -"$LOGS_PID" 2>/dev/null || true

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
    fi
    exit 0
}
trap cleanup INT TERM

# ── Health polling ──────────────────────────────────────────
# Wait for every compose-managed container to either report healthy (if it has
# a healthcheck) or be in a terminal "expected" state (running without
# healthcheck, or exited 0 for one-shot services like vault-bootstrap).
wait_all_healthy() {
    local timeout=${1:-$HEALTH_TIMEOUT}
    local start elapsed=0
    start=$(date +%s)
    log "Waiting for services to become healthy (max ${timeout}s)…"
    while (( elapsed < timeout )); do
        local all_ok=true
        local pending=()
        while IFS=$'\t' read -r svc name state; do
            [[ -z "$name" ]] && continue
            local health
            health=$(docker inspect -f '{{if .State.Health}}{{.State.Health.Status}}{{end}}' "$name" 2>/dev/null || echo "")
            if [[ -n "$health" ]]; then
                if [[ "$health" != "healthy" ]]; then
                    all_ok=false
                    pending+=("$name=$health")
                fi
            else
                # No healthcheck — accept running (long-lived) or exited (one-shot seeders)
                case "$state" in
                    running|exited) ;;
                    *) all_ok=false; pending+=("$name=$state") ;;
                esac
            fi
        done < <(docker compose ps -a --format '{{.Service}}\t{{.Name}}\t{{.State}}' 2>/dev/null)
        if $all_ok; then
            echo ""
            ok "All services ready after ${elapsed}s"
            return 0
        fi
        sleep 3
        elapsed=$(( $(date +%s) - start ))
        printf '.'
    done
    echo ""
    err "Timeout after ${timeout}s. Pending: ${pending[*]}"
    return 1
}

# ── Change detection ────────────────────────────────────────
# Prints compose-service names whose source tree has uncommitted changes.
# platform-lib change cascades to every backend (shared dep).
detect_changed_services() {
    local roots=("platform-lib" "frontend")
    for svc in "${SVC_NAMES[@]}"; do roots+=("$svc"); done

    if ! git rev-parse --is-inside-work-tree &>/dev/null; then
        warn "Not inside a git repo — falling back to full rebuild"
        docker compose config --services
        return
    fi

    declare -A hits=()
    local paths
    paths=$( { git diff --name-only HEAD 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null; } | sort -u)

    while IFS= read -r p; do
        [[ -z "$p" ]] && continue
        for r in "${roots[@]}"; do
            if [[ "$p" == "$r" || "$p" == "$r/"* ]]; then
                hits[$r]=1
                break
            fi
        done
    done <<< "$paths"

    # Expand a backend entry to all compose services matching it (psm-api → psm-api-1, psm-api-2)
    expand_compose() {
        local svc=$1
        docker compose config --services 2>/dev/null | grep -E "^${svc}(-[0-9]+)?$" || echo "$svc"
    }

    # platform-lib change → all backends
    if [[ -n "${hits[platform-lib]:-}" ]]; then
        for svc in "${SVC_NAMES[@]}"; do expand_compose "$svc"; done
        [[ -n "${hits[frontend]:-}" ]] && echo "plm-frontend"
        return
    fi

    for svc in "${SVC_NAMES[@]}"; do
        [[ -n "${hits[$svc]:-}" ]] && expand_compose "$svc"
    done
    [[ -n "${hits[frontend]:-}" ]] && echo "plm-frontend"
}

print_banner() {
    echo ""
    echo "  ┌──────────────────────────────────────────────┐"
    printf "  │  %-12s : http://localhost:%-5s         │\n" "Frontend" "3000"
    for svc in "${SVC_NAMES[@]}"; do
        printf "  │  %-12s : http://localhost:%-5s         │\n" "$svc" "${SVC_PORT[$svc]}"
    done
    echo "  └──────────────────────────────────────────────┘"
    echo ""
    echo "  DBeaver (PostgreSQL):"
    echo "    host=localhost port=5432 db=plmdb user=plm password=\${PG_PASSWORD:-changeme}"
    echo ""
    echo "  docker compose logs -f [svc]   → stream logs"
    echo "  ./run.sh down                  → stop containers"
    echo ""
}

# ── Local mode (native java + node, no Docker) ──────────────
local_log() { echo "/tmp/plm-${1}-$$.log"; }

local_start() {
    local service=$1
    shift
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

    log "Installing platform-lib to local ~/.m2…"
    if ! ./psm-api/mvnw -f platform-lib/pom.xml -q install -DskipTests; then
        err "Failed to install platform-lib — aborting local mode"
        exit 1
    fi
    ok "platform-lib installed"
    echo ""

    for svc in "${SVC_NAMES[@]}"; do
        local_start_backend "$svc"
    done
    local_start_frontend

    echo ""
    echo "  ┌─────────────────────────────────────────┐"
    echo "  │  Frontend : http://localhost:5173       │"
    for svc in "${SVC_NAMES[@]}"; do
        printf "  │  %-12s : http://localhost:%-5s    │\n" "$svc" "${SVC_PORT[$svc]}"
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
    wait "$LOGS_PID"
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
    local build_args="${6:-}" dockerfile="${7:-Dockerfile}" extra_ctx="${8:-}"

    log "[$service] Building builder stage (${dockerfile})…"
    # shellcheck disable=SC2086
    docker build --target builder $build_args $extra_ctx --file "$ctx/$dockerfile" -t "$tag" "$ctx"

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

# Rewrite dev docker-compose.yml for dist: replace multi-stage build blocks
# with simple build contexts pointing at dist subdirectories.
rewrite_compose_for_dist() {
    local out=$1
    perl -0777 -pe '
        # Backend: multi-line build block → single-line (extract service dir from dockerfile path)
        s/build:\n\s+context: \.\n\s+dockerfile: ([^\/]+)\/Dockerfile\n\s+target: runtime/build: .\/$1/g;
        # Frontend: multi-line build block → single-line
        s/build:\n\s+context: (.\/[^\n]+)\n\s+dockerfile: Dockerfile\n/build: $1\n/g;
        # Image tags: :dev/:latest → :dist
        s/(image: \S+):(?:dev|latest)/$1:dist/g;
        # Remove container_name directives (avoids conflicts with dev stack)
        s/^\s+container_name:.*\n//gm;
    ' docker-compose.yml > "$out"
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

    mkdir -p "$DIST/vault"
    cp vault/config.hcl   "$DIST/vault/config.hcl"
    cp vault/bootstrap.sh "$DIST/vault/bootstrap.sh"
    chmod +x "$DIST/vault/bootstrap.sh"

    if $NATIVE_MODE; then
        log "=== PLM Core — package (native) ==="
        log "GraalVM static binaries — this takes ~5–10 min per service"
    else
        log "=== PLM Core — package ==="
    fi
    log "Building pre-compiled distribution in ./$DIST/"
    echo ""

    # Each service Dockerfile's builder stage expects the shared base image.
    build_platform_lib_image || exit 1
    echo ""

    local BUILT_SVCS=()

    if $NATIVE_MODE; then
        for svc in "${SVC_NAMES[@]}"; do
            if [[ ! -f "$svc/Dockerfile.native" ]]; then
                warn "[$svc] no Dockerfile.native — skipping in --native mode"
                rm -rf "${DIST:?}/$svc"
                continue
            fi
            extract_from_builder "$svc" "." "plm-$svc-native-builder" \
                "/build/target/server" "$DIST/$svc/server" \
                "" "$svc/Dockerfile.native"
            chmod +x "$DIST/$svc/server"
            BUILT_SVCS+=("$svc")
            echo ""
        done
    else
        for svc in "${SVC_NAMES[@]}"; do
            local build_args=""
            if grep -q '<id>dist</id>' "$svc/pom.xml" 2>/dev/null; then
                build_args="--build-arg MAVEN_EXTRA_OPTS=-Pdist"
            fi
            extract_from_builder "$svc" "." "plm-$svc-pkg-builder" \
                "/build/target" "$DIST/$svc/_target" \
                "$build_args" "$svc/Dockerfile"
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

    SVC_NAMES=("${BUILT_SVCS[@]}")

    extract_from_builder "frontend" "frontend" "plm-fe-pkg-builder" \
        "/app/dist/." "$DIST/frontend/html"
    cp frontend/nginx.conf           "$DIST/frontend/nginx.conf"
    cp frontend/docker-entrypoint.sh "$DIST/frontend/docker-entrypoint.sh"
    echo ""

    log "Writing runtime Dockerfiles…"
    for svc in "${SVC_NAMES[@]}"; do
        if $NATIVE_MODE; then
            write_native_dockerfile "$DIST/$svc/Dockerfile" "${SVC_PORT[$svc]}"
        else
            write_jvm_dockerfile    "$DIST/$svc/Dockerfile" "${SVC_PORT[$svc]}"
        fi
    done
    write_frontend_dockerfile "$DIST/frontend/Dockerfile"

    log "Writing dist/docker-compose.yml…"
    rewrite_compose_for_dist "$DIST/docker-compose.yml"

    cat > "$DIST/.env.example" << 'EOF'
# Copy to .env and set strong values before first launch.
PG_PASSWORD=changeme
# Must be >= 32 bytes — generate with: openssl rand -base64 32
PLM_SERVICE_SECRET=
EOF

    echo ""
    log "=== Verifying packaged distribution ==="

    cat > "$DIST/.env" <<EOF
PG_PASSWORD=$(openssl rand -hex 16)
PLM_SERVICE_SECRET=$(openssl rand -base64 32)
EOF

    log "Building and starting dist/docker-compose.yml…"

    local DIST_COMPOSE="docker compose -f $DIST/docker-compose.yml -p plm-dist-verify"

    if ! $DIST_COMPOSE up -d --build; then
        err "dist compose failed to start — package may be broken"
        $DIST_COMPOSE down --volumes 2>/dev/null || true
        exit 1
    fi

    local verify_ok=true
    for svc in "${SVC_NAMES[@]}"; do
        local port="${SVC_PORT[$svc]:-}"
        [[ -z "$port" ]] && continue
        log "   Waiting for $svc health on :$port (max ${HEALTH_TIMEOUT}s)…"
        local elapsed=0
        while (( elapsed < HEALTH_TIMEOUT )); do
            if curl -sf "http://localhost:$port/actuator/health" >/dev/null 2>&1; then
                ok "$svc healthy after ${elapsed}s"
                break
            fi
            sleep 3; (( elapsed += 3 )); printf '.'
        done
        if (( elapsed >= HEALTH_TIMEOUT )); then
            echo ""
            err "$svc did NOT become healthy within ${HEALTH_TIMEOUT}s"
            verify_ok=false
        fi
    done

    log "Stopping verification containers…"
    $DIST_COMPOSE down --volumes

    if ! $verify_ok; then
        err "Verification failed — one or more services unhealthy"
        exit 1
    fi
    ok "All services started and passed health checks"

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
CMD="${1:-}"

case "$CMD" in
    package|--package)
        run_package "$@"
        exit 0
        ;;
    down|--down)
        log "Stopping containers…"
        docker compose down
        exit 0
        ;;
    local|--local)
        run_local
        exit 0
        ;;
esac

# Default / build / reset paths — compose up-then-exit-when-healthy
TARGETS=()
DO_BUILD=false
BUILD_ALL=false

case "$CMD" in
    reset|--reset)
        warn "This will destroy all database volumes and seed data."
        read -rp "  Continue? [y/N] " confirm
        [[ "${confirm,,}" != "y" ]] && { log "Aborted."; exit 0; }
        log "Stopping containers and wiping volumes…"
        docker compose down --volumes --remove-orphans
        DO_BUILD=true
        BUILD_ALL=true
        ;;
    build|--build)
        DO_BUILD=true
        shift
        if [[ "${1:-}" == "all" ]]; then
            BUILD_ALL=true
        elif [[ $# -gt 0 ]]; then
            TARGETS=("$@")
        fi
        ;;
    "") ;;
    *)
        err "Unknown command: $CMD"
        echo "Usage: $0 [build [all|<svc>...] | reset | down | local | package [-y|--native]]"
        exit 1
        ;;
esac

# platform-lib base image must exist before any service build. Cheap no-op
# when platform-lib/ source is unchanged (Docker layer cache).
build_platform_lib_image || exit 1

if $DO_BUILD; then
    if $BUILD_ALL; then
        log "Rebuilding all images…"
        docker compose build
    elif [[ ${#TARGETS[@]} -gt 0 ]]; then
        log "Rebuilding: ${TARGETS[*]}"
        docker compose build "${TARGETS[@]}"
    else
        # Auto-detect via git
        mapfile -t TARGETS < <(detect_changed_services)
        if [[ ${#TARGETS[@]} -eq 0 ]]; then
            ok "No project changes detected — skipping build."
        else
            log "Rebuilding changed projects: ${TARGETS[*]}"
            docker compose build "${TARGETS[@]}"
        fi
    fi
fi

log "Starting services…"
if [[ ${#TARGETS[@]} -gt 0 ]] && ! $BUILD_ALL; then
    # Force-recreate just the rebuilt services so the new images are picked up,
    # and bring the rest up with their existing images.
    docker compose up -d --no-deps --force-recreate "${TARGETS[@]}"
    docker compose up -d
else
    docker compose up -d
fi

if ! wait_all_healthy; then
    err "Some services did not become healthy. Check logs:  docker compose logs -f"
    exit 1
fi

print_banner
