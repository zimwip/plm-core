# webdav (Go). Build context = repo root so the platform-lib-go replace
# directive (../platform-lib-go) resolves.
FROM golang:1.26 AS builder
WORKDIR /build
COPY platform-lib-go ./platform-lib-go
COPY webdav-go ./webdav-go
WORKDIR /build/webdav-go
RUN CGO_ENABLED=0 go build -trimpath -o /webdav .

# alpine ships busybox wget for the compose healthcheck.
FROM alpine:3.20 AS runtime
COPY --from=builder /webdav /usr/local/bin/webdav
EXPOSE 8089
ENTRYPOINT ["/usr/local/bin/webdav"]
