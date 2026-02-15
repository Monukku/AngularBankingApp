import { inject } from '@angular/core';
import { CanActivateFn, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Functional Role Guard - Enforces role-based access control
 * Checks if user has required role specified in route.data['role']
 * Can accept single role or array of roles
 */
export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);
  
  // Get required role(s) from route data
  const requiredRole = route.data['role'];
  
  if (!requiredRole) {
    // No role required, allow access
    return true;
  }

  const hasRole = authService.hasRole(requiredRole);
  
  if (!hasRole) {
    console.warn('User lacks required role(s):', requiredRole);
    router.navigate(['/unauthorized']);
    return false;
  }

  return true;
};

