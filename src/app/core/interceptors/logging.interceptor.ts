import {
  HttpInterceptorFn,
  HttpRequest,
  HttpEvent,
  HttpResponse,
  HttpHeaders,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

/**
 * Configuration for the logging interceptor
 */
interface LoggingConfig {
  logRequestBody: boolean;
  logResponseBody: boolean;
  logOnlyErrors: boolean;
  sensitiveHeaders: string[];
  sensitiveFields: string[];
}

const defaultConfig: LoggingConfig = {
  logRequestBody: true,
  logResponseBody: false,
  logOnlyErrors: false,
  sensitiveHeaders: ['authorization', 'cookie', 'x-api-key', 'x-csrf-token'],
  sensitiveFields: [
    'password',
    'pin',
    'cvv',
    'cvc',
    'cardnumber',
    'token',
    'secret',
    'ssn',
    'taxid',
    'apikey',
  ],
};

/**
 * Functional HTTP Logging Interceptor
 * Logs all HTTP requests and responses for debugging and monitoring
 */
export const loggingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next
): Observable<HttpEvent<unknown>> => {
  const logger = inject(LoggerService);
  const config = defaultConfig;

  const startTime = Date.now();
  const requestId = generateRequestId();

  // Log request
  if (!config.logOnlyErrors) {
    logger.debug(`[${requestId}] HTTP ${req.method} Request`, {
      url: req.url,
      method: req.method,
      headers: sanitizeHeaders(req.headers, config.sensitiveHeaders),
    });

    if (config.logRequestBody && req.body) {
      logger.debug(`[${requestId}] Request Body`, {
        body: sanitizeBody(req.body, config.sensitiveFields),
      });
    }
  }

  return next(req).pipe(
    tap({
      next: (event) => {
        if (event instanceof HttpResponse) {
          const elapsedTime = Date.now() - startTime;

          if (!config.logOnlyErrors) {
            logger.debug(`[${requestId}] HTTP Response`, {
              status: event.status,
              statusText: event.statusText,
              elapsedTime: `${elapsedTime}ms`,
              url: event.url,
            });
          }

          // Log response body for errors or if configured
          if (event.status >= 400 || config.logResponseBody) {
            const logLevel = event.status >= 400 ? 'warn' : 'debug';
            logger[logLevel](`[${requestId}] Response Body`, {
              status: event.status,
              body: event.body,
            });
          }
        }
      },
      error: (error: HttpErrorResponse) => {
        const elapsedTime = Date.now() - startTime;
        logger.error(`[${requestId}] HTTP Error`, {
          status: error.status,
          statusText: error.statusText,
          elapsedTime: `${elapsedTime}ms`,
          url: error.url,
          message: error.message,
          error: error.error,
        });
      },
    })
  );
};

/**
 * Generate a unique request ID for tracking
 */
function generateRequestId(): string {
  return `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

/**
 * Remove sensitive information from headers before logging
 */
function sanitizeHeaders(
  headers: HttpHeaders,
  sensitiveHeaders: string[]
): Record<string, string> {
  const sanitized: Record<string, string> = {};

  headers.keys().forEach((key: string) => {
    if (sensitiveHeaders.some((h) => h.toLowerCase() === key.toLowerCase())) {
      sanitized[key] = '***REDACTED***';
    } else {
      sanitized[key] = headers.get(key) ?? '';
    }
  });

  return sanitized;
}

/**
 * Remove sensitive information from request/response body before logging
 * Handles nested objects and arrays recursively
 */
function sanitizeBody(body: unknown, sensitiveFields: string[]): unknown {
  if (body === null || body === undefined) {
    return body;
  }

  // Handle arrays
  if (Array.isArray(body)) {
    return body.map((item) => sanitizeBody(item, sensitiveFields));
  }

  // Handle objects
  if (typeof body === 'object') {
    const sanitized: Record<string, unknown> = {};

    Object.entries(body).forEach(([key, value]) => {
      if (sensitiveFields.some((field) => field.toLowerCase() === key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else if (typeof value === 'object' && value !== null) {
        // Recursively sanitize nested objects/arrays
        sanitized[key] = sanitizeBody(value, sensitiveFields);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  // Return primitives as-is
  return body;
}

/**
 * Factory function to create a configurable logging interceptor
 */
export function createLoggingInterceptor(
  config: Partial<LoggingConfig> = {}
): HttpInterceptorFn {
  const mergedConfig = { ...defaultConfig, ...config };

  return (req, next) => {
    const logger = inject(LoggerService);
    const startTime = Date.now();
    const requestId = generateRequestId();

    if (!mergedConfig.logOnlyErrors) {
      logger.debug(`[${requestId}] HTTP ${req.method} Request`, {
        url: req.url,
        method: req.method,
        headers: sanitizeHeaders(req.headers, mergedConfig.sensitiveHeaders),
      });

      if (mergedConfig.logRequestBody && req.body) {
        logger.debug(`[${requestId}] Request Body`, {
          body: sanitizeBody(req.body, mergedConfig.sensitiveFields),
        });
      }
    }

    return next(req).pipe(
      tap({
        next: (event) => {
          if (event instanceof HttpResponse) {
            const elapsedTime = Date.now() - startTime;

            if (!mergedConfig.logOnlyErrors) {
              logger.debug(`[${requestId}] HTTP Response`, {
                status: event.status,
                statusText: event.statusText,
                elapsedTime: `${elapsedTime}ms`,
                url: event.url,
              });
            }

            if (event.status >= 400 || mergedConfig.logResponseBody) {
              const logLevel = event.status >= 400 ? 'warn' : 'debug';
              logger[logLevel](`[${requestId}] Response Body`, {
                status: event.status,
                body: event.body,
              });
            }
          }
        },
        error: (error: HttpErrorResponse) => {
          const elapsedTime = Date.now() - startTime;
          logger.error(`[${requestId}] HTTP Error`, {
            status: error.status,
            statusText: error.statusText,
            elapsedTime: `${elapsedTime}ms`,
            url: error.url,
            message: error.message,
            error: error.error,
          });
        },
      })
    );
  };
}