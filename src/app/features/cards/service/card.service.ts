import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap, shareReplay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'; 
import { LoggerService } from '../../../core/services/logger.service'; 
import { Card, CardDetails } from '../models/card.model';
import { isHttpError, isValidationError } from '../../../core/models/error.model';

/**
 * Card Service - Manages card operations with input validation
 * Handles card retrieval, creation, updating, and deletion
 */
@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.api.baseUrl}/cards`;
  private http = inject(HttpClient);
  private logger = inject(LoggerService);
  private cardsCache$: Observable<any[]> | null = null;

  /**
   * Get all cards for the user with caching via shareReplay
   * Multiple subscribers will share the same request result
   */
  getCards(): Observable<any[]> {
    if (!this.cardsCache$) {
      this.logger.debug('Fetching all cards');

      this.cardsCache$ = this.http.get<any[]>(this.apiUrl)
        .pipe(
          tap(() => {
            this.logger.debug('Cards fetched successfully');
          }),
          catchError((error) => this.handleError(error)),
          shareReplay(1) // Cache and share among all subscribers
        );
    }
    return this.cardsCache$;
  }

  /**
   * Clear the cache when cards are modified
   */
  invalidateCardsCache(): void {
    this.cardsCache$ = null;
  }

  /**
   * Get a specific card by ID with validation
   */
  getCard(id: string): Observable<any> {
    // Validate card ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Card ID is required');
      return throwError(() => new Error('Card ID is required'));
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(id.trim())) {
      this.logger.error('Invalid card ID format', { id });
      return throwError(() => new Error('Invalid card ID format'));
    }

    this.logger.debug('Fetching card', { id });

    return this.http.get<any>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.logger.debug('Card fetched successfully', { id });
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Create a new card with validation
   */
  createCard(card: any): Observable<any> {
    // Validate card object
    if (!card) {
      this.logger.error('Card data is required');
      return throwError(() => new Error('Card data is required'));
    }

    // Validate required fields
    if (!card.cardNumber || card.cardNumber.trim().length === 0) {
      this.logger.error('Card number is required');
      return throwError(() => new Error('Card number is required'));
    }

    if (!card.cardholderName || card.cardholderName.trim().length === 0) {
      this.logger.error('Cardholder name is required');
      return throwError(() => new Error('Cardholder name is required'));
    }

    if (!card.expiryDate || card.expiryDate.trim().length === 0) {
      this.logger.error('Expiry date is required');
      return throwError(() => new Error('Expiry date is required'));
    }

    // Validate card number format (basic validation for 13-19 digits)
    if (!/^\d{13,19}$/.test(card.cardNumber.replace(/\s/g, ''))) {
      this.logger.error('Invalid card number format', { cardNumber: card.cardNumber });
      return throwError(() => new Error('Invalid card number format. Must be 13-19 digits.'));
    }

    // Validate cardholder name length
    if (card.cardholderName.trim().length > 50) {
      this.logger.error('Cardholder name is too long');
      return throwError(() => new Error('Cardholder name cannot exceed 50 characters'));
    }

    // Validate expiry date format (MM/YY)
    if (!/^\d{2}\/\d{2}$/.test(card.expiryDate.trim())) {
      this.logger.error('Invalid expiry date format', { expiryDate: card.expiryDate });
      return throwError(() => new Error('Expiry date must be in MM/YY format'));
    }

    // Validate CVV if provided
    if (card.cvv && !/^\d{3,4}$/.test(card.cvv.toString())) {
      this.logger.error('Invalid CVV format', { cvv: card.cvv });
      return throwError(() => new Error('CVV must be 3-4 digits'));
    }

    this.logger.debug('Creating new card', { cardNumber: `****${card.cardNumber.slice(-4)}` });

    return this.http.post<any>(this.apiUrl, card)
      .pipe(
        tap((response) => {
          this.logger.debug('Card created successfully', { cardId: response.id });
          this.invalidateCardsCache(); // Invalidate cache on creation
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Update a card with validation
   */
  updateCard(id: string, card: any): Observable<any> {
    // Validate card ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Card ID is required for update');
      return throwError(() => new Error('Card ID is required'));
    }

    if (!card) {
      this.logger.error('Card data is required for update');
      return throwError(() => new Error('Card data is required'));
    }

    // Validate card number if provided
    if (card.cardNumber && !/^\d{13,19}$/.test(card.cardNumber.replace(/\s/g, ''))) {
      this.logger.error('Invalid card number format', { cardNumber: card.cardNumber });
      return throwError(() => new Error('Invalid card number format'));
    }

    // Validate cardholder name if provided
    if (card.cardholderName && card.cardholderName.trim().length > 50) {
      this.logger.error('Cardholder name is too long');
      return throwError(() => new Error('Cardholder name cannot exceed 50 characters'));
    }

    this.logger.debug('Updating card', { id });

    return this.http.put<any>(`${this.apiUrl}/${id}`, card)
      .pipe(
        tap(() => {
          this.logger.debug('Card updated successfully', { id });
          this.invalidateCardsCache(); // Invalidate cache on update
        }),
        catchError((error) => this.handleError(error))
      );
  }

  /**
   * Delete a card with validation
   */
  deleteCard(id: string): Observable<any> {
    // Validate card ID
    if (!id || id.trim().length === 0) {
      this.logger.error('Card ID is required for deletion');
      return throwError(() => new Error('Card ID is required'));
    }

    this.logger.debug('Deleting card', { id });

    return this.http.delete<any>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => {
          this.logger.debug('Card deleted successfully', { id });
          this.invalidateCardsCache(); // Invalidate cache on deletion
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
          errorMessage = 'Invalid request. Please check the card data.';
          break;
        case 401:
          errorMessage = 'Unauthorized. Please log in again.';
          break;
        case 403:
          errorMessage = 'You do not have permission to perform this action.';
          break;
        case 404:
          errorMessage = 'Card not found.';
          break;
        case 409:
          errorMessage = 'Card already exists.';
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

      this.logger.error('Card service HTTP error', {
        status,
        message: error.message,
        error: error.error,
      });
    } else if (error instanceof Error) {
      // Standard Error object
      errorMessage = error.message;
      this.logger.error('Card service error', { message: error.message });
    } else {
      // Unknown error type
      this.logger.error('Card service unknown error', { error });
    }

    return throwError(() => new Error(errorMessage));
  }
}
