import { Injectable, Injector, inject } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LoggerService } from './logger.service';
import {
  AppError,
  HttpError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ServerError,
  NetworkError,
  TimeoutError,
} from '../models/error.model';

export interface ErrorNotification {
  title: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
  code: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  private injector = inject(Injector);
  private logger: LoggerService;
  private router: Router;
  private errorHistory: ErrorNotification[] = [];
  private maxErrorHistory = 50;

  constructor() {
    // Delayed injection to avoid circular dependencies
    this.logger = this.injector.get(LoggerService);
    this.router = this.injector.get(Router);
  }

  /**
   * Handle HTTP errors and convert to appropriate error types
   */
  handleHttpError(error: HttpErrorResponse): AppError {
    let appError: AppError;

    switch (error.status) {
      case 0:
        // Network error
        appError = new NetworkError('Network connection failed. Please check your internet connection.');
        break;
      case 400:
        // Bad request - likely validation error
        appError = this.handleValidationError(error);
        break;
      case 401:
        // Unauthorized
        appError = new AuthenticationError('Your session has expired. Please login again.');
        this.router.navigate(['/auth/login']);
        break;
      case 403:
        // Forbidden
        appError = new AuthorizationError('You do not have permission to access this resource.');
        break;
      case 404:
        // Not found
        appError = new NotFoundError(`The requested resource was not found (${error.url}).`);
        break;
      case 408:
        // Timeout
        appError = new TimeoutError('The request took too long. Please try again.');
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        // Server error
        appError = new ServerError(`Server error: ${error.status}. Please try again later.`);
        break;
      default:
        // Unknown error
        appError = new HttpError(
          error.message || 'An error occurred',
          error.status,
          `HTTP_${error.status}`
        );
    }

    appError.originalError = error;
    this.logError(appError);
    return appError;
  }

  /**
   * Handle validation errors from API responses
   */
  private handleValidationError(error: HttpErrorResponse): ValidationError {
    let fieldErrors: { [key: string]: string[] } = {};
    let message = 'Validation failed. Please check your input.';

    // Check if error response contains field-level validation errors
    if (error.error && typeof error.error === 'object') {
      if (error.error.errors) {
        fieldErrors = error.error.errors;
        const firstError = Object.values(fieldErrors)[0];
        if (Array.isArray(firstError) && firstError.length > 0) {
          message = firstError[0];
        }
      } else if (error.error.message) {
        message = error.error.message;
      }
    }

    return new ValidationError(message, fieldErrors);
  }

  /**
   * Handle client-side errors
   */
  handleClientError(error: Error | AppError): AppError {
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = new AppError(
        error.message || 'An unexpected error occurred',
        'CLIENT_ERROR'
      );
      appError.originalError = error;
    }

    this.logError(appError);
    return appError;
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(error: AppError): void {
    this.logger.error(
      `${error.name}: ${error.message} (Code: ${error.code})`,
      error
    );

    // Add to error history
    this.addToErrorHistory({
      title: error.name,
      message: error.message,
      severity: 'error',
      code: error.code,
      timestamp: new Date(),
    });
  }

  /**
   * Add error to history for debugging
   */
  private addToErrorHistory(notification: ErrorNotification): void {
    this.errorHistory.push(notification);
    if (this.errorHistory.length > this.maxErrorHistory) {
      this.errorHistory.shift();
    }
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): ErrorNotification[] {
    return [...this.errorHistory];
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = [];
  }

  /**
   * Convert error to user-friendly message
   */
  getUserMessage(error: AppError): string {
    switch (error.code) {
      case 'AUTH_ERROR':
        return 'Please log in to continue.';
      case 'AUTHZ_ERROR':
        return 'You do not have permission to perform this action.';
      case 'NOT_FOUND':
        return 'The resource you are looking for does not exist.';
      case 'SERVER_ERROR':
        return 'Something went wrong on the server. Please try again later.';
      case 'NETWORK_ERROR':
        return 'Network connection error. Please check your internet connection.';
      case 'TIMEOUT':
        return 'The request took too long. Please try again.';
      case 'VALIDATION_ERROR':
        return error.message || 'Please check your input and try again.';
      default:
        return error.message || 'An unexpected error occurred. Please try again.';
    }
  }

  /**
   * Check if error is recoverable
   */
  isRecoverable(error: AppError): boolean {
    return ![
      'AUTH_ERROR',
      'AUTHZ_ERROR',
      'NOT_FOUND',
    ].includes(error.code);
  }

  /**
   * Get suggested action for error
   */
  getSuggestedAction(error: AppError): string {
    switch (error.code) {
      case 'AUTH_ERROR':
        return 'Please log in again.';
      case 'NETWORK_ERROR':
        return 'Check your internet connection and try again.';
      case 'TIMEOUT':
        return 'Please retry the operation.';
      case 'SERVER_ERROR':
        return 'Please try again in a few moments.';
      default:
        return 'Please try again.';
    }
  }
}
