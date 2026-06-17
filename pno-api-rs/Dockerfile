# pno-api (Rust). Build context = repo root so the platform-lib-rs path
# dependency (../platform-lib-rs) resolves.
FROM rust:1.95-slim AS builder
WORKDIR /build
COPY platform-lib-rs ./platform-lib-rs
COPY pno-api-rs ./pno-api-rs
WORKDIR /build/pno-api-rs
RUN cargo build --release --locked || cargo build --release

# Slim runtime — wget for the compose healthcheck. Internal traffic is plain
# HTTP within the compose network.
FROM debian:12-slim AS runtime
RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/*
COPY --from=builder /build/pno-api-rs/target/release/pno-api /usr/local/bin/pno-api
EXPOSE 8081
ENTRYPOINT ["/usr/local/bin/pno-api"]
