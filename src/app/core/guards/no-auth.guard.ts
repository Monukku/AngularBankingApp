import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

/**
 * Functional No-Auth Guard - Protects unauthenticated routes (login, register)
 * Redirects already logged-in users to dashboard to prevent accessing auth pages
 */
export const noAuthGuard: CanActivateFn = async (): Promise<boolean> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);

  const isLoggedIn = await keycloakService.isLoggedIn();
  
  if (isLoggedIn) {
    // ✅ Redirect to dashboard if already logged in
    router.navigate(['/home']);
    return false;
  }

  return true;
};
