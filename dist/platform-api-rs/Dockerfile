FROM debian:12-slim
RUN apt-get update \
 && apt-get install -y --no-install-recommends wget ca-certificates \
 && rm -rf /var/lib/apt/lists/* \
 && useradd -r -s /usr/sbin/nologin app
USER app
WORKDIR /app
COPY app .
EXPOSE 8084
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:8084/actuator/health || exit 1
ENTRYPOINT ["./app"]
