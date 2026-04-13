# ============================================================
# PSM API - Dockerfile (multi-stage)
#
# Stage 1 (builder) : Maven compile → Spring Boot layered JAR
# Stage 2 (runtime) : Eclipse Temurin JRE + layered app
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

# ── Stage 2: runtime ─────────────────────────────────────────
FROM eclipse-temurin:21-jre-alpine AS runtime

RUN apk add --no-cache wget

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

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
