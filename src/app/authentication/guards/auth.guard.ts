import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {

  private keycloakService = inject(KeycloakService);
  private router = inject(Router);

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {

    // Allow bypass for E2E tests when localStorage flag is present
    try {
      if (typeof window !== 'undefined' && window.localStorage.getItem('CYPRESS_E2E') === 'true') {
        return true;
      }
    } catch (e) {
      // ignore
    }

    const isLoggedIn = await this.keycloakService.isLoggedIn();

    if (!isLoggedIn) {
      // Redirect to login page if not authenticated
      this.router.navigate(['/auth/login']);
      return false;
    }

    const requiredRoles: string[] = route.data['roles'] ?? [];

    if (requiredRoles.length) {
      const userRoles = await this.keycloakService.getUserRoles(true);
      const hasRole = requiredRoles.some(role =>
        userRoles.includes(role)
      );

      if (!hasRole) {
        this.router.navigate(['/unauthorized']);
        return false;
      }
    }

    return true;
  }
}
