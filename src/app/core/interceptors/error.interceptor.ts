
import {
  HttpInterceptorFn,
  HttpRequest,

  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, throwError, timer, TimeoutError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';
import { LoggerService } from '../services/logger.service';

/**
 * Configuration for error handling interceptor
 */
interface ErrorInterceptorConfig {
  requestTimeout: number;
  maxRetries: number;
  retryDelay: number;
  retryableStatusCodes: number[];
}

const defaultConfig: ErrorInterceptorConfig = {
  requestTimeout: 30000, // 30 seconds
  maxRetries: 1,
  retryDelay: 1000, // 1 second between retries
  retryableStatusCodes: [500, 502, 503, 504], // Only retry server errors
};

/**
 * Functional Error Interceptor
 * Handles HTTP errors, timeouts, and retry logic
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next
): Observable<HttpEvent<unknown>> => {
  const errorHandlerService = inject(ErrorHandlerService);
  const loggerService = inject(LoggerService);
  const config = defaultConfig;

  loggerService.debug(`HTTP ${req.method} request`, req.url);

  return next(req).pipe(
    // Add timeout to prevent hanging requests
    timeout(config.requestTimeout),

    // Retry logic for transient failures
    retry({
      count: config.maxRetries,
      delay: (error, retryCount) => {
        // Only retry on network errors or specific server errors
        if (shouldRetry(error, config.retryableStatusCodes)) {
          const delayTime = config.retryDelay * retryCount;
          loggerService.warn(
            `Retrying request (${retryCount}/${config.maxRetries})`,
            {
              url: req.url,
              delay: `${delayTime}ms`,
            }
          );
          return timer(delayTime);
        }
        // Don't retry, throw the error
        return throwError(() => error);
      },
    }),

    // Global error handler
    catchError((error: unknown) => handleError(error, errorHandlerService))
  );
};

/**
 * Determine if a request should be retried based on the error
 */
function shouldRetry(error: unknown, retryableStatusCodes: number[]): boolean {
  // Retry on network errors (status 0)
  if (error instanceof HttpErrorResponse && error.status === 0) {
    return true;
  }

  // Retry on specific server errors
  if (
    error instanceof HttpErrorResponse &&
    retryableStatusCodes.includes(error.status)
  ) {
    return true;
  }

  // Don't retry on client errors (4xx) or other errors
  return false;
}

/**
 * Handle different types of errors
 */
function handleError(
  error: unknown,
  errorHandlerService: ErrorHandlerService
): Observable<never> {
  let appError;

  if (error instanceof HttpErrorResponse) {
    // HTTP error from server
    appError = errorHandlerService.handleHttpError(error);
  } else if (error instanceof TimeoutError) {
    // Request timeout
    appError = errorHandlerService.handleClientError(
      new Error('Request timeout - The server took too long to respond')
    );
  } else if (error instanceof Error) {
    // Known error type
    appError = errorHandlerService.handleClientError(error);
  } else {
    // Unknown error type
    appError = errorHandlerService.handleClientError(
      new Error(`Unknown error: ${String(error)}`)
    );
  }

  // Return error for component to handle
  return throwError(() => appError);
}

