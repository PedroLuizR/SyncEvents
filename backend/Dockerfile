# Imagem do backend do SyncEvents (usada pelo docker-compose.yml da raiz).
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -B -q dependency:go-offline
COPY src ./src
RUN mvn -B -q -DskipTests package && cp target/syncevents-backend-*.jar /app.jar

FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /app.jar app.jar
ENV APP_STORAGE_DIR=/app/uploads
EXPOSE 8080
# usa até 75% da memória do container (planos pequenos de nuvem)
ENTRYPOINT ["java", "-XX:MaxRAMPercentage=75.0", "-jar", "/app/app.jar"]
