FROM eclipse-temurin:21-jdk-jammy AS build
WORKDIR /workspace
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN chmod +x mvnw && ./mvnw -B dependency:go-offline
COPY src/ src/
RUN ./mvnw -B -DskipTests package && \
    find target -maxdepth 1 -type f -name '*.jar' ! -name '*.original' -exec cp {} app.jar \; && \
    test -f app.jar

FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/* && \
    useradd --system --uid 10001 --create-home app
WORKDIR /app
COPY --from=build /workspace/app.jar app.jar
USER 10001
EXPOSE 10000
HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 CMD curl --fail --silent "http://127.0.0.1:${PORT:-10000}/actuator/health" || exit 1
ENTRYPOINT ["java", "-jar", "app.jar"]
