// Custom error classes for different error types

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

/**
 * Error context for enhanced error tracking
 */
export interface ErrorContext {
  timestamp?: Date;
  userAction?: string;
  endpoint?: string;
  requestId?: string;
  userId?: string;
  [key: string]: any;
}

/**
 * Base application error class with enhanced context
 */
export class AppError extends Error {
  public severity: ErrorSeverity;
  public context: ErrorContext;
  public recoveryAction?: string;

  constructor(
    override message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode?: number,
    public originalError?: any,
    severity: ErrorSeverity = ErrorSeverity.MEDIUM,
    context: ErrorContext = {}
  ) {
    super(message);
    this.name = 'AppError';
    this.severity = severity;
    this.context = {
      timestamp: new Date(),
      ...context
    };
    Object.setPrototypeOf(this, AppError.prototype);
  }

  /**
   * Set recovery action for error handling UI
   */
  setRecoveryAction(action: string): this {
    this.recoveryAction = action;
    return this;
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(): boolean {
    return this.statusCode !== 500 && this.statusCode !== undefined;
  }
}

/**
 * HTTP/API error with detailed response information
 */
export class HttpError extends AppError {
  public retryCount: number = 0;

  constructor(
    message: string,
    override statusCode: number,
    code: string = 'HTTP_ERROR',
    originalError?: any,
    context: ErrorContext = {}
  ) {
    const severity = statusCode >= 500 ? ErrorSeverity.HIGH : ErrorSeverity.MEDIUM;
    super(message, code, statusCode, originalError, severity, context);
    this.name = 'HttpError';
    this.setRecoveryAction(statusCode === 429 ? 'retry' : 'reload');
    Object.setPrototypeOf(this, HttpError.prototype);
  }

  /**
   * Check if error is retryable (rate limit, timeout)
   */
  isRetryable(): boolean {
    return this.statusCode === 429 || this.statusCode === 503 || this.statusCode === 408;
  }
}

/**
 * Validation error with field-level information
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fieldErrors: Record<string, string[]> = {},
    code: string = 'VALIDATION_ERROR',
    context: ErrorContext = {}
  ) {
    super(message, code, 400, undefined, ErrorSeverity.LOW, context);
    this.name = 'ValidationError';
    this.setRecoveryAction('retry');
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  /**
   * Check if specific field has errors
   */
  hasFieldError(fieldName: string): boolean {
    return fieldName in this.fieldErrors && this.fieldErrors[fieldName].length > 0;
  }

  /**
   * Get error message for specific field
   */
  getFieldError(fieldName: string): string | undefined {
    return this.fieldErrors[fieldName]?.[0];
  }
}

/**
 * Authentication error (invalid credentials, expired session)
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTH_ERROR',
    context: ErrorContext = {}
  ) {
    super(message, code, 401, undefined, ErrorSeverity.HIGH, context);
    this.name = 'AuthenticationError';
    this.setRecoveryAction('redirect-login');
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error (insufficient permissions)
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access denied',
    code: string = 'AUTHZ_ERROR',
    public requiredRole?: string,
    context: ErrorContext = {}
  ) {
    super(message, code, 403, undefined, ErrorSeverity.HIGH, context);
    this.name = 'AuthorizationError';
    this.setRecoveryAction('show-message');
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error (resource does not exist)
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND',
    public resourceType?: string,
    context: ErrorContext = {}
  ) {
    super(message, code, 404, undefined, ErrorSeverity.LOW, context);
    this.name = 'NotFoundError';
    this.setRecoveryAction('navigate-home');
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Server error (5xx errors)
 */
export class ServerError extends AppError {
  constructor(
    message: string = 'Internal server error',
    code: string = 'SERVER_ERROR',
    statusCode: number = 500,
    context: ErrorContext = {}
  ) {
    super(message, code, statusCode, undefined, ErrorSeverity.CRITICAL, context);
    this.name = 'ServerError';
    this.setRecoveryAction('retry');
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Network error (connection issues, offline)
 */
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network connection failed',
    code: string = 'NETWORK_ERROR',
    context: ErrorContext = {}
  ) {
    super(message, code, undefined, undefined, ErrorSeverity.HIGH, context);
    this.name = 'NetworkError';
    this.setRecoveryAction('retry');
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Timeout error (request took too long)
 */
export class TimeoutError extends AppError {
  constructor(
    message: string = 'Request timeout',
    code: string = 'TIMEOUT',
    public timeoutMs?: number,
    context: ErrorContext = {}
  ) {
    super(message, code, 408, undefined, ErrorSeverity.MEDIUM, context);
    this.name = 'TimeoutError';
    this.setRecoveryAction('retry');
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}

/**
 * Type guards for error type checking
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError || (error && error.code !== undefined);
}

export function isHttpError(error: any): error is HttpError {
  return error instanceof HttpError;
}

export function isValidationError(error: any): error is ValidationError {
  return error instanceof ValidationError;
}

export function isAuthenticationError(error: any): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

export function isAuthorizationError(error: any): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

export function isNetworkError(error: any): error is NetworkError {
  return error instanceof NetworkError;
}

export function isTimeoutError(error: any): error is TimeoutError {
  return error instanceof TimeoutError;
}

/**
 * Utility function to create appropriate error from HTTP status code
 */
export function createHttpError(
  statusCode: number,
  message: string = 'HTTP Error',
  originalError?: any,
  context?: ErrorContext
): HttpError {
  return new HttpError(message, statusCode, `HTTP_${statusCode}`, originalError, context);
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(error: any): string {
  if (isAppError(error)) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return 'An unexpected error occurred';
}

/**
 * Convert any error to AppError
 */
export function normalizeError(error: any, userMessage?: string): AppError {
  if (isAppError(error)) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(
      userMessage || error.message,
      'UNHANDLED_ERROR',
      undefined,
      error
    );
  }

  return new AppError(
    userMessage || 'An unexpected error occurred',
    'UNKNOWN_ERROR'
  );
}
