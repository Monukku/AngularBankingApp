import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';

/**
 * Loan Service - Manages loan operations with input validation
 * Handles loan retrieval, creation, updating, and deletion
 */
@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.api.baseUrl}/loans`;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) { }

  /**
   * Get all loans for the user
   */
  getLoans(): Observable<any[]> {
    this.logger.debug('Fetching all loans');

    return this.http.get<any[]>(this.apiUrl)
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
  getLoan(id: string): Observable<any> {
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

    return this.http.get<any>(`${this.apiUrl}/${id}`)
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
  createLoan(loan: any): Observable<any> {
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

    if (loan.principalAmount === undefined || loan.principalAmount === null) {
      this.logger.error('Principal amount is required');
      return throwError(() => new Error('Principal amount is required'));
    }

    if (loan.tenure === undefined || loan.tenure === null) {
      this.logger.error('Loan tenure is required');
      return throwError(() => new Error('Loan tenure (in months) is required'));
    }

    // Validate principal amount
    if (typeof loan.principalAmount !== 'number' || loan.principalAmount <= 0) {
      this.logger.error('Invalid principal amount', { principalAmount: loan.principalAmount });
      return throwError(() => new Error('Principal amount must be greater than zero'));
    }

    if (loan.principalAmount > 10000000) {
      this.logger.error('Principal amount exceeds maximum limit');
      return throwError(() => new Error('Principal amount cannot exceed 10,000,000'));
    }

    // Validate tenure (in months)
    if (!Number.isInteger(loan.tenure) || loan.tenure < 1 || loan.tenure > 360) {
      this.logger.error('Invalid tenure', { tenure: loan.tenure });
      return throwError(() => new Error('Loan tenure must be between 1 and 360 months'));
    }

    // Validate interest rate if provided
    if (loan.interestRate !== undefined && (loan.interestRate < 0 || loan.interestRate > 50)) {
      this.logger.error('Invalid interest rate', { interestRate: loan.interestRate });
      return throwError(() => new Error('Interest rate must be between 0 and 50%'));
    }

    // Validate loan type
    const validLoanTypes = ['home', 'auto', 'personal', 'education', 'business'];
    if (!validLoanTypes.includes(loan.loanType.toLowerCase())) {
      this.logger.error('Invalid loan type', { loanType: loan.loanType });
      return throwError(() => new Error(`Loan type must be one of: ${validLoanTypes.join(', ')}`));
    }

    this.logger.debug('Creating new loan', {
      loanType: loan.loanType,
      principalAmount: loan.principalAmount,
      tenure: loan.tenure,
    });

    return this.http.post<any>(this.apiUrl, loan)
      .pipe(
        tap((response) => {
          this.logger.debug('Loan created successfully', { loanId: response.id });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Update a loan with validation
   */
  updateLoan(id: string, loan: any): Observable<any> {
    // Validate loan ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Loan ID is required for update');
      return throwError(() => new Error('Loan ID is required'));
    }

    if (!loan) {
      this.logger.error('Loan data is required for update');
      return throwError(() => new Error('Loan data is required'));
    }

    // Validate principal amount if provided
    if (loan.principalAmount !== undefined && loan.principalAmount !== null) {
      if (typeof loan.principalAmount !== 'number' || loan.principalAmount <= 0) {
        this.logger.error('Invalid principal amount', { principalAmount: loan.principalAmount });
        return throwError(() => new Error('Principal amount must be greater than zero'));
      }
    }

    // Validate tenure if provided
    if (loan.tenure !== undefined && loan.tenure !== null) {
      if (!Number.isInteger(loan.tenure) || loan.tenure < 1 || loan.tenure > 360) {
        this.logger.error('Invalid tenure', { tenure: loan.tenure });
        return throwError(() => new Error('Tenure must be between 1 and 360 months'));
      }
    }

    this.logger.debug('Updating loan', { id });

    return this.http.put<any>(`${this.apiUrl}/${id}`, loan)
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
  deleteLoan(id: string): Observable<any> {
    // Validate loan ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Loan ID is required for deletion');
      return throwError(() => new Error('Loan ID is required'));
    }

    this.logger.debug('Deleting loan', { id });

    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.logger.debug('Loan deleted successfully', { id });
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
        errorMessage = `Error ${error.status}: ${error.message}`;
    }

    this.logger.error('Loan service error', {
      status: error.status,
      message: error.message,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }
}
