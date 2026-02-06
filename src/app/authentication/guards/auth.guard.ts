import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router
  ) {}

  async canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<boolean> {
    // Check if the user is logged in
    const isLoggedIn = await this.keycloakService.isLoggedIn();

    // If not logged in, redirect to Keycloak login page
    if (!isLoggedIn) {
      await this.keycloakService.login({
        redirectUri: window.location.href, // Redirect back to the current page after login
      });
      return false; // Prevent navigation until the user is logged in
    }

    // Check if roles are required for the route
    const requiredRoles: string[] = route.data['roles'] || [];
    if (requiredRoles.length > 0) {
      const userRoles = await this.keycloakService.getUserRoles(true);
      const hasRole = userRoles.some((role) => requiredRoles.includes(role));
      if (!hasRole) {
        this.router.navigate(['/']); // Redirect to home if the user does not have the required roles
        return false;
      }
    }

    return true;
  }
}
