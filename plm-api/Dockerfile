# ============================================================
# PLM Core - Dockerfile (multi-stage)
# ============================================================

# Stage 1 : Build avec Maven
FROM maven:3.9-eclipse-temurin-21-alpine AS builder

WORKDIR /build

# Copier le POM en premier pour profiter du cache des dépendances Maven
COPY pom.xml .
RUN --mount=type=cache,target=/root/.m2 \
    mvn dependency:go-offline -q 2>/dev/null || true

# Copier les sources et compiler
COPY src ./src
RUN --mount=type=cache,target=/root/.m2 \
    mvn clean package -Dmaven.test.skip=true -q

# ============================================================
# Stage 2 : Image de runtime minimale
# ============================================================
FROM eclipse-temurin:21-jre-alpine AS runtime

# Sécurité : utilisateur non-root
RUN addgroup -S plm && adduser -S plm -G plm
USER plm

WORKDIR /app

# Copier le JAR depuis le stage builder
COPY --from=builder /build/target/*.jar app.jar

# Port applicatif
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget -qO- http://localhost:8080/actuator/health || exit 1

# Point d'entrée avec options JVM adaptées aux conteneurs
ENTRYPOINT ["java", \
    "-XX:+UseContainerSupport", \
    "-XX:MaxRAMPercentage=75.0", \
    "-Djava.security.egd=file:/dev/./urandom", \
    "-jar", "app.jar"]
