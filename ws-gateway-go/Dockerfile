# ws-gateway (Go). Build context = repo root so the platform-lib-go replace
# directive (../platform-lib-go) resolves.
FROM golang:1.26 AS builder
WORKDIR /build
COPY platform-lib-go ./platform-lib-go
COPY ws-gateway-go ./ws-gateway-go
WORKDIR /build/ws-gateway-go
RUN CGO_ENABLED=0 go build -trimpath -o /ws-gateway .

# alpine ships busybox wget for the compose healthcheck.
FROM alpine:3.20 AS runtime
COPY --from=builder /ws-gateway /usr/local/bin/ws-gateway
EXPOSE 8085
ENTRYPOINT ["/usr/local/bin/ws-gateway"]
