import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import Keycloak from 'keycloak-js';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private redirectUrl: string = '';
  private userRoles: string[] = [];
  private apiUrl = environment.apiUrl;
  private keycloak: Keycloak.KeycloakInstance;

  constructor(private http: HttpClient, private router: Router) {
    this.keycloak = new Keycloak({
      url: 'http://localhost:7070/auth',
      realm: 'rewabank-realm',
      clientId: 'angular-client',
    });
  }

  public isLoggedIn(): boolean {
    return !!this.keycloak.authenticated;
  }

  public loadUserProfile(): Promise<any> {
    return this.keycloak.loadUserProfile();
  }

  public login(): void {
    this.keycloak.login();
  }

  public logout(): void {
    this.keycloak.logout();
  }

  public getToken(): Promise<string> {
    return this.keycloak
      .updateToken(5)
      .then(() => {
        return this.keycloak.token || '';
      })
      .catch((err) => {
        console.error('Failed to refresh token', err);
        return '';
      });
  }

  register(username: string, email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/register`, { username, email, password })
      .pipe(catchError(this.handleError));
  }

  sendResetLink(email: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/forgot-password`, { email })
      .pipe(catchError(this.handleError));
  }

  changePassword(token: string, newPassword: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/change-password`, { token, newPassword })
      .pipe(catchError(this.handleError));
  }

  setRedirectUrl(redirectUrl: string): void {
    localStorage.setItem('redirectUrl', redirectUrl);
  }

  getRedirectUrl(): string {
    return localStorage.getItem('redirectUrl') || '/';
  }

  hasRole(requiredRoles: string | string[]): boolean {
    if (typeof requiredRoles === 'string') {
      return this.userRoles.includes(requiredRoles);
    } else {
      return requiredRoles.some((role) => this.userRoles.includes(role));
    }
  }

  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
