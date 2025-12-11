# Step 1: Build JAR using Maven
FROM maven:3.9.5-eclipse-temurin-17 AS build
WORKDIR /app
COPY . .
RUN mvn -DskipTests clean package

# Step 2: Run the Spring Boot app
FROM eclipse-temurin:17-jdk
WORKDIR /app
COPY --from=build /app/target/email-writer-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 9191
ENTRYPOINT ["java", "-jar", "app.jar"]
