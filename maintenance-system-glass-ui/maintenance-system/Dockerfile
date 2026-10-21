
FROM eclipse-temurin:26-jdk AS build
WORKDIR /app

COPY . .

RUN apt-get update && apt-get install -y maven
RUN mvn -B clean package -DskipTests

FROM eclipse-temurin:26-jre
WORKDIR /app

COPY --from=build /app/target/*.jar app.jar

EXPOSE 8080
CMD ["sh", "-c", "java -Dserver.port=${PORT:-8080} -jar app.jar"]
