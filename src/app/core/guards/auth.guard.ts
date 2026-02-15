import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  Router,
  RouterStateSnapshot,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { Store } from '@ngrx/store';
import * as AuthActions from '../../store/auth/auth.actions';
import { UserProfile } from '../models/user.model';

/**
 * Functional Auth Guard - Protects authenticated routes
 * Ensures user is logged in via Keycloak and syncs profile with NgRx
 * Supports role-based access control via route data['roles']
 */
export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
): Promise<boolean> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  const store = inject(Store);
  const platformId = inject(PLATFORM_ID);

  // ✅ SSR Safety: Only run auth checks in browser
  if (!isPlatformBrowser(platformId)) {
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
  const isLoggedIn = await keycloakService.isLoggedIn();

  if (!isLoggedIn) {
    // ✅ User not logged in - redirect to Keycloak login
    const redirectUri = state.url === '/home' || state.url === '/' 
      ? window.location.origin + '/home'
      : window.location.origin + state.url;

    await keycloakService.login({
      redirectUri: redirectUri,
    });
    return false;
  }

  // ✅ User is logged in - sync user profile with NgRx
  try {
    const userProfile = (await keycloakService.loadUserProfile()) as UserProfile;
    store.dispatch(AuthActions.loginSuccess({ user: userProfile }));
    store.dispatch(AuthActions.setAuthenticated({ authenticated: true }));
  } catch (error) {
    console.error('Failed to load user profile', error);
  }

  // ✅ Role-based access control
  const requiredRoles: string[] = route.data['roles'] ?? [];
  if (requiredRoles.length) {
    const userRoles = keycloakService.getUserRoles(true);
    const hasRole = requiredRoles.some((role) => userRoles.includes(role));

    if (!hasRole) {
      console.warn('User lacks required roles:', requiredRoles);
      router.navigate(['/unauthorized']);
      return false;
    }
  }

  return true;
};
