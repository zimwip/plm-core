FROM alpine:3.20
RUN addgroup -S app && adduser -S app -G app
USER app
WORKDIR /app
COPY app .
EXPOSE 8089
HEALTHCHECK --interval=30s --timeout=10s --start-period=15s --retries=3 \
    CMD wget -qO- http://localhost:8089/actuator/health || exit 1
ENTRYPOINT ["./app"]
