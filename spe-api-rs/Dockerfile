# spe-api gateway (Rust). Build context = repo root so the platform-lib-rs
# path dependency (../platform-lib-rs) resolves.
FROM rust:1.95-slim AS builder
WORKDIR /build
COPY platform-lib-rs ./platform-lib-rs
COPY spe-api-rs ./spe-api-rs
WORKDIR /build/spe-api-rs
RUN cargo build --release --locked || cargo build --release

# Slim runtime — wget kept for the compose healthcheck. Internal traffic is
# plain HTTP within the compose network, so no CA bundle is required.
FROM debian:12-slim AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/spe-api-rs/target/release/spe-api /usr/local/bin/spe-api
EXPOSE 8082
ENTRYPOINT ["/usr/local/bin/spe-api"]
