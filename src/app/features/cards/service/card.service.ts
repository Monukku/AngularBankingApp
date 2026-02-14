import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment'; 
import { LoggerService } from '../../../core/services/logger.service'; 

/**
 * Card Service - Manages card operations with input validation
 * Handles card retrieval, creation, updating, and deletion
 */
@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.api.baseUrl}/cards`;

  constructor(
    private http: HttpClient,
    private logger: LoggerService
  ) { }

  /**
   * Get all cards for the user
   */
  getCards(): Observable<any[]> {
    this.logger.debug('Fetching all cards');

    return this.http.get<any[]>(this.apiUrl)
      .pipe(
        tap(() => {
          this.logger.debug('Cards fetched successfully');
        }),
        catchError((error) => this.handleError(error))
      );
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
        errorMessage = `Error ${error.status}: ${error.message}`;
    }

    this.logger.error('Card service error', {
      status: error.status,
      message: error.message,
      error: error.error,
    });

    return throwError(() => new Error(errorMessage));
  }
}
