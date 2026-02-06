// Custom error classes for different error types

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    public message: string,
    public code: string = 'UNKNOWN_ERROR',
    public statusCode?: number,
    public originalError?: any
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * HTTP/API error
 */
export class HttpError extends AppError {
  constructor(
    message: string,
    public statusCode: number,
    code: string = 'HTTP_ERROR',
    originalError?: any
  ) {
    super(message, code, statusCode, originalError);
    this.name = 'HttpError';
    Object.setPrototypeOf(this, HttpError.prototype);
  }
}

/**
 * Validation error
 */
export class ValidationError extends AppError {
  constructor(
    message: string,
    public fieldErrors: { [key: string]: string[] } = {},
    code: string = 'VALIDATION_ERROR'
  ) {
    super(message, code);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}

/**
 * Authentication error
 */
export class AuthenticationError extends AppError {
  constructor(
    message: string = 'Authentication failed',
    code: string = 'AUTH_ERROR'
  ) {
    super(message, code, 401);
    this.name = 'AuthenticationError';
    Object.setPrototypeOf(this, AuthenticationError.prototype);
  }
}

/**
 * Authorization error (forbidden)
 */
export class AuthorizationError extends AppError {
  constructor(
    message: string = 'Access denied',
    code: string = 'AUTHZ_ERROR'
  ) {
    super(message, code, 403);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }
}

/**
 * Not found error
 */
export class NotFoundError extends AppError {
  constructor(
    message: string = 'Resource not found',
    code: string = 'NOT_FOUND'
  ) {
    super(message, code, 404);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

/**
 * Server error
 */
export class ServerError extends AppError {
  constructor(
    message: string = 'Internal server error',
    code: string = 'SERVER_ERROR'
  ) {
    super(message, code, 500);
    this.name = 'ServerError';
    Object.setPrototypeOf(this, ServerError.prototype);
  }
}

/**
 * Network error
 */
export class NetworkError extends AppError {
  constructor(
    message: string = 'Network connection failed',
    code: string = 'NETWORK_ERROR'
  ) {
    super(message, code);
    this.name = 'NetworkError';
    Object.setPrototypeOf(this, NetworkError.prototype);
  }
}

/**
 * Timeout error
 */
export class TimeoutError extends AppError {
  constructor(
    message: string = 'Request timeout',
    code: string = 'TIMEOUT'
  ) {
    super(message, code);
    this.name = 'TimeoutError';
    Object.setPrototypeOf(this, TimeoutError.prototype);
  }
}
