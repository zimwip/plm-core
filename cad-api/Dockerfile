# syntax=docker/dockerfile:1
# ============================================================
# CAD API - Dockerfile (multi-stage)
#
# Requires BuildKit (RUN --mount=type=cache). Docker 23+ enables it by default;
# older docker needs DOCKER_BUILDKIT=1. Podman/buildah supports it natively.
#
# Build context is the repo root (see docker-compose.yml).
# Stage 0 (lib-builder) : reuse pre-built platform-lib base image
# Stage 1 (builder)     : Maven compile cad-api -> Spring Boot layered JAR
# Stage 2 (runtime)     : Eclipse Temurin JRE + layered app
# ============================================================

FROM plm-platform-lib:dev AS lib-builder

FROM docker.io/library/maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Base m2 (incl. fresh platform-lib snapshot) goes to a seed dir, NOT /root/.m2 — the
# cache mount below shadows /root/.m2, so we seed it from here inside the RUN.
COPY --from=lib-builder /root/.m2 /seed-m2

COPY cad-api/pom.xml .
COPY cad-api/src ./src
ARG MAVEN_EXTRA_OPTS=""

# Persistent maven repo cache: third-party deps download ONCE and survive across builds
# (no re-download, no Maven Central 429 on rebuilds). Seed pulls in base deps on first
# run; com/plm is force-refreshed every build so a rebuilt platform-lib snapshot is used.
RUN --mount=type=cache,target=/root/.m2,sharing=locked \
    cp -rn /seed-m2/. /root/.m2/ 2>/dev/null || true; \
    cp -rf /seed-m2/com/plm/. /root/.m2/com/plm/ 2>/dev/null || true; \
    cp -rn /host-m2/. /root/.m2/ 2>/dev/null || true; \
    mvn clean package -Dmaven.test.skip=true --no-transfer-progress $MAVEN_EXTRA_OPTS

RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    java -Djarmode=layertools -jar "$JAR" extract --destination target/extracted

FROM docker.io/library/eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S cad && adduser -S cad -G cad
USER cad
WORKDIR /app

COPY --chown=cad:cad --from=builder /build/target/extracted/dependencies/          ./
COPY --chown=cad:cad --from=builder /build/target/extracted/spring-boot-loader/    ./
COPY --chown=cad:cad --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --chown=cad:cad --from=builder /build/target/extracted/application/           ./

EXPOSE 8087

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8087/api/cad/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
