import { Observable, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ErrorHandlerService } from '../services/error-handler.service';

/**
 * Error handling helper for services
 * Use this in your service's catchError operator
 */
export class ErrorHandlerHelper {
  /**
   * Create a catchError handler for Observable operations
   * Usage: .pipe(catchError(ErrorHandlerHelper.handleError(errorHandlerService)))
   */
  static handleError(errorHandlerService: ErrorHandlerService) {
    return (error: any) => {
      let appError;

      if (error instanceof HttpErrorResponse) {
        appError = errorHandlerService.handleHttpError(error);
      } else {
        appError = errorHandlerService.handleClientError(error);
      }

      return throwError(() => appError);
    };
  }

  /**
   * Create a catchError handler that logs and rethrows
   */
  static logAndRethrow(errorHandlerService: ErrorHandlerService) {
    return (error: any) => {
      return ErrorHandlerHelper.handleError(errorHandlerService)(error);
    };
  }
}
