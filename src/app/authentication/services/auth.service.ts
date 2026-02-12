// import { Injectable } from '@angular/core';
// import { HttpClient, HttpHeaders } from '@angular/common/http';
// import { BehaviorSubject } from 'rxjs';
// import { Router } from '@angular/router';
// import { environment } from '../../../environments/environment';
// import { KeycloakService } from 'keycloak-angular';
// import { Store } from '@ngrx/store';
// import * as AuthActions from '../../store/actions/auth.actions';
// import { LoggerService } from '../../core/services/logger.service';

// /**
//  * Authentication Service - Keycloak Integration
//  * Manages authentication state and token operations
//  */
// @Injectable({
//   providedIn: 'root',
// })
// export class AuthService {
//   private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
//   public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();

//   constructor(
//     private http: HttpClient,
//     private router: Router,
//     private keycloakService: KeycloakService,
//     private store: Store,
//     private logger: LoggerService
//   ) {
//     // ✅ Only sync state - NO initialization here
//     if (typeof document !== 'undefined') {
//       this.syncAuthState();
//     }
//   }

//   /**
//    * ✅ Sync Keycloak authentication state with NgRx
//    */
//   private async syncAuthState(): Promise<void> {
//     try {
//       const authenticated = await this.keycloakService.isLoggedIn();
//       this.isAuthenticatedSubject.next(authenticated);
//       this.store.dispatch(AuthActions.setAuthenticated({ authenticated }));

//       if (authenticated) {
//         const user = await this.keycloakService.loadUserProfile();
//         this.store.dispatch(AuthActions.loginSuccess({ user }));
//         this.logger.debug('User authenticated', { username: user.username });
//       }

//       this.logger.debug('Auth state synced', { authenticated });
//     } catch (error) {
//       this.logger.error('Failed to sync auth state', error);
//     }
//   }

//   /**
//    * Load user profile from Keycloak
//    */
//   public loadUserProfile(): Promise<any> {
//     return this.keycloakService.loadUserProfile();
//   }

//   /**
//    * ✅ Initiate Keycloak login with custom redirect
//    */
//   public login(redirectPath: string = '/dashboard'): Promise<void> {
//     return this.keycloakService.login({
//       redirectUri: window.location.origin + redirectPath,
//     });
//   }

//   /**
//    * Check if user is logged in
//    */
//   public async isLoggedIn(): Promise<boolean> {
//     return await this.keycloakService.isLoggedIn();
//   }

//   /**
//    * ✅ Logout user and redirect to origin
//    */
//   public logout(): Promise<void> {
//     return this.keycloakService.logout(window.location.origin).then(() => {
//       this.isAuthenticatedSubject.next(false);
//       this.store.dispatch(AuthActions.setAuthenticated({ authenticated: false }));
//       this.store.dispatch(AuthActions.logoutSuccess());
//       localStorage.clear(); // Clear any stored data
//       this.logger.debug('User logged out');
//     });
//   }

//   /**
//    * Get current access token (with auto-refresh)
//    */
//   public getToken(): Promise<string> {
//     return this.keycloakService
//       .updateToken(5) // Refresh if expires in 5 seconds
//       .then(() => {
//         return this.keycloakService.getToken() || '';
//       })
//       .catch((err) => {
//         this.logger.error('Failed to refresh token', err);
//         return '';
//       });
//   }

//   /**
//    * Get authorization headers with Bearer token
//    */
//   public async getAuthHeaders(): Promise<HttpHeaders> {
//     const token = await this.getToken();
//     return new HttpHeaders({
//       Authorization: `Bearer ${token}`,
//     });
//   }

//   /**
//    * Check if user has required role(s)
//    */
//   public hasRole(requiredRoles: string | string[]): boolean {
//     const userRoles = this.keycloakService.getUserRoles();
//     if (typeof requiredRoles === 'string') {
//       return userRoles.includes(requiredRoles);
//     } else {
//       return requiredRoles.some((role) => userRoles.includes(role));
//     }
//   }

//   /**
//    * Get user's roles
//    */
//   public getUserRoles(): string[] {
//     return this.keycloakService.getUserRoles();
//   }

//   /**
//    * Set redirect URL for after login
//    */
//   public setRedirectUrl(redirectUrl: string): void {
//     sessionStorage.setItem('redirectUrl', redirectUrl);
//   }

//   /**
//    * Get redirect URL after login
//    */
//   public getRedirectUrl(): string {
//     const url = sessionStorage.getItem('redirectUrl') || '/dashboard';
//     sessionStorage.removeItem('redirectUrl'); // Clear after reading
//     return url;
//   }
// }


import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { KeycloakService } from 'keycloak-angular';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/actions/auth.actions';
import { LoggerService } from '../../core/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(false);
  public isAuthenticated$ = this.isAuthenticatedSubject.asObservable();
  private platformId = inject(PLATFORM_ID);

  constructor(
    private http: HttpClient,
    private router: Router,
    private keycloakService: KeycloakService,
    private store: Store,
    private logger: LoggerService
  ) {
    // Only sync state in browser
    if (isPlatformBrowser(this.platformId)) {
      this.syncAuthState();
    }
  }

  private async syncAuthState(): Promise<void> {
    try {
      const authenticated = await this.keycloakService.isLoggedIn();
      this.isAuthenticatedSubject.next(authenticated);
      this.store.dispatch(AuthActions.setAuthenticated({ authenticated }));

      if (authenticated) {
        const user = await this.keycloakService.loadUserProfile();
        this.store.dispatch(AuthActions.loginSuccess({ user }));
        this.logger.debug('User authenticated', { username: user.username });
      }

      this.logger.debug('Auth state synced', { authenticated });
    } catch (error) {
      this.logger.error('Failed to sync auth state', error);
    }
  }

  public loadUserProfile(): Promise<any> {
    return this.keycloakService.loadUserProfile();
  }

  // ✅ Login redirects to /home
  public login(redirectPath: string = '/home'): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      return this.keycloakService.login({
        redirectUri: window.location.origin + redirectPath,
      });
    }
    return Promise.resolve();
  }

  public async isLoggedIn(): Promise<boolean> {
    return await this.keycloakService.isLoggedIn();
  }

  public logout(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      return this.keycloakService.logout(window.location.origin).then(() => {
        this.isAuthenticatedSubject.next(false);
        this.store.dispatch(AuthActions.setAuthenticated({ authenticated: false }));
        this.store.dispatch(AuthActions.logoutSuccess());
        if (typeof localStorage !== 'undefined') {
          localStorage.clear();
        }
        this.logger.debug('User logged out');
      });
    }
    return Promise.resolve();
  }

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

  public async getAuthHeaders(): Promise<HttpHeaders> {
    const token = await this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  public hasRole(requiredRoles: string | string[]): boolean {
    const userRoles = this.keycloakService.getUserRoles();
    if (typeof requiredRoles === 'string') {
      return userRoles.includes(requiredRoles);
    } else {
      return requiredRoles.some((role) => userRoles.includes(role));
    }
  }

  public getUserRoles(): string[] {
    return this.keycloakService.getUserRoles();
  }

  public setRedirectUrl(redirectUrl: string): void {
    if (isPlatformBrowser(this.platformId) && typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem('redirectUrl', redirectUrl);
    }
  }

  public getRedirectUrl(): string {
    if (isPlatformBrowser(this.platformId) && typeof sessionStorage !== 'undefined') {
      const url = sessionStorage.getItem('redirectUrl') || '/home';
      sessionStorage.removeItem('redirectUrl');
      return url;
    }
    return '/home';
  }
}