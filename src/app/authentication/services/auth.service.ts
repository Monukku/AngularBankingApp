import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError, from, BehaviorSubject } from 'rxjs';
import { catchError, tap, switchMap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { KeycloakService } from 'keycloak-angular';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/actions/auth.actions';
import { LoggerService } from '../../core/services/logger.service';

/**
 * Consolidated Authentication Service
 * Handles all authentication operations including:
 * - Keycloak integration
 * - Token management
 * - User authentication status
 * - Password reset and registration
 * - Role-based access control
 */
@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private redirectUrl: string = '';
  private userRoles: string[] = [];
  private apiUrl = environment.apiUrl;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private keycloakService: KeycloakService,
    private store: Store,
    private logger: LoggerService
  ) {
    // Only initialize Keycloak in browser environment
    if (typeof document !== 'undefined') {
      this.initializeAuth();
    }
  }

  /**
   * Initialize Keycloak authentication
   */
  private async initializeAuth(): Promise<void> {
    try {
      await this.keycloakService.init({
        config: environment.keycloak,
        initOptions: {
          onLoad: 'check-sso',
          checkLoginIframe: true,
          silentCheckSsoRedirectUri: window.location.origin + '/assets/silent-check-sso.html',
        },
        enableBearerInterceptor: true,
        bearerExcludedUrls: ['/assets', '/clients/public'],
      });

      const authenticated = this.keycloakService.isLoggedIn();
      this.isAuthenticatedSubject.next(authenticated);
      this.store.dispatch(AuthActions.setAuthenticated({ authenticated }));
      this.logger.debug('Auth initialization complete', { authenticated });
    } catch (error) {
      this.logger.error('Auth initialization failed', error);
    }
  }

  /**
   * Check if user is logged in
   */
  public isLoggedIn(): boolean {
    return this.keycloakService.isLoggedIn();
  }

  /**
   * Load user profile from Keycloak
   */
  public loadUserProfile(): Promise<any> {
    return this.keycloakService.loadUserProfile();
  }

  /**
   * Initiate Keycloak login
   */
  public login(): Promise<void> {
    return this.keycloakService.login().then(() => {
      this.isAuthenticatedSubject.next(true);
      this.store.dispatch(AuthActions.setAuthenticated({ authenticated: true }));
      this.logger.debug('User logged in successfully');
    });
  }

  /**
   * Logout user
   */
  public logout(): Promise<void> {
    return this.keycloakService.logout().then(() => {
      this.isAuthenticatedSubject.next(false);
      this.store.dispatch(
        AuthActions.setAuthenticated({ authenticated: false })
      );
      localStorage.removeItem('redirectUrl');
      this.logger.debug('User logged out');
    });
  }

  /**
   * Get current access token
   */
  public getToken(): Promise<string> {
    return this.keycloakService
      .updateToken(5)
      .then(() => {
        return this.keycloakService.getToken() || '';
      })
      .catch((err) => {
        this.logger.error('Failed to refresh token', err);
        return '';
      });
  }

  /**
   * Get authorization headers with Bearer token
   */
  public getAuthHeaders(): HttpHeaders {
    const token = this.keycloakService.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  /**
   * Check if user has required role(s)
   */
  public hasRole(requiredRoles: string | string[]): boolean {
    const userRoles = this.keycloakService.getUserRoles();
    if (typeof requiredRoles === 'string') {
      return userRoles.includes(requiredRoles);
    } else {
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  }

  /**
   * Register a new user
   */
  public register(
    username: string,
    email: string,
    password: string
  ): Observable<any> {
    if (!username || !email || !password) {
      return throwError(
        () => new Error('Username, email, and password are required')
      );
    }

    const payload = { username, email, password };
    this.logger.debug('Registering user', { username, email });

    return this.http
      .post<any>(`${this.apiUrl}/auth/register`, payload)
      .pipe(
        tap(() => {
          this.logger.debug('User registered successfully');
        }),
        catchError((error) => {
          this.logger.error('Registration failed', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Request password reset link
   */
  public sendResetLink(email: string): Observable<any> {
    if (!email) {
      return throwError(() => new Error('Email is required'));
    }

    this.logger.debug('Sending password reset link', { email });

    return this.http
      .post<any>(`${this.apiUrl}/auth/forgot-password`, { email })
      .pipe(
        tap(() => {
          this.logger.debug('Password reset link sent');
        }),
        catchError((error) => {
          this.logger.error('Failed to send reset link', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Change user password
   */
  public changePassword(
    token: string,
    newPassword: string
  ): Observable<any> {
    if (!token || !newPassword) {
      return throwError(
        () => new Error('Token and new password are required')
      );
    }

    this.logger.debug('Changing password');

    return this.http
      .post<any>(`${this.apiUrl}/auth/change-password`, {
        token,
        newPassword,
      })
      .pipe(
        tap(() => {
          this.logger.debug('Password changed successfully');
        }),
        catchError((error) => {
          this.logger.error('Failed to change password', error);
          return this.handleError(error);
        })
      );
  }

  /**
   * Set redirect URL after login
   */
  public setRedirectUrl(redirectUrl: string): void {
    localStorage.setItem('redirectUrl', redirectUrl);
  }

  /**
   * Get redirect URL after login
   */
  public getRedirectUrl(): string {
    return localStorage.getItem('redirectUrl') || '/dashboard';
  }

  /**
   * Handle authentication errors
   */
  private handleError(error: any): Observable<never> {
    this.logger.error('Auth service error', error);
    return throwError(() => error);
  }
}
