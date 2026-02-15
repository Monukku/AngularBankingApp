import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';
import { Loan, LoanDetails, ApplyLoanRequest, LoanListResponse } from '../models/loan.model';
import { isHttpError } from '../../../core/models/error.model';

/**
 * Loan Service - Manages loan operations with input validation
 * Handles loan retrieval, creation, updating, and deletion
 */
@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.api.baseUrl}/loans`;
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  /**
   * Get all loans for the user
   */
  getLoans(): Observable<LoanListResponse> {
    this.logger.debug('Fetching all loans');

    return this.http.get<LoanListResponse>(this.apiUrl)
      .pipe(
        tap(() => {
          this.logger.debug('Loans fetched successfully');
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Get a specific loan by ID with validation
   */
  getLoan(id: string): Observable<LoanDetails> {
    // Validate loan ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Loan ID is required');
      return throwError(() => new Error('Loan ID is required'));
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(id.trim())) {
      this.logger.error('Invalid loan ID format', { id });
      return throwError(() => new Error('Invalid loan ID format'));
    }

    this.logger.debug('Fetching loan', { id });

    return this.http.get<LoanDetails>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.logger.debug('Loan fetched successfully', { id });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Create a new loan with validation
   */
  createLoan(loan: ApplyLoanRequest): Observable<LoanDetails> {
    // Validate loan object
    if (!loan) {
      this.logger.error('Loan data is required');
      return throwError(() => new Error('Loan data is required'));
    }

    // Validate required fields
    if (!loan.loanType || loan.loanType.trim().length === 0) {
      this.logger.error('Loan type is required');
      return throwError(() => new Error('Loan type is required'));
    }

    if (loan.requestedAmount === undefined || loan.requestedAmount === null) {
      this.logger.error('Loan amount is required');
      return throwError(() => new Error('Loan amount is required'));
    }

    if (loan.tenureMonths === undefined || loan.tenureMonths === null) {
      this.logger.error('Loan tenure is required');
      return throwError(() => new Error('Loan tenure (in months) is required'));
    }

    // Validate principal amount
    if (typeof loan.requestedAmount !== 'number' || loan.requestedAmount <= 0) {
      this.logger.error('Invalid loan amount', { requestedAmount: loan.requestedAmount });
      return throwError(() => new Error('Loan amount must be greater than zero'));
    }

    if (loan.requestedAmount > 10000000) {
      this.logger.error('Loan amount exceeds maximum limit');
      return throwError(() => new Error('Loan amount cannot exceed 10,000,000'));
    }

    // Validate tenure (in months)
    if (!Number.isInteger(loan.tenureMonths) || loan.tenureMonths < 1 || loan.tenureMonths > 360) {
      this.logger.error('Invalid tenure', { tenureMonths: loan.tenureMonths });
      return throwError(() => new Error('Loan tenure must be between 1 and 360 months'));
    }

    // Validate loan type
    const validLoanTypes = ['PERSONAL', 'HOME', 'AUTO', 'EDUCATION', 'BUSINESS', 'GOLD'];
    if (!validLoanTypes.includes(loan.loanType.toUpperCase())) {
      this.logger.error('Invalid loan type', { loanType: loan.loanType });
      return throwError(() => new Error(`Loan type must be one of: ${validLoanTypes.join(', ')}`));
    }

    this.logger.debug('Creating new loan', {
      loanType: loan.loanType,
      requestedAmount: loan.requestedAmount,
      tenureMonths: loan.tenureMonths,
    });

    return this.http.post<LoanDetails>(this.apiUrl, loan)
      .pipe(
        tap((response) => {
          this.logger.debug('Loan created successfully', { loanId: response.loanId });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Update a loan with validation
   */
  updateLoan(id: string, loan: Partial<LoanDetails>): Observable<LoanDetails> {
    // Validate loan ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Loan ID is required for update');
      return throwError(() => new Error('Loan ID is required'));
    }

    if (!loan) {
      this.logger.error('Loan data is required for update');
      return throwError(() => new Error('Loan data is required'));
    }

    // Validate loan amount if provided
    if (loan.disbursedAmount !== undefined && loan.disbursedAmount !== null) {
      if (typeof loan.disbursedAmount !== 'number' || loan.disbursedAmount <= 0) {
        this.logger.error('Invalid loan amount', { disbursedAmount: loan.disbursedAmount });
        return throwError(() => new Error('Loan amount must be greater than zero'));
      }
    }

    // Validate tenure if provided
    if (loan.tenureMonths !== undefined && loan.tenureMonths !== null) {
      if (!Number.isInteger(loan.tenureMonths) || loan.tenureMonths < 1 || loan.tenureMonths > 360) {
        this.logger.error('Invalid tenure', { tenureMonths: loan.tenureMonths });
        return throwError(() => new Error('Tenure must be between 1 and 360 months'));
      }
    }

    this.logger.debug('Updating loan', { id });

    return this.http.put<LoanDetails>(`${this.apiUrl}/${id}`, loan)
      .pipe(
        tap(() => {
          this.logger.debug('Loan updated successfully', { id });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Delete a loan with validation
   */
  deleteLoan(id: string): Observable<void> {
    // Validate loan ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Loan ID is required for deletion');
      return throwError(() => new Error('Loan ID is required'));
    }

    this.logger.debug('Deleting loan', { id });

    return this.http.delete<void>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.logger.debug('Loan deleted successfully', { id });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Handle HTTP errors with detailed logging and type validation
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred!';

    // Type guard: Check if it's an HttpErrorResponse with status property
    if (error instanceof HttpErrorResponse || (error && typeof error.status === 'number')) {
      const status = error.status;
      
      switch (status) {
        case 0:
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        case 400:
          errorMessage = 'Invalid request. Please check the loan data.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Loan not found.';
          break;
        case 409:
          errorMessage = 'Loan already exists.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 503:
          errorMessage = 'Service unavailable. Please try again later.';
          break;
        default:
          errorMessage = `Error ${status}: ${error.message || 'Unknown error'}`;
      }

      this.logger.error('Loan service HTTP error', {
        status,
        message: error.message,
        error: error.error,
      });
    } else if (error instanceof Error) {
      // Standard Error object
      errorMessage = error.message;
      this.logger.error('Loan service error', { message: error.message });
    } else {
      // Unknown error type
      this.logger.error('Loan service unknown error', { error });
    }

    return throwError(() => new Error(errorMessage));
  }
}
