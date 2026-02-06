# Quick Error Handling Reference

## 🚀 Quick Start

### 1. Import in Your Service
```typescript
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoggerService } from '../../core/services/logger.service';

constructor(
  private errorHandler: ErrorHandlerService,
  private notification: NotificationService,
  private logger: LoggerService
) {}
```

### 2. Use in Service Methods
```typescript
fetchData(): Observable<Data> {
  return this.http.get<Data>(url).pipe(
    tap(() => this.logger.info('Data fetched')),
    catchError((error) => {
      const appError = this.errorHandler.handleHttpError(error);
      this.notification.error(this.errorHandler.getUserMessage(appError));
      return throwError(() => appError);
    })
  );
}
```

### 3. Handle in Component
```typescript
this.service.fetchData().subscribe({
  next: (data) => this.data = data,
  error: (error) => {
    // Service already showed notification
    if (!this.errorHandler.isRecoverable(error)) {
      // Handle non-recoverable errors (auth, permission, not found)
    }
  }
});
```

---

## 📋 Error Type Mapping

| HTTP Status | Error Class | Severity |
|----------|----------|----------|
| 0 | NetworkError | High |
| 400 | ValidationError | Medium |
| 401 | AuthenticationError | High |
| 403 | AuthorizationError | High |
| 404 | NotFoundError | Medium |
| 408 | TimeoutError | Medium |
| 5xx | ServerError | High |

---

## 🎯 Common Patterns

### Pattern 1: Simple API Call
```typescript
getUsers(): Observable<User[]> {
  return this.http.get<User[]>(this.apiUrl).pipe(
    tap(() => this.logger.debug('Users fetched')),
    catchError(err => {
      const appErr = this.errorHandler.handleHttpError(err);
      this.notification.error(this.errorHandler.getUserMessage(appErr));
      return throwError(() => appErr);
    })
  );
}
```

### Pattern 2: With Retry Logic
```typescript
createUser(user: User): Observable<User> {
  return this.http.post<User>(this.apiUrl, user).pipe(
    tap(() => this.notification.success('User created')),
    retry(1),
    catchError(err => {
      const appErr = this.errorHandler.handleHttpError(err);
      this.notification.error(this.errorHandler.getUserMessage(appErr));
      return throwError(() => appErr);
    })
  );
}
```

### Pattern 3: With Loading State
```typescript
users$ = this.http.get<User[]>(this.apiUrl).pipe(
  tap(() => this.logger.info('Users loaded')),
  catchError(err => {
    const appErr = this.errorHandler.handleHttpError(err);
    this.notification.error(this.errorHandler.getUserMessage(appErr));
    return throwError(() => appErr);
  }),
  finalize(() => this.isLoading = false)
);
```

### Pattern 4: Form Submission
```typescript
submit(formData: any): void {
  // Validate form
  if (!this.form.valid) {
    const errors = this.getFormErrors();
    this.notification.error('Please fix validation errors');
    return;
  }

  this.service.submit(formData).subscribe({
    next: (result) => {
      this.notification.success('Submitted successfully');
      this.router.navigate(['/success']);
    },
    error: (error) => {
      // Error handling is in service
      if (error.code === 'VALIDATION_ERROR') {
        // Update form with server validation errors
      }
    }
  });
}
```

---

## 🔧 Notification Methods

```typescript
// Success
this.notification.success('Operation completed');

// Error
this.notification.error('Something went wrong');

// Warning
this.notification.warning('Are you sure?');

// Info
this.notification.info('Please note this');

// With Action
this.notification.showWithAction('Item deleted', 'Undo', 'warning')
  .onAction()
  .subscribe(() => this.restoreItem());

// Dismiss all
this.notification.dismissAll();
```

---

## 📊 Logger Methods

```typescript
// Debug (development only)
this.logger.debug('Debug info', { data: value });

// Info
this.logger.info('Information message', { context: data });

// Warning
this.logger.warn('Warning message', { issue: data });

// Error
this.logger.error('Error occurred', error);
```

---

## 🎁 Error Handler Methods

```typescript
// Handle HTTP errors
const error = this.errorHandler.handleHttpError(httpError);

// Handle client errors
const error = this.errorHandler.handleClientError(new Error());

// Get user message
const msg = this.errorHandler.getUserMessage(error);

// Check if recoverable
if (this.errorHandler.isRecoverable(error)) {
  // Can retry
}

// Get suggested action
const action = this.errorHandler.getSuggestedAction(error);

// Get error history
const history = this.errorHandler.getErrorHistory();

// Clear history
this.errorHandler.clearErrorHistory();
```

---

## ✨ Error Classes

```typescript
import {
  AppError,           // Base error
  HttpError,          // HTTP errors
  ValidationError,    // Validation errors
  AuthenticationError, // 401 errors
  AuthorizationError,  // 403 errors
  NotFoundError,      // 404 errors
  ServerError,        // 5xx errors
  NetworkError,       // Network errors
  TimeoutError,       // Timeout errors
} from 'src/app/core/models/error.model';

// Usage
const error = new ValidationError('Invalid input', {
  email: ['Invalid email format'],
  password: ['Too short']
});
```

---

## 🧪 Testing

```typescript
import { ErrorHandlerService } from '../core/services/error-handler.service';
import { HttpErrorResponse } from '@angular/common/http';

it('should handle 401 errors', () => {
  const error = new HttpErrorResponse({ status: 401 });
  const result = service.handleHttpError(error);
  
  expect(result.code).toBe('AUTH_ERROR');
  expect(result.statusCode).toBe(401);
});
```

---

## 📝 Checklist Before Commit

- [ ] Service has proper error handling
- [ ] Errors are logged using LoggerService
- [ ] User gets notification for errors
- [ ] Component handles errors appropriately
- [ ] Tests cover error scenarios
- [ ] No generic `catch()` without AppError conversion

---

## 🆘 Troubleshooting

**Q: Error not showing to user?**
A: Make sure you call `this.notification.error()` in your catchError

**Q: Interceptor not catching errors?**
A: Verify ErrorInterceptor is registered in app.config.ts

**Q: Getting circular dependency?**
A: Use `Injector.get()` instead of constructor injection in handlers

**Q: Tests failing?**
A: Mock MatSnackBar and Router in TestBed configuration

---

## 🚀 Next Level Features

Coming soon:
- Remote error tracking (Sentry integration)
- Error analytics dashboard
- Custom error recovery UI
- A/B testing based on errors
- Machine learning error patterns
