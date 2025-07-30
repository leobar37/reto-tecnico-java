# API - Technical Challenge

This is a Spring Boot REST API for managing claims, built with Java 21 and PostgreSQL.

## Prerequisites

- **Java 21** or higher
- **PostgreSQL** database running on port 5433
- **Maven** (or use the included Maven wrapper)

## Database Setup

1. Ensure PostgreSQL is running on port 5433
2. Create a database named `myapp`
3. The default credentials are:
   - Username: `postgres`
   - Password: `postgres`

You can modify these settings in `src/main/resources/application.properties` if needed.

## Running the Application

### Using Maven Wrapper (Recommended)

```bash
# On macOS/Linux
./mvnw spring-boot:run

# On Windows
mvnw.cmd spring-boot:run
```

### Using System Maven

```bash
mvn spring-boot:run
```

### Building and Running JAR

```bash
# Build the application
./mvnw clean package

# Run the generated JAR
java -jar target/api-0.0.1-SNAPSHOT.jar
```

## API Documentation

Once the application is running, you can access:

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **OpenAPI Docs**: http://localhost:8080/api-docs

## Available Endpoints

The API provides endpoints for claim management:

- `GET /api/claims` - Get all claims
- `GET /api/claims/{id}` - Get claim by ID
- `POST /api/claims` - Create a new claim
- `PUT /api/claims/{id}/status` - Update claim status
- `GET /api/hello` - Test endpoint

## Development Features

- **Hot Reload**: Spring Boot DevTools is enabled for development
- **SQL Logging**: SQL queries are logged in the console
- **Automatic Schema Updates**: Hibernate DDL auto-update is enabled

## Project Structure

```
src/
├── main/
│   ├── java/com/example/api/
│   │   ├── ApiApplication.java          # Main application class
│   │   ├── config/                      # Configuration classes
│   │   ├── controller/                  # REST controllers
│   │   ├── dto/                         # Data Transfer Objects
│   │   ├── entity/                      # JPA entities
│   │   ├── exception/                   # Exception handling
│   │   ├── repository/                  # Data repositories
│   │   └── service/                     # Business logic
│   └── resources/
│       └── application.properties       # Configuration file
└── test/                               # Test classes
```

## Testing

Run tests using:

```bash
./mvnw test
```

## Stopping the Application

Press `Ctrl+C` in the terminal where the application is running.

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running on port 5433
- Verify the database `myapp` exists
- Check credentials in `application.properties`

### Port Already in Use
If port 8080 is already in use, you can change it by adding this to `application.properties`:
```properties
server.port=8081
```

### Java Version Issues
Ensure you're using Java 21 or higher:
```bash
java -version
```