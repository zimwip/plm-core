# ============================================================
# DST (Data Store) - Dockerfile (multi-stage)
#
# Build context is the repo root (see docker-compose.yml).
# Stage 0 (lib-builder) : reuse pre-built platform-lib base image
# Stage 1 (builder)     : Maven compile dst -> Spring Boot layered JAR
# Stage 2 (runtime)     : Eclipse Temurin JRE + layered app
# ============================================================

FROM plm-platform-lib:dev AS lib-builder

FROM docker.io/library/maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

COPY --from=lib-builder /root/.m2 /root/.m2

COPY dst/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress 2>/dev/null || true

COPY dst/src ./src
ARG MAVEN_EXTRA_OPTS=""
RUN mvn clean package -Dmaven.test.skip=true --no-transfer-progress $MAVEN_EXTRA_OPTS

RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    java -Djarmode=layertools -jar "$JAR" extract --destination target/extracted

FROM docker.io/library/eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S dst && adduser -S dst -G dst
USER dst
WORKDIR /app

COPY --chown=dst:dst --from=builder /build/target/extracted/dependencies/          ./
COPY --chown=dst:dst --from=builder /build/target/extracted/spring-boot-loader/    ./
COPY --chown=dst:dst --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --chown=dst:dst --from=builder /build/target/extracted/application/           ./

EXPOSE 8086

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8086/api/dst/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
