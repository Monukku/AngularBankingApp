import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Account } from '../../shared/models/account.model';
import { AuthService } from '../../authentication/services/auth.service';
import { AccountDetails } from '../../shared/models/accounts-details.model';
import { KeycloakAuthService } from '../../authentication/services/KeyCloakAuthService';

@Injectable({
  providedIn: 'root',
})
export class AccountService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private keycloakAuthService: KeycloakAuthService
  ) {}

  createAccount(
    accountData: Account,
    accountType: string
  ): Observable<Account> {
    return this.http
      .post<Account>(
        `${this.apiUrl}/accounts/api/create/${accountType}`,
        accountData,
        {
          headers: this.keycloakAuthService.getAuthHeaders(),
        }
      )
      .pipe(
        tap(() => console.log('Account created successfully')),
        catchError(this.handleError)
      );
  }

  fetchAccountDetails(mobileNumber: string): Observable<AccountDetails> {
    return this.http
      .get<AccountDetails>(
        `${this.apiUrl}/accounts/api/fetch?mobileNumber=${mobileNumber}`,
        {
          headers: this.keycloakAuthService.getAuthHeaders(),
        }
      )
      .pipe(
        tap(() => console.log('Account fetched successfully')),
        catchError(this.handleError)
      );
  }

  updateAccount(mobileNumber: string, updatedData: Account): Observable<any> {
    return this.http
      .put(
        `${this.apiUrl}/accounts/api/updateAccount?mobileNumber=${mobileNumber}`,
        updatedData,
        {
          headers: this.keycloakAuthService.getAuthHeaders(),
        }
      )
      .pipe(
        tap(() => console.log('Account updated successfully')),
        catchError(this.handleError)
      );
  }

  deleteAccount(mobileNumber: string): Observable<any> {
    return this.http
      .delete(
        `${this.apiUrl}/accounts/api/delete?mobileNumber=${mobileNumber}`,
        {
          headers: this.keycloakAuthService.getAuthHeaders(),
        }
      )
      .pipe(
        tap(() => console.log('Account deleted successfully')),
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred!';

    if (error.status === 404) {
      errorMessage = 'The account with given mobile number does not exist.';
    } else if (error.status === 400) {
      errorMessage =
        'The request was invalid. Please check the data and try again.';
    } else if (error.status === 500) {
      errorMessage = 'An error occurred on the server. Please try again later.';
    }
    // Log the error message
    console.error('Error occurred:', errorMessage);

    // Return the error message
    return throwError(() => new Error(errorMessage));
  }
}
