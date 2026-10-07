import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

export const roleGuard: CanActivateFn = async (route: ActivatedRouteSnapshot): Promise<boolean> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const requiredRoles: string[] = route.data['roles'] ?? [];
  if (!requiredRoles.length) return true;

  // Ensure the token is fresh before reading roles — avoids a race on initial page load
  // where the Keycloak instance exists but the token hasn't been parsed yet.
  try {
    await keycloakService.updateToken(5);
  } catch {
    // Token refresh failed — user is not authenticated; authGuard handles redirect.
    return false;
  }

  let userRoles: string[];
  try {
    userRoles = keycloakService.getUserRoles();
  } catch {
    userRoles = [];
  }

  const hasRole = requiredRoles.some(role => userRoles.includes(role));
  if (!hasRole) {
    console.warn('User lacks required roles:', requiredRoles);
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};
