// import { Injectable, inject } from '@angular/core';
// import {
//   CanActivate,
//   ActivatedRouteSnapshot,
//   RouterStateSnapshot,
//   Router,
// } from '@angular/router';
// import { KeycloakService } from 'keycloak-angular';
// import { Store } from '@ngrx/store';
// import * as AuthActions from '../../store/actions/auth.actions';

// @Injectable({ providedIn: 'root' })
// export class AuthGuard implements CanActivate {
//   private keycloakService = inject(KeycloakService);
//   private router = inject(Router);
//   private store = inject(Store);

//   async canActivate(
//     route: ActivatedRouteSnapshot,
//     state: RouterStateSnapshot
//   ): Promise<boolean> {
//     // E2E test bypass
//     try {
//       if (
//         typeof window !== 'undefined' &&
//         window.localStorage.getItem('CYPRESS_E2E') === 'true'
//       ) {
//         return true;
//       }
//     } catch (e) {
//       // ignore
//     }

//     const isLoggedIn = await this.keycloakService.isLoggedIn();

//     if (!isLoggedIn) {
//       // ✅ Redirect to Keycloak login page
//       await this.keycloakService.login({
//         redirectUri: window.location.origin + state.url,
//       });
//       return false;
//     }

//     // ✅ Sync user profile with NgRx when logged in
//     try {
//       const userProfile = await this.keycloakService.loadUserProfile();
//       this.store.dispatch(AuthActions.loginSuccess({ user: userProfile }));
//     } catch (error) {
//       console.error('Failed to load user profile', error);
//     }

//     // ✅ Role-based access control
//     const requiredRoles: string[] = route.data['roles'] ?? [];
//     if (requiredRoles.length) {
//       const userRoles = this.keycloakService.getUserRoles(true);
//       const hasRole = requiredRoles.some((role) => userRoles.includes(role));

//       if (!hasRole) {
//         console.warn('User lacks required roles:', requiredRoles);
//         this.router.navigate(['/unauthorized']);
//         return false;
//       }
//     }

//     return true;
//   }
// }


import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);
  private store = inject(Store);
  private platformId = inject(PLATFORM_ID);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // ✅ SSR Safety: Only run auth checks in browser
    if (!isPlatformBrowser(this.platformId)) {
      return false; // Block access during SSR
    }

    // ✅ E2E test bypass
    try {
      if (localStorage.getItem('CYPRESS_E2E') === 'true') {
        return true;
      }
    } catch (e) {
      // ignore
    }

    // ✅ Check if user is logged in
    const isLoggedIn = await this.keycloakService.isLoggedIn();

    if (!isLoggedIn) {
      // ✅ User not logged in - redirect to Keycloak login
      // After login, redirect to /home (or the originally requested URL)
      const redirectUri = state.url === '/home' || state.url === '/' 
        ? window.location.origin + '/home'
        : window.location.origin + state.url;

      await this.keycloakService.login({
        redirectUri: redirectUri,
      });
      return false;
    }

    // ✅ User is logged in - sync user profile with NgRx
    try {
      const userProfile = await this.keycloakService.loadUserProfile();
      this.store.dispatch(AuthActions.loginSuccess({ user: userProfile }));
      this.store.dispatch(AuthActions.setAuthenticated({ authenticated: true }));
    } catch (error) {
      console.error('Failed to load user profile', error);
    }

    // ✅ Role-based access control
    const requiredRoles: string[] = route.data['roles'] ?? [];
    if (requiredRoles.length) {
      const userRoles = this.keycloakService.getUserRoles(true);
      const hasRole = requiredRoles.some((role) => userRoles.includes(role));

      if (!hasRole) {
        console.warn('User lacks required roles:', requiredRoles);
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
