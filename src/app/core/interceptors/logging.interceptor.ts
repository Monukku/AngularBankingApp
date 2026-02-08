import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpResponse,
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LoggerService } from '../services/logger.service';

/**
 * Logging Interceptor - Logs all HTTP requests and responses
 * Helps with debugging and monitoring API calls
 */
@Injectable()
export class LoggingInterceptor implements HttpInterceptor {
  constructor(private logger: LoggerService) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    const startTime = Date.now();
    const requestId = this.generateRequestId();

    this.logger.debug(`[${requestId}] HTTP ${req.method} Request`, {
      url: req.url,
      method: req.method,
      headers: this.sanitizeHeaders(req.headers),
    });

    if (req.body) {
      this.logger.debug(`[${requestId}] Request Body`, {
        body: this.sanitizeBody(req.body),
      });
    }

    return next.handle(req).pipe(
      tap(
        (event) => {
          if (event instanceof HttpResponse) {
            const elapsedTime = Date.now() - startTime;
            this.logger.debug(`[${requestId}] HTTP Response`, {
              status: event.status,
              statusText: event.statusText,
              elapsedTime: `${elapsedTime}ms`,
              url: event.url,
            });

            // Log response body for non-2xx status codes
            if (event.status >= 400) {
              this.logger.warn(`[${requestId}] Response Body`, {
                body: event.body,
              });
            }
          }
        },
        (error) => {
          const elapsedTime = Date.now() - startTime;
          this.logger.error(`[${requestId}] HTTP Error`, {
            status: error.status,
            statusText: error.statusText,
            elapsedTime: `${elapsedTime}ms`,
            message: error.message,
          });
        }
      )
    );
  }

  /**
   * Generate a unique request ID for tracking
   */
  private generateRequestId(): string {
    return `REQ-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Remove sensitive information from headers before logging
   */
  private sanitizeHeaders(headers: any): any {
    const sensitiveHeaders = ['authorization', 'cookie', 'x-api-key'];
    const sanitized: any = {};

    headers.keys().forEach((key: string) => {
      if (sensitiveHeaders.includes(key.toLowerCase())) {
        sanitized[key] = '***REDACTED***';
      } else {
        sanitized[key] = headers.get(key);
      }
    });

    return sanitized;
  }

  /**
   * Remove sensitive information from request body before logging
   */
  private sanitizeBody(body: any): any {
    if (!body || typeof body !== 'object') {
      return body;
    }

    const sensitiveFields = [
      'password',
      'pin',
      'cvv',
      'cvc',
      'cardNumber',
      'token',
      'secret',
    ];

    const sanitized = { ...body };

    sensitiveFields.forEach((field) => {
      if (field.toLowerCase() in sanitized) {
        const key = Object.keys(sanitized).find(
          (k) => k.toLowerCase() === field.toLowerCase()
        );
        if (key) {
          sanitized[key] = '***REDACTED***';
        }
      }
    });

    return sanitized;
  }
}
