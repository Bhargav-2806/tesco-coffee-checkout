# ---------- Stage 1: build the Spring Boot jar with Maven ----------
# eclipse-temurin is the official free OpenJDK build; "21-jdk" has the full JDK + javac
FROM eclipse-temurin:21-jdk-alpine AS builder

# Install Maven (the Alpine image doesn't ship with it)
RUN apk add --no-cache maven

WORKDIR /app

# Copy just the pom.xml first so dependency download is cached when only code changes
COPY pom.xml ./

# Download all dependencies defined in pom.xml (populates the local Maven cache)
RUN mvn -B -q dependency:go-offline

# Now copy the source tree
COPY src ./src

# Package into a single runnable jar (skip tests to keep the build fast in dev)
RUN mvn -B -q clean package -DskipTests

# ---------- Stage 2: tiny runtime image with just the JRE ----------
# "21-jre-alpine" only contains what's needed to RUN Java (~160MB) — no compiler
FROM eclipse-temurin:21-jre-alpine

# Run as a non-root user
RUN adduser -D -u 10001 app
USER app

WORKDIR /home/app

# Copy the built jar from the builder stage under a stable name
COPY --from=builder /app/target/*.jar app.jar

# Document the port the actuator listens on
EXPOSE 8081

# Start Spring Boot
CMD ["java", "-jar", "app.jar"]
