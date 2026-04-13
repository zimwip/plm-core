# ============================================================
# PSM API - Dockerfile (multi-stage)
#
# Stage 1 (builder) : Maven compile
#                     → Spring Boot layered JAR extraction
#                     → jdeps analysis → jlink custom JRE
# Stage 2 (runtime) : bare Alpine + custom JRE + layered app
# ============================================================

# ── Stage 1: build ───────────────────────────────────────────
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline --no-transfer-progress 2>/dev/null || true

COPY src ./src
# MAVEN_EXTRA_OPTS is injected by run.sh package as -Pdist to strip Swagger UI.
# Leave empty for normal dev builds (the dev profile activates by default).
ARG MAVEN_EXTRA_OPTS=""
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -Dmaven.test.skip=true --no-transfer-progress $MAVEN_EXTRA_OPTS

# Extract Spring Boot layered JAR (on by default in Boot 3.x).
# Splits the fat JAR into 4 Docker layers ordered by change frequency so
# only the tiny application/ layer is invalidated on a normal code change.
RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    java -Djarmode=layertools -jar "$JAR" extract --destination target/extracted

# Determine the minimal JDK module set with jdeps, then build a stripped JRE
# with jlink.  maven:3.9-eclipse-temurin-21-alpine ships the full JDK so both
# tools are available here.
#
# jdeps analyses our bytecode and the full BOOT-INF/lib classpath.
# --ignore-missing-deps silences warnings about classes loaded dynamically at
# runtime (Spring proxies, JOOQ reflection, etc.) — they cannot be seen by
# static analysis.
#
# EXTRA covers known dynamic dependencies that jdeps never reports:
#   jdk.crypto.ec / jdk.crypto.cryptoki  — TLS cipher suites (PostgreSQL SSL)
#   jdk.naming.dns                       — JNDI/DNS lookup used by HikariCP
#   jdk.unsupported                      — sun.misc.Unsafe (byte-buddy, Netty, JOOQ)
RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    mkdir -p /tmp/jdeps && cd /tmp/jdeps && jar xf "/build/$JAR" && \
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

# ── Stage 2: runtime ─────────────────────────────────────────
FROM alpine:3.21 AS runtime

RUN apk add --no-cache wget

COPY --from=builder /custom-jre /opt/jre

RUN addgroup -S plm && adduser -S plm -G plm
USER plm
WORKDIR /app

COPY --chown=plm:plm --from=builder /build/target/extracted/dependencies/          ./
COPY --chown=plm:plm --from=builder /build/target/extracted/spring-boot-loader/    ./
COPY --chown=plm:plm --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --chown=plm:plm --from=builder /build/target/extracted/application/           ./

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

ENTRYPOINT ["/opt/jre/bin/java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
