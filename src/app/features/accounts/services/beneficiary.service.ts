import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { LoggerService } from '../../../core/services/logger.service';
import { catchError, tap } from 'rxjs/operators';
import { Beneficiary, BeneficiaryDetails, AddBeneficiaryRequest } from '../models/beneficiary.model';
import { isHttpError } from '../../../core/models/error.model';

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
  getBeneficiaries(): Observable<any[]> {
    this.logger.debug('Fetching beneficiaries');

    return this.http.get<any[]>(`${this.apiUrl}/beneficiaries`)
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
  addBeneficiary(beneficiary: any): Observable<any> {
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

    if (!beneficiary.bankCode || beneficiary.bankCode.trim().length === 0) {
      this.logger.error('Bank code is required');
      return throwError(() => new Error('Bank code is required'));
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

    return this.http.post(`${this.apiUrl}/beneficiaries`, beneficiary)
      .pipe(
        tap((response) => {
          this.logger.debug('Beneficiary added successfully', {
            name: beneficiary.name,
          });
        }),
        catchError((error) => this.handleError(error, 'Failed to add beneficiary'))
      );
  }

  /**
   * Delete a beneficiary with validation
   */
  deleteBeneficiary(beneficiaryId: string): Observable<any> {
    // Validate input
    if (!beneficiaryId || beneficiaryId.trim().length === 0) {
      this.logger.error('Beneficiary ID is required');
      return throwError(() => new Error('Beneficiary ID is required'));
    }

    this.logger.debug('Deleting beneficiary', { beneficiaryId });

    return this.http.delete(`${this.apiUrl}/beneficiaries/${beneficiaryId}`)
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
  private handleError(error: any, defaultMessage: string): Observable<never> {
    let errorMessage = defaultMessage;

    // Type guard: Check if it's an HttpErrorResponse with status property
    if (error instanceof HttpErrorResponse || (error && typeof error.status === 'number')) {
      const status = error.status;

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
        message: error.message,
        error: error.error,
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
