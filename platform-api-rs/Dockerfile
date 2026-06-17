# platform-api (Rust). Build context = repo root so the platform-lib-rs path
# dependency (../platform-lib-rs) resolves.
FROM rust:1.95-slim AS builder
WORKDIR /build
COPY platform-lib-rs ./platform-lib-rs
COPY platform-api-rs ./platform-api-rs
WORKDIR /build/platform-api-rs
RUN cargo build --release --locked || cargo build --release

# Slim runtime — wget for the compose healthcheck. Internal traffic is plain
# HTTP within the compose network.
FROM debian:12-slim AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/platform-api-rs/target/release/platform-api /usr/local/bin/platform-api
EXPOSE 8084
ENTRYPOINT ["/usr/local/bin/platform-api"]
