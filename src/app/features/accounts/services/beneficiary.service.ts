import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
  getBeneficiaries(): Observable<any[]> {
    this.logger.debug('Fetching beneficiaries');

    return this.http.get<any[]>(`${this.apiUrl}/beneficiaries`)
      .pipe(
        tap(() => {
          this.logger.debug('Beneficiaries fetched successfully');
        }),
        catchError((error) => {
          this.logger.error('Failed to fetch beneficiaries', error);
          return throwError(() => new Error('Failed to fetch beneficiaries'));
        })
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
        catchError((error) => {
          this.logger.error('Failed to add beneficiary', error);
          let errorMessage = 'Failed to add beneficiary. Please try again.';

          if (error.status === 400) {
            errorMessage = 'Invalid beneficiary data. Please check and try again.';
          } else if (error.status === 401) {
            errorMessage = 'Unauthorized. Please log in again.';
          } else if (error.status === 403) {
            errorMessage = 'You do not have permission to add a beneficiary.';
          } else if (error.status === 409) {
            errorMessage = 'This beneficiary already exists.';
          }

          return throwError(() => new Error(errorMessage));
        })
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
        catchError((error) => {
          this.logger.error('Failed to delete beneficiary', error);
          let errorMessage = 'Failed to delete beneficiary. Please try again.';

          if (error.status === 404) {
            errorMessage = 'Beneficiary not found.';
          } else if (error.status === 401) {
            errorMessage = 'Unauthorized. Please log in again.';
          }

          return throwError(() => new Error(errorMessage));
        })
      );
  }
}
