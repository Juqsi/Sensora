# REST API mit Go und Fiber

This REST API was created with the Go web framework Fiber and serves as a template for developing RESTful web applications. The API includes basic functions for connecting to a database, adding middleware and managing HTTP requests. The project is divided into different folders to improve structure and maintainability.

## Middleware-Funktionalität

### Recovery Middleware
The Recovery middleware is a central component that protects the API from crashes. It catches panic cases and ensures that the application does not crash. In the event of a panic, the middleware returns an error and logs the stack trace of the panic.
### Logging Middleware
The Logging middleware is used to log all incoming requests and their response times. It provides information about the time of the request, the status code of the response, the HTTP method, the path, and any query parameters. The log file is saved in `Logfile.log`.
### Authentifizierungs-Middleware
The Authentication middleware is responsible for ensuring API security. It checks the user's authentication by expecting the JWT token in the `Authorization` header. It verifies that the token is in the Bearer token format and validates the token to ensure that the user is authenticated. In case of faulty authentication, an error message is returned; otherwise, the token is stored in the context.
## Projektstruktur
### Ordnerstruktur
- `main`: Contains the main application and the entry point (`main.go`).
- `main/api`: Includes the API-specific files and routes.
- `main/api/middleware`: Contains middleware functions such as logging, recovery, and authentication.
- `main/api/routes`: Defines the API routes and their handlers.
- `main/database`: Includes database initialization and connection.
- `main/utils`: Contains helper functions such as retrieving environment variables.

### Datenbank
The database connection (MariaDB) is initialized in `main/database/init.go`. The configuration is done via environment variables.
### Middleware

## Anpassung
You can customize and extend this template according to your requirements. Add more endpoints, change the middleware, or integrate additional functions into the API.

---

## API-Endpunkte
The API includes various endpoints, including:

- `/monitor`: An endpoint for monitoring and checking the status of the API.