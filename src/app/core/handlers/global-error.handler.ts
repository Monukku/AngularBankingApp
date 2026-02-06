import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { ErrorHandlerService } from '../services/error-handler.service';
import { NotificationService } from '../services/notification.service';
import { LoggerService } from '../services/logger.service';
import { AppError } from '../models/error.model';

/**
 * Global error handler for uncaught errors
 * This handles errors that are not caught by components or services
 */
@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  private errorHandlerService: ErrorHandlerService;
  private notificationService: NotificationService;
  private loggerService: LoggerService;

  constructor(private injector: Injector) {
    // Use injector to avoid circular dependencies
    this.errorHandlerService = this.injector.get(ErrorHandlerService);
    this.notificationService = this.injector.get(NotificationService);
    this.loggerService = this.injector.get(LoggerService);
  }

  handleError(error: Error | any): void {
    // Handle the error
    let appError: AppError;

    if (error instanceof AppError) {
      appError = error;
    } else {
      appError = this.errorHandlerService.handleClientError(error);
    }

    // Get user-friendly message
    const userMessage = this.errorHandlerService.getUserMessage(appError);

    // Show notification to user
    this.notificationService.error(userMessage);

    // Log for debugging
    this.loggerService.error(`Global error caught: ${appError.message}`, error);

    // You could also send to a remote logging service here
    // this.sendToRemoteLogger(appError);
  }

  /**
   * Send error to remote logging service
   * This can be implemented when you have a logging backend
   */
  private sendToRemoteLogger(error: AppError): void {
    // TODO: Implement sending to services like Sentry, Rollbar, etc.
  }
}
