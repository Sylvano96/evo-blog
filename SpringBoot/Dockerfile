# ---------- build ----------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /build

# Download dependencies first (cached as long as pom.xml does not change)
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
# Tests run with `./mvnw test` on the host / in CI; skipped here to keep image builds fast.
RUN mvn -B -q -DskipTests package \
    && cp target/*.jar /build/app.jar

# ---------- run ----------
FROM eclipse-temurin:17-jre-alpine
WORKDIR /app

# Run as an unprivileged user
RUN addgroup -S evoblog && adduser -S evoblog -G evoblog \
    && mkdir -p /app/uploads && chown -R evoblog:evoblog /app
USER evoblog

COPY --from=build --chown=evoblog:evoblog /build/app.jar app.jar

ENV UPLOAD_DIR=/app/uploads \
    LOG_FILE="" \
    JAVA_OPTS="-XX:MaxRAMPercentage=75"

EXPOSE 8080
VOLUME ["/app/uploads"]

ENTRYPOINT ["sh", "-c", "exec java $JAVA_OPTS -jar /app/app.jar"]
