# dst-zig — Zig port of the dst (Data Store) service.
# Build context is the repo root (platform-lib-zig is a path dependency).
#
#   docker build -f dst-zig/Dockerfile --target runtime -t dst:dev .
#
# Glibc build (debian) — the OpenTelemetry SDK's OTLP exporter pulls in zlib (C),
# which cross-compiles cleanly to the host's glibc but not to musl; zlib itself
# is statically linked, so only glibc is dynamic at runtime. Matches the Rust
# lane's debian-slim runtime.

# ── ui-builder: Vite build of the microfrontend bundles ──────────────────────
FROM docker.io/library/node:20-alpine AS ui-builder
WORKDIR /ui
COPY dst-zig/ui/package.json dst-zig/ui/package-lock.json ./
RUN npm ci --silent
COPY dst-zig/ui/vite.config.js .
COPY dst-zig/ui/src ./src
RUN npx vite build --outDir /ui-dist --emptyOutDir

# ── builder: pinned Zig 0.15.2 → native glibc binary ─────────────────────────
FROM debian:12-slim AS builder
RUN apt-get update \
 && apt-get install -y --no-install-recommends curl xz-utils ca-certificates zlib1g-dev \
 && rm -rf /var/lib/apt/lists/*
ARG ZIG_VERSION=0.15.2
RUN curl -fsSL "https://ziglang.org/download/${ZIG_VERSION}/zig-x86_64-linux-${ZIG_VERSION}.tar.xz" \
      | tar -xJ -C /opt \
 && ln -s "/opt/zig-x86_64-linux-${ZIG_VERSION}/zig" /usr/local/bin/zig

WORKDIR /build
COPY platform-lib-zig ./platform-lib-zig
COPY dst-zig ./dst-zig
RUN rm -rf platform-lib-zig/.zig-cache platform-lib-zig/zig-out \
           dst-zig/.zig-cache dst-zig/zig-out

WORKDIR /build/dst-zig
# zig's @cImport (used by the OTel SDK for zlib.h) doesn't auto-search the
# debian system include dir; point clang at it explicitly.
ENV C_INCLUDE_PATH=/usr/include:/usr/include/x86_64-linux-gnu
RUN zig build -Doptimize=ReleaseFast
# → /build/dst-zig/zig-out/bin/dst (glibc dynamic; zlib static)

# ── runtime: debian-slim (glibc) ─────────────────────────────────────────────
FROM debian:12-slim AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd -r -s /usr/sbin/nologin app
USER app
WORKDIR /app
COPY --from=builder /build/dst-zig/zig-out/bin/dst .
COPY --from=ui-builder /ui-dist ./static/ui
EXPOSE 8086
HEALTHCHECK --interval=20s --timeout=10s --retries=5 --start-period=60s \
    CMD wget -qO- http://localhost:8086/actuator/health || exit 1
ENTRYPOINT ["./dst"]
