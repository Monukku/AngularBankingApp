import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError, TimeoutError as RxTimeoutError } from 'rxjs';
import { catchError, retry, timeout } from 'rxjs/operators';
import { ErrorHandlerService } from '../services/error-handler.service';
import { LoggerService } from '../services/logger.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private readonly REQUEST_TIMEOUT = 30000; // 30 seconds
  private readonly MAX_RETRIES = 1; // Retry once on failure

  constructor(
    private errorHandlerService: ErrorHandlerService,
    private loggerService: LoggerService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    this.loggerService.debug(`HTTP ${req.method} request`, req.url);

    return next.handle(req).pipe(
      // Retry on network errors (but not on 4xx, 5xx)
      retry({
        count: this.MAX_RETRIES,
        delay: (error) => {
          // Only retry on network errors and 5xx errors
          if (
            error instanceof HttpErrorResponse &&
            error.status >= 400 &&
            error.status < 500
          ) {
            throw error; // Don't retry on client errors
          }
          return throwError(() => error);
        },
      }),
      // Add timeout to requests
      timeout(this.REQUEST_TIMEOUT),
      // Catch any errors
      catchError((error) => {
        return this.handleError(error);
      })
    );
  }

  private handleError(error: any): Observable<never> {
    let appError;

    if (error instanceof HttpErrorResponse) {
      // HTTP error from server
      appError = this.errorHandlerService.handleHttpError(error);
    } else if (error instanceof RxTimeoutError) {
      // Request timeout
      appError = this.errorHandlerService.handleClientError(
        new Error('Request timeout')
      );
    } else if (error.name === 'TimeoutError') {
      // Request timeout (fallback)
      appError = this.errorHandlerService.handleClientError(
        new Error('Request timeout')
      );
    } else {
      // Unknown error
      appError = this.errorHandlerService.handleClientError(error);
    }

    // Return error for component to handle
    return throwError(() => appError);
  }
}
