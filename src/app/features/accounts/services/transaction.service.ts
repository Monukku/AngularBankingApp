import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';
import { catchError, tap } from 'rxjs/operators';
import { isHttpError } from '../../../core/models/error.model';

/**
 * Transaction Service - Manages financial transactions with input validation
 * Handles transaction history and fund transfers
 */
@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private apiUrl = environment.api.baseUrl;
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  /**
   * Get transaction history with validation
   */
  getTransactionHistory(): Observable<any[]> {
    this.logger.debug('Fetching transaction history');

    return this.http.get<any[]>(`${this.apiUrl}/transactions/history`)
      .pipe(
        tap(() => {
          this.logger.debug('Transaction history fetched successfully');
        }),
        catchError((error) => this.handleError(error, 'Failed to fetch transaction history'))
      );
  }

  /**
   * Transfer funds between accounts with validation
   */
  transferFunds(fromAccount: string, toAccount: string, amount: number): Observable<any> {
    // Validate inputs
    if (!fromAccount || fromAccount.trim().length === 0) {
      this.logger.error('Source account is required');
      return throwError(() => new Error('Source account is required'));
    }

    if (!toAccount || toAccount.trim().length === 0) {
      this.logger.error('Destination account is required');
      return throwError(() => new Error('Destination account is required'));
    }

    if (!amount || amount <= 0) {
      this.logger.error('Invalid amount for transfer');
      return throwError(() => new Error('Amount must be greater than zero'));
    }

    // Validate amount is a number
    if (typeof amount !== 'number' || isNaN(amount)) {
      this.logger.error('Invalid amount format');
      return throwError(() => new Error('Amount must be a valid number'));
    }

    // Validate accounts are different
    if (fromAccount.trim() === toAccount.trim()) {
      this.logger.error('Source and destination accounts cannot be the same');
      return throwError(
        () => new Error('Source and destination accounts must be different')
      );
    }

    // Validate account number format
    if (!/^[a-zA-Z0-9]{8,20}$/.test(fromAccount.trim())) {
      this.logger.error('Invalid source account format', { fromAccount });
      return throwError(() => new Error('Invalid source account format'));
    }

    if (!/^[a-zA-Z0-9]{8,20}$/.test(toAccount.trim())) {
      this.logger.error('Invalid destination account format', { toAccount });
      return throwError(() => new Error('Invalid destination account format'));
    }

    const transferDetails = { fromAccount: fromAccount.trim(), toAccount: toAccount.trim(), amount };
    this.logger.debug('Initiating fund transfer', {
      fromAccount,
      amount,
    });

    return this.http.post(`${this.apiUrl}/transactions/transfer`, transferDetails)
      .pipe(
        tap((response) => {
          this.logger.debug('Fund transfer completed successfully', {
            fromAccount,
            amount,
          });
        }),
        catchError((error) => this.handleError(error, 'Fund transfer failed'))
      );
  }

  /**
   * Handle errors with type validation and detailed logging
   */
  private handleError(error: any, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;

    // Type guard: Check if it's an HttpErrorResponse with status property
    if (error instanceof HttpErrorResponse || (error && typeof error.status === 'number')) {
      const status = error.status;

      switch (status) {
        case 0:
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 400:
          errorMessage = 'Invalid transfer details. Please check and try again.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this transfer.';
          break;
        case 404:
          errorMessage = 'One or both accounts not found.';
          break;
        case 409:
          errorMessage = 'Insufficient funds. Please check your balance.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        default:
          errorMessage = defaultMessage;
      }

      this.logger.error('Transaction service HTTP error', {
        status,
        message: error.message,
        error: error.error,
      });
    } else if (error instanceof Error) {
      // Standard Error object
      errorMessage = error.message || defaultMessage;
      this.logger.error('Transaction service error', { message: error.message });
    } else {
      // Unknown error type
      this.logger.error('Transaction service unknown error', { error });
    }

    return throwError(() => new Error(errorMessage));
  }
}
