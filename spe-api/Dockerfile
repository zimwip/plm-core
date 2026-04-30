# ============================================================
# SPE API - Dockerfile (multi-stage)
#
# Build context is the repo root (see docker-compose.yml).
# Stage 0 (lib-builder) : mvn install platform-lib into ~/.m2
# Stage 1 (builder)     : Maven compile spe-api → Spring Boot layered JAR
# Stage 2 (runtime)     : Eclipse Temurin JRE + layered app
# ============================================================

# ── Stage 0: reuse pre-built platform-lib base image (run.sh builds it) ──
FROM plm-platform-lib:dev AS lib-builder

# ── Stage 1: build spe-api ───────────────────────────────────
FROM docker.io/library/maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

COPY --from=lib-builder /root/.m2 /root/.m2

COPY spe-api/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress 2>/dev/null || true

COPY spe-api/src ./src
ARG MAVEN_EXTRA_OPTS=""
RUN mvn clean package -Dmaven.test.skip=true --no-transfer-progress $MAVEN_EXTRA_OPTS

RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    java -Djarmode=layertools -jar "$JAR" extract --destination target/extracted

# ── Stage 2: runtime ─────────────────────────────────────────
FROM docker.io/library/eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S spe && adduser -S spe -G spe
USER spe
WORKDIR /app

COPY --chown=spe:spe --from=builder /build/target/extracted/dependencies/          ./
COPY --chown=spe:spe --from=builder /build/target/extracted/spring-boot-loader/    ./
COPY --chown=spe:spe --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --chown=spe:spe --from=builder /build/target/extracted/application/           ./

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8082/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
