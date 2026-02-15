import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { Account } from '../models/account.model';
import { AuthService } from '../../../core/services/auth.service';
import { AccountDetails } from '../models/accounts-details.model';
import { LoggerService } from '../../../core/services/logger.service';

/**
 * Account Service - Manages account operations with input validation
 * Handles account creation, fetching, updating, and deletion
 */
@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = environment.api.baseUrl;
  private http = inject(HttpClient);
  private authService = inject(AuthService);
  private logger = inject(LoggerService);

  /**
   * Create a new account with validation
   */
  createAccount(
    accountData: AccountDetails,
    accountType: string
  ): Observable<Account> {
    // Validate input parameters
    if (!accountData) {
      this.logger.error('Account data is required');
      return throwError(
        () => new Error('Account data is required for account creation')
      );
    }

    if (!accountType || accountType.trim().length === 0) {
      this.logger.error('Account type is required');
      return throwError(() => new Error('Account type is required'));
    }

    // Validate account data
    if (!accountData.name || accountData.name.trim().length === 0) {
      this.logger.error('Account name is required');
      return throwError(() => new Error('Account name is required'));
    }

    this.logger.debug('Creating account', { accountType });

    return this.http
      .post<Account>(
        `${this.apiUrl}/accounts/api/create/${accountType}`,
        accountData
      )
      .pipe(
        tap(() => {
          this.logger.debug('Account created successfully', {
            name: accountData.name,
          });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Fetch account details with validation
   */
  fetchAccountDetails(mobileNumber: string): Observable<AccountDetails> {
    // Validate input
    if (!mobileNumber || mobileNumber.trim().length === 0) {
      this.logger.error('Mobile number is required');
      return throwError(() => new Error('Mobile number is required'));
    }

    // Validate mobile number format (basic validation)
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      this.logger.error('Invalid mobile number format', { mobileNumber });
      return throwError(
        () =>
          new Error(
            'Invalid mobile number format. Please provide a 10-digit number.'
          )
      );
    }

    this.logger.debug('Fetching account details', { mobileNumber });

    return this.http
      .get<AccountDetails>(
        `${this.apiUrl}/accounts/api/fetch?mobileNumber=${mobileNumber}`
      )
      .pipe(
        tap(() => {
          this.logger.debug('Account fetched successfully', { mobileNumber });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Update account with validation
   */
  updateAccount(
    mobileNumber: string,
    updatedData: AccountDetails
  ): Observable<any> {
    // Validate inputs
    if (!mobileNumber || mobileNumber.trim().length === 0) {
      this.logger.error('Mobile number is required for update');
      return throwError(() => new Error('Mobile number is required'));
    }

    if (!updatedData) {
      this.logger.error('Updated data is required');
      return throwError(() => new Error('Updated data is required'));
    }

    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      this.logger.error('Invalid mobile number format', { mobileNumber });
      return throwError(() => new Error('Invalid mobile number format'));
    }

    this.logger.debug('Updating account', { mobileNumber });

    return this.http
      .put(`${this.apiUrl}/accounts/api/updateAccount?mobileNumber=${mobileNumber}`, updatedData)
      .pipe(
        tap(() => {
          this.logger.debug('Account updated successfully', { mobileNumber });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Delete account with validation
   */
  deleteAccount(mobileNumber: string): Observable<any> {
    // Validate input
    if (!mobileNumber || mobileNumber.trim().length === 0) {
      this.logger.error('Mobile number is required for deletion');
      return throwError(() => new Error('Mobile number is required'));
    }

    // Validate mobile number format
    if (!/^\d{10}$/.test(mobileNumber.trim())) {
      this.logger.error('Invalid mobile number format', { mobileNumber });
      return throwError(() => new Error('Invalid mobile number format'));
    }

    this.logger.debug('Deleting account', { mobileNumber });

    return this.http
      .delete(`${this.apiUrl}/accounts/api/delete?mobileNumber=${mobileNumber}`)
      .pipe(
        tap(() => {
          this.logger.debug('Account deleted successfully', { mobileNumber });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Handle HTTP errors with detailed logging
   */
  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    switch (error.status) {
      case 0:
        errorMessage = 'Network error. Please check your internet connection.';
        break;
      case 400:
        errorMessage =
          'Invalid request. Please check the data and try again.';
        break;
      case 401:
        errorMessage = 'Unauthorized. Please log in again.';
        break;
      case 403:
        errorMessage = 'You do not have permission to perform this action.';
        break;
      case 404:
        errorMessage = 'The requested account was not found.';
        break;
      case 409:
        errorMessage = 'Account already exists.';
        break;
      case 500:
        errorMessage = 'Server error. Please try again later.';
        break;
      case 503:
        errorMessage = 'Service unavailable. Please try again later.';
        break;
      default:
        errorMessage = `Error ${error.status}: ${error.message}`;
    }

    this.logger.error('Account service error', {
      status: error.status,
      message: error.message,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }
}
