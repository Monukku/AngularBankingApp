import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';
import { catchError, tap } from 'rxjs/operators';
import { Beneficiary, BeneficiaryDetails, AddBeneficiaryRequest } from '../models/beneficiary.model';

/**
 * Beneficiary Service - Manages beneficiary operations with input validation
 * Handles adding and retrieving beneficiaries
 */
@Injectable({
  providedIn: 'root'
})
export class BeneficiaryService {
  private apiUrl = environment.api.baseUrl;
  private http = inject(HttpClient);
  private logger = inject(LoggerService);

  /**
   * Get all beneficiaries
   */
  getBeneficiaries(): Observable<BeneficiaryDetails[]> {
    this.logger.debug('Fetching beneficiaries');

    return this.http.get<BeneficiaryDetails[]>(`${this.apiUrl}/beneficiaries`)
      .pipe(
        tap(() => {
          this.logger.debug('Beneficiaries fetched successfully');
        }),
        catchError((error) => this.handleError(error, 'Failed to fetch beneficiaries'))
      );
  }

  /**
   * Add a new beneficiary with validation
   */
  addBeneficiary(beneficiary: AddBeneficiaryRequest): Observable<Beneficiary> {
    // Validate beneficiary object
    if (!beneficiary) {
      this.logger.error('Beneficiary data is required');
      return throwError(() => new Error('Beneficiary data is required'));
    }

    // Validate required fields
    if (!beneficiary.name || beneficiary.name.trim().length === 0) {
      this.logger.error('Beneficiary name is required');
      return throwError(() => new Error('Beneficiary name is required'));
    }

    if (!beneficiary.accountNumber || beneficiary.accountNumber.trim().length === 0) {
      this.logger.error('Beneficiary account number is required');
      return throwError(() => new Error('Beneficiary account number is required'));
    }

    if (!beneficiary.ifscCode || beneficiary.ifscCode.trim().length === 0) {
      this.logger.error('IFSC code is required');
      return throwError(() => new Error('IFSC code is required'));
    }

    // Validate account number format
    if (!/^[a-zA-Z0-9]{8,20}$/.test(beneficiary.accountNumber.trim())) {
      this.logger.error('Invalid account number format', {
        accountNumber: beneficiary.accountNumber,
      });
      return throwError(() => new Error('Invalid account number format'));
    }

    // Validate name length
    if (beneficiary.name.trim().length > 100) {
      this.logger.error('Beneficiary name is too long');
      return throwError(() => new Error('Beneficiary name cannot exceed 100 characters'));
    }

    this.logger.debug('Adding beneficiary', { name: beneficiary.name });

    return this.http.post<Beneficiary>(`${this.apiUrl}/beneficiaries`, beneficiary)
      .pipe(
        tap((response) => {
          this.logger.debug('Beneficiary added successfully', {
            name: beneficiary.name,
            beneficiaryId: response.beneficiaryId,
          });
        }),
        catchError((error) => this.handleError(error, 'Failed to add beneficiary'))
      );
  }

  /**
   * Delete a beneficiary with validation
   */
  deleteBeneficiary(beneficiaryId: string): Observable<void> {
    // Validate input
    if (!beneficiaryId || beneficiaryId.trim().length === 0) {
      this.logger.error('Beneficiary ID is required');
      return throwError(() => new Error('Beneficiary ID is required'));
    }

    this.logger.debug('Deleting beneficiary', { beneficiaryId });

    return this.http.delete<void>(`${this.apiUrl}/beneficiaries/${beneficiaryId}`)
      .pipe(
        tap(() => {
          this.logger.debug('Beneficiary deleted successfully', { beneficiaryId });
        }),
        catchError((error) => this.handleError(error, 'Failed to delete beneficiary'))
      );
  }

  /**
   * Handle errors with type validation and detailed logging
   */
  private handleError(error: unknown, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;
    const maybeError = error as { status?: number; message?: string; error?: unknown };

    // Type guard: Check if it's an HttpErrorResponse or object with status property
    if (error instanceof HttpErrorResponse || (maybeError && typeof maybeError.status === 'number')) {
      const status = maybeError.status as number;

      switch (status) {
        case 400:
          errorMessage = 'Invalid beneficiary data. Please check and try again.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Beneficiary not found.';
          break;
        case 409:
          errorMessage = 'This beneficiary already exists.';
          break;
        case 500:
          errorMessage = 'Server error. Please try again later.';
          break;
        case 0:
          errorMessage = 'Network error. Please check your internet connection.';
          break;
        default:
          errorMessage = defaultMessage;
      }

      this.logger.error('Beneficiary service HTTP error', {
        status,
        message: maybeError.message,
        error: maybeError.error,
      });
    } else if (error instanceof Error) {
      // Standard Error object
      errorMessage = error.message || defaultMessage;
      this.logger.error('Beneficiary service error', { message: error.message });
    } else {
      // Unknown error type
      this.logger.error('Beneficiary service unknown error', { error });
    }

    return throwError(() => new Error(errorMessage));
  }
}
