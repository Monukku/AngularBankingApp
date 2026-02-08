# Banking App - Development Guide

## Table of Contents
1. [Getting Started](#getting-started)
2. [Project Structure](#project-structure)
3. [Development Server](#development-server)
4. [Building](#building)
5. [Testing](#testing)
6. [Authentication](#authentication)
7. [API Configuration](#api-configuration)
8. [Environment Variables](#environment-variables)
9. [Error Handling](#error-handling)
10. [Logging](#logging)
11. [Contributing](#contributing)

## Getting Started

### Prerequisites
- Node.js 18.19.1 or higher
- npm 10.x or higher
- Angular CLI 18.x

### Installation

```bash
# Clone the repository
git clone <repository-url>

# Install dependencies
npm install

# Install Cypress for E2E testing (optional)
npm install cypress --save-dev
```

## Project Structure

```
banking-app/
├── src/
│   ├── app/
│   │   ├── accounts/              # Account management feature
│   │   ├── authentication/        # Auth guards and services
│   │   ├── cards/                # Card management feature
│   │   ├── core/                 # Core services and interceptors
│   │   │   ├── handlers/         # Global error handler
│   │   │   ├── interceptors/     # HTTP interceptors (auth, error, logging)
│   │   │   ├── models/           # Error models
│   │   │   └── services/         # Core services (logger, error handler)
│   │   ├── dashboard/            # Dashboard feature
│   │   ├── loans/                # Loan management feature
│   │   ├── shared/               # Shared components, pipes, directives
│   │   ├── store/                # NgRx store (actions, effects, reducers)
│   │   ├── transactions/         # Transaction management feature
│   │   ├── user-profile/         # User profile feature
│   │   ├── app.routes.ts         # Application routes
│   │   ├── app.config.ts         # Application configuration
│   │   └── app.component.ts      # Root component
│   ├── environments/             # Environment configurations
│   │   ├── environment.ts        # Default (development)
│   │   ├── environment.development.ts
│   │   ├── environment.staging.ts
│   │   ├── environment.production.ts
│   │   ├── environment.test.ts
│   │   └── keycloakConfig.ts
│   └── index.html
├── cypress/                      # E2E tests
│   ├── e2e/                     # Test specifications
│   │   ├── auth.cy.ts
│   │   ├── accounts.cy.ts
│   │   └── transactions.cy.ts
│   └── support/                 # Cypress support files
└── angular.json                # Angular configuration
```

## Development Server

```bash
# Start the development server
npm start

# Server will be available at http://localhost:4200
# API will connect to http://localhost:8811/rewabank
```

The application uses Angular's development server with hot module replacement (HMR) enabled.

## Building

```bash
# Build for production
npm run build

# Build output will be in dist/banking-app/

# Build for staging
ng build --configuration staging

# Build for development
ng build --configuration development
```

## Testing

### Unit Tests

```bash
# Run unit tests once
npm test -- --watch=false

# Run unit tests with coverage
npm test -- --watch=false --code-coverage

# Run tests in watch mode
npm test
```

Coverage reports are generated in `coverage/` directory.

### E2E Tests

```bash
# Open Cypress test runner
npm run e2e

# Run E2E tests headless
npm run e2e:headless

# Run specific test file
npm run e2e -- --spec cypress/e2e/auth.cy.ts
```

## Authentication

The application uses **Keycloak** for authentication.

### Keycloak Configuration

Configuration is in `src/environments/keycloakConfig.ts`:

```typescript
export const keycloakConfig = {
  url: 'http://localhost:7070/auth',
  realm: 'rewabank-realm',
  clientId: 'angular-client',
  credentials: {
    secret: 'your-client-secret'
  }
};
```

### Auth Service

The consolidated `AuthService` in `src/app/authentication/services/auth.service.ts` handles:
- Keycloak initialization
- User login/logout
- Token management
- Role-based access control

### Auth Guards

- **AuthGuard**: Protects routes that require authentication
- **NoAuthGuard**: Protects login/register routes (redirects if already authenticated)
- **RoleGuard**: Restricts routes by user role

## API Configuration

### Environment-Specific URLs

The application supports different API URLs per environment:

```typescript
// Development
apiUrl: 'http://localhost:8811/rewabank'

// Staging
apiUrl: 'https://staging-api.rewabank.com/rewabank'

// Production
apiUrl: 'https://api.rewabank.com/rewabank'
```

### Adding API Endpoints

Create service methods with input validation:

```typescript
export class YourService {
  constructor(private http: HttpClient, private logger: LoggerService) {}

  getData(id: string): Observable<any> {
    // Validate input
    if (!id || id.trim().length === 0) {
      this.logger.error('ID is required');
      return throwError(() => new Error('ID is required'));
    }

    return this.http.get(`${this.apiUrl}/endpoint/${id}`)
      .pipe(
        tap(() => this.logger.debug('Data fetched successfully')),
        catchError((error) => this.handleError(error))
      );
  }
}
```

## Environment Variables

### Configuration by Environment

Each environment has its own configuration file:

**Development (`environment.development.ts`)**
- Debug logging enabled
- Performance profiling enabled
- Mock data disabled
- 3 retry attempts

**Staging (`environment.staging.ts`)**
- Warning level logging
- No profiling
- Real API calls
- 2 retry attempts

**Production (`environment.production.ts`)**
- Error level logging only
- No profiling
- Real API calls
- 1 retry attempt

**Test (`environment.test.ts`)**
- Warning level logging
- Mock data enabled
- For unit testing

### Using Environment Variables

```typescript
import { environment } from '../environments/environment';

// Access configuration
const apiUrl = environment.apiUrl;
const isProduction = environment.production;
```

## Error Handling

### Global Error Handler

The application implements a global error handler that:
- Catches uncaught errors
- Logs errors with context
- Displays user-friendly error messages
- Sends errors to logging service (in production)

### Error Types

Custom error classes in `src/app/core/models/error.model.ts`:
- `HttpError`: HTTP request errors
- `ValidationError`: Form validation errors
- `AuthenticationError`: Auth-related errors
- `AuthorizationError`: Permission-related errors
- `ServerError`: Server errors (5xx)
- `NetworkError`: Network connectivity errors
- `TimeoutError`: Request timeout errors

### Error Interceptor

All HTTP errors are intercepted and handled by `ErrorInterceptor`:
- Adds retry logic for network errors
- Adds request timeout
- Converts HTTP errors to custom error types
- Logs all errors for debugging

### Handling Errors in Services

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  let errorMessage = 'An unknown error occurred!';

  switch (error.status) {
    case 400:
      errorMessage = 'Invalid request';
      break;
    case 404:
      errorMessage = 'Resource not found';
      break;
    case 500:
      errorMessage = 'Server error';
      break;
  }

  this.logger.error('Service error', { status: error.status, message: error.message });
  return throwError(() => new Error(errorMessage));
}
```

## Logging

### Logger Service

The `LoggerService` provides structured logging:

```typescript
import { LoggerService } from './core/services/logger.service';

export class MyComponent {
  constructor(private logger: LoggerService) {}

  doSomething() {
    this.logger.debug('Debug message', { data: 'details' });
    this.logger.info('Info message');
    this.logger.warn('Warning message');
    this.logger.error('Error message', error);
  }
}
```

### Logging Interceptor

Automatically logs all HTTP requests and responses with:
- Request method, URL, and headers
- Response status and timing
- Request/response bodies (with sensitive data redacted)
- Error details

### Log Levels

- **DEBUG**: Development mode, detailed information
- **INFO**: General information
- **WARN**: Warning messages (default in staging)
- **ERROR**: Error messages only (default in production)

Sensitive data (passwords, tokens, CVV, etc.) are automatically redacted from logs.

## State Management (NgRx)

The application uses NgRx for managing application state:

### Auth State

Located in `src/app/store/`:
- **Actions** (`actions/auth.actions.ts`): Login, logout, token refresh
- **Reducers** (`reducers/auth.reducer.ts`): Manages authentication state
- **Effects** (`effects/auth.effects.ts`): Handles side effects (API calls)

### Dispatching Actions

```typescript
import { Store } from '@ngrx/store';
import * as AuthActions from './store/actions/auth.actions';

export class MyComponent {
  constructor(private store: Store) {}

  login() {
    this.store.dispatch(AuthActions.login());
  }

  logout() {
    this.store.dispatch(AuthActions.logout());
  }
}
```

### Selecting from Store

```typescript
import { selectAuthState } from './store/selectors/auth.selectors';

export class MyComponent {
  auth$ = this.store.select(selectAuthState);

  constructor(private store: Store) {}
}
```

## Input Validation

All services implement input validation:

### Account Service
- Mobile number format (10 digits)
- Account name required
- Email validation

### Card Service
- Card number format (13-19 digits)
- Expiry date format (MM/YY)
- CVV format (3-4 digits)
- Cardholder name length (max 50 chars)

### Loan Service
- Principal amount > 0 and < 10,000,000
- Tenure between 1-360 months
- Interest rate 0-50%
- Valid loan types: home, auto, personal, education, business

### Transaction Service
- Source and destination accounts different
- Amount > 0
- Account number format validation

## API Error Codes

Common API error codes and handling:

| Code | Message | Handling |
|------|---------|----------|
| 400 | Bad Request | Show validation error |
| 401 | Unauthorized | Redirect to login |
| 403 | Forbidden | Show permission error |
| 404 | Not Found | Show "not found" error |
| 409 | Conflict | Show "already exists" error |
| 500 | Server Error | Show server error message |
| 503 | Service Unavailable | Show service unavailable message |

## Performance Optimization

### Change Detection
Components use `OnPush` strategy for better performance:
```typescript
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
```

### Lazy Loading
Feature modules are lazy-loaded:
- Accounts
- Cards
- Loans
- Transactions
- User Profile

### Caching
- Auth tokens are cached for configured duration
- HTTP responses can be cached per service

## Security Best Practices

1. **No hardcoded secrets** - All sensitive config in environment files
2. **CSRF protection** - Keycloak handles CSRF tokens
3. **XSS prevention** - Angular's sanitization, no innerHTML
4. **Secure headers** - Logged requests redact sensitive data
5. **Token refresh** - Tokens auto-refresh before expiry
6. **Role-based access** - Guards enforce authorization

## Debugging

### Browser DevTools

1. Open Chrome DevTools (F12)
2. Check Console for debug logs
3. Use Redux DevTools for NgRx state inspection
4. Check Network tab for API calls

### Logging in Development

All debug logs are visible in development mode:

```typescript
// In environment.development.ts
logLevel: 'debug'
```

## Contributing

### Code Style

- Use TypeScript strict mode
- Follow Angular style guide
- Use meaningful variable names
- Add JSDoc comments for public methods

### Commit Messages

```
feat: Add new feature
fix: Bug fix
refactor: Code refactoring
docs: Documentation
test: Add tests
```

### Pull Request Process

1. Create feature branch
2. Make changes with meaningful commits
3. Add tests for new functionality
4. Update documentation
5. Create pull request with description

## Troubleshooting

### Common Issues

**Dev server won't start**
```bash
# Clear node_modules and reinstall
rm -rf node_modules
npm install
npm start
```

**Tests failing**
```bash
# Clear Angular cache
ng cache clean

# Run tests with fresh cache
npm test
```

**Port already in use**
```bash
# Use different port
ng serve --port 4201
```

### Getting Help

- Check the console logs for error messages
- Review the LoggerService output
- Check network tab in DevTools
- Review component tests for expected behavior

## Additional Resources

- [Angular Documentation](https://angular.io/docs)
- [Keycloak Documentation](https://www.keycloak.org/docs)
- [NgRx Documentation](https://ngrx.io/docs)
- [RxJS Documentation](https://rxjs.dev)
- [Cypress Documentation](https://docs.cypress.io)

---

**Last Updated**: February 7, 2026
**Version**: 1.0.0
