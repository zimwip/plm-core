# ============================================================
# webdav - Dockerfile (multi-stage)
#
# Build context is the repo root (see docker-compose.yml).
# Stage 0 (lib-builder) : reuse pre-built platform-lib base image
# Stage 1 (builder)     : Maven compile webdav -> Spring Boot layered JAR
# Stage 2 (runtime)     : Eclipse Temurin JRE + layered app
# ============================================================

FROM plm-platform-lib:dev AS lib-builder

# ── Stage 1: build webdav ────────────────────────────────────
FROM docker.io/library/maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

COPY --from=lib-builder /root/.m2 /root/.m2

COPY webdav/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress 2>/dev/null || true

COPY webdav/src ./src
ARG MAVEN_EXTRA_OPTS=""
RUN mvn clean package -Dmaven.test.skip=true --no-transfer-progress $MAVEN_EXTRA_OPTS

RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    java -Djarmode=layertools -jar "$JAR" extract --destination target/extracted

FROM docker.io/library/eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S dav && adduser -S dav -G dav
USER dav
WORKDIR /app

COPY --chown=dav:dav --from=builder /build/target/extracted/dependencies/          ./
COPY --chown=dav:dav --from=builder /build/target/extracted/spring-boot-loader/    ./
COPY --chown=dav:dav --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --chown=dav:dav --from=builder /build/target/extracted/application/           ./

EXPOSE 8089

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8089/api/dav/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
