# ============================================================
# search-api — Graph-aware Lucene search service (multi-stage)
#
# Stage 0 (lib-builder) : reuse pre-built platform-lib base image
# Stage 1 (builder)     : Maven compile -> Spring Boot layered JAR
# Stage 2 (runtime)     : Eclipse Temurin JRE
# ============================================================

FROM plm-platform-lib:dev AS lib-builder

FROM docker.io/library/maven:3.9-eclipse-temurin-21-alpine AS builder
WORKDIR /build

COPY --from=lib-builder /root/.m2 /root/.m2

COPY search-api/pom.xml .
RUN mvn dependency:go-offline --no-transfer-progress 2>/dev/null || true

COPY search-api/src ./src
ARG MAVEN_EXTRA_OPTS=""
RUN mvn clean package -Dmaven.test.skip=true --no-transfer-progress $MAVEN_EXTRA_OPTS

RUN JAR=$(find target -name '*.jar' ! -name '*original*' | head -1) && \
    java -Djarmode=layertools -jar "$JAR" extract --destination target/extracted

FROM docker.io/library/eclipse-temurin:21-jre-alpine AS runtime

RUN addgroup -S search && adduser -S search -G search && \
    mkdir -p /var/lib/search-data && chown search:search /var/lib/search-data
USER search
WORKDIR /app

COPY --chown=search:search --from=builder /build/target/extracted/dependencies/          ./
COPY --chown=search:search --from=builder /build/target/extracted/spring-boot-loader/    ./
COPY --chown=search:search --from=builder /build/target/extracted/snapshot-dependencies/ ./
COPY --chown=search:search --from=builder /build/target/extracted/application/           ./

EXPOSE 8088

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8088/api/search/actuator/health || exit 1

ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.awt.headless=true", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "org.springframework.boot.loader.launch.JarLauncher"]
