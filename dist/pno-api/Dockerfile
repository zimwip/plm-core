# Stage 1: jdeps analysis + jlink custom JRE
FROM eclipse-temurin:21-alpine AS jlink
COPY app.jar /tmp/app.jar
RUN mkdir -p /tmp/jdeps && cd /tmp/jdeps && jar xf /tmp/app.jar && \
    DEPS=$(jdeps \
        --multi-release 21 \
        --ignore-missing-deps \
        --print-module-deps \
        --class-path '/tmp/jdeps/BOOT-INF/lib/*' \
        /tmp/jdeps/BOOT-INF/classes \
        2>/dev/null | tail -1) && \
    EXTRA="jdk.crypto.ec,jdk.crypto.cryptoki,jdk.naming.dns,jdk.unsupported" && \
    MODULES=$(printf '%s' "$DEPS,$EXTRA" | tr ',' '\n' | grep -v '^$' | sort -u | tr '\n' ',' | sed 's/,$//') && \
    echo "=== jlink modules: $MODULES ===" && \
    jlink \
        --add-modules "$MODULES" \
        --strip-debug \
        --no-man-pages \
        --no-header-files \
        --compress=zip-6 \
        --output /custom-jre

# Stage 2: lean runtime
FROM alpine:3.21 AS runtime
RUN apk add --no-cache wget
COPY --from=jlink /custom-jre /opt/jre
RUN addgroup -S pno && adduser -S pno -G pno
USER pno
WORKDIR /app
COPY app.jar .
EXPOSE 8081
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8081/actuator/health || exit 1
ENTRYPOINT ["/opt/jre/bin/java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
