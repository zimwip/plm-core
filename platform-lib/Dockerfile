# ============================================================
# platform-lib base image — shared by every service's stage 0.
#
# Build context: this directory. Built once by run.sh; each service
# Dockerfile then starts with `FROM plm-platform-lib:dev AS lib-builder`
# and inherits the installed artifact from /root/.m2.
#
# Rebuild trigger: any change under platform-lib/. Docker layer cache
# short-circuits a no-op rebuild.
# ============================================================
FROM docker.io/library/maven:3.9-eclipse-temurin-21-alpine
WORKDIR /lib
COPY pom.xml .
COPY src ./src
RUN mvn -q install -DskipTests --no-transfer-progress
