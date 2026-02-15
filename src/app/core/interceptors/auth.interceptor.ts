import {
  HttpInterceptorFn,
  HttpRequest,
  HttpEvent,
  HttpErrorResponse,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';

import { KeycloakService } from 'keycloak-angular';
import { LoggerService } from '../services/logger.service';

/**
 * Configuration for auth interceptor
 */
interface AuthInterceptorConfig {
  excludedUrls: string[];
  excludedUrlPatterns: RegExp[];
  loginRoute: string;
  autoRefreshToken: boolean;
  tokenMinValiditySeconds: number;
}

const defaultConfig: AuthInterceptorConfig = {
  excludedUrls: ['/assets', '/api/public'],
  excludedUrlPatterns: [/\.json$/, /\/public\//],
  loginRoute: '/auth/login',
  autoRefreshToken: true,
  tokenMinValiditySeconds: 30, // Refresh if token expires in less than 30 seconds
};

/**
 * Functional Auth Interceptor for Keycloak
 * Adds Bearer token to all HTTP requests and handles token refresh
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const keycloakService = inject(KeycloakService);
  const router = inject(Router);
  const logger = inject(LoggerService);
  const config = defaultConfig;

  // Skip auth for excluded URLs
  if (shouldExcludeRequest(req, config)) {
    logger.debug('Skipping auth for excluded URL', req.url);
    return next(req);
  }

  return from(getValidToken(keycloakService, config, logger)).pipe(
    switchMap((token) => {
      const authReq = addAuthHeader(req, token, logger);
      return next(authReq);
    }),
    catchError((error) => handleAuthError(error, router, logger, config))
  );
};

/**
 * Check if request should be excluded from auth
 */
function shouldExcludeRequest(
  req: HttpRequest<unknown>,
  config: AuthInterceptorConfig
): boolean {
  // Check URL strings
  const matchesUrl = config.excludedUrls.some((url) => req.url.includes(url));
  
  // Check URL patterns
  const matchesPattern = config.excludedUrlPatterns.some((pattern) =>
    pattern.test(req.url)
  );

  return matchesUrl || matchesPattern;
}

/**
 * Get a valid token, refreshing if necessary
 */
async function getValidToken(
  keycloakService: KeycloakService,
  config: AuthInterceptorConfig,
  logger: LoggerService
): Promise<string> {
  try {
    // Check if token needs refresh
    if (config.autoRefreshToken) {
      const needsRefresh = !(await keycloakService.isTokenExpired(
        config.tokenMinValiditySeconds
      ));
      
      if (!needsRefresh) {
        logger.debug('Token is valid, no refresh needed');
      } else {
        logger.debug('Token is about to expire, refreshing...');
        await keycloakService.updateToken(config.tokenMinValiditySeconds);
        logger.debug('Token refreshed successfully');
      }
    }

    const token = await keycloakService.getToken();
    
    if (!token) {
      logger.warn('No token available after refresh attempt');
      throw new Error('No authentication token available');
    }

    return token;
  } catch (error) {
    logger.error('Error getting valid token', error);
    throw error;
  }
}

/**
 * Add authorization header to request
 */
function addAuthHeader(
  req: HttpRequest<unknown>,
  token: string,
  logger: LoggerService
): HttpRequest<unknown> {
  logger.debug('Adding Authorization header to request', req.url);
  
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

/**
 * Handle authentication errors
 */
function handleAuthError(
  error: unknown,
  router: Router,
  logger: LoggerService,
  config: AuthInterceptorConfig
): Observable<never> {
  logger.error('Error in auth interceptor', error);

  if (error instanceof HttpErrorResponse) {
    if (error.status === 401) {
      logger.warn('Unauthorized (401) - Redirecting to login');
      router.navigate([config.loginRoute], {
        queryParams: { returnUrl: router.url },
      });
    } else if (error.status === 403) {
      logger.warn('Forbidden (403) - Insufficient permissions');
      // Optionally redirect to access denied page
      // router.navigate(['/access-denied']);
    }
  }

  return throwError(() => error);
}

/**
 * Factory function to create a configurable auth interceptor
 */
export function createAuthInterceptor(
  config: Partial<AuthInterceptorConfig> = {}
): HttpInterceptorFn {
  const mergedConfig = { ...defaultConfig, ...config };

  return (req, next) => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    // Skip auth for excluded URLs
    if (shouldExcludeRequest(req, mergedConfig)) {
      logger.debug('Skipping auth for excluded URL', req.url);
      return next(req);
    }

    return from(getValidToken(keycloakService, mergedConfig, logger)).pipe(
      switchMap((token) => {
        const authReq = addAuthHeader(req, token, logger);
        return next(authReq);
      }),
      catchError((error) => handleAuthError(error, router, logger, mergedConfig))
    );
  };
}

/**
 * Auth interceptor with custom header name
 */
export function createCustomAuthInterceptor(
  headerName: string = 'Authorization',
  tokenPrefix: string = 'Bearer',
  config: Partial<AuthInterceptorConfig> = {}
): HttpInterceptorFn {
  const mergedConfig = { ...defaultConfig, ...config };

  return (req, next) => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    if (shouldExcludeRequest(req, mergedConfig)) {
      return next(req);
    }

    return from(getValidToken(keycloakService, mergedConfig, logger)).pipe(
      switchMap((token) => {
        logger.debug(`Adding ${headerName} header to request`, req.url);
        
        const authReq = req.clone({
          setHeaders: {
            [headerName]: `${tokenPrefix} ${token}`,
          },
        });
        
        return next(authReq);
      }),
      catchError((error) => handleAuthError(error, router, logger, mergedConfig))
    );
  };
}

/**
 * Auth interceptor that only applies to specific domains
 */
export function createDomainSpecificAuthInterceptor(
  allowedDomains: string[],
  config: Partial<AuthInterceptorConfig> = {}
): HttpInterceptorFn {
  const mergedConfig = { ...defaultConfig, ...config };

  return (req, next) => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    // Check if request is to an allowed domain
    const isAllowedDomain = allowedDomains.some((domain) =>
      req.url.includes(domain)
    );

    if (!isAllowedDomain || shouldExcludeRequest(req, mergedConfig)) {
      return next(req);
    }

    return from(getValidToken(keycloakService, mergedConfig, logger)).pipe(
      switchMap((token) => {
        const authReq = addAuthHeader(req, token, logger);
        return next(authReq);
      }),
      catchError((error) => handleAuthError(error, router, logger, mergedConfig))
    );
  };
}

/**
 * Auth interceptor with additional custom headers
 */
export function createAuthInterceptorWithHeaders(
  additionalHeaders: Record<string, string> = {},
  config: Partial<AuthInterceptorConfig> = {}
): HttpInterceptorFn {
  const mergedConfig = { ...defaultConfig, ...config };

  return (req, next) => {
    const keycloakService = inject(KeycloakService);
    const router = inject(Router);
    const logger = inject(LoggerService);

    if (shouldExcludeRequest(req, mergedConfig)) {
      return next(req);
    }

    return from(getValidToken(keycloakService, mergedConfig, logger)).pipe(
      switchMap((token) => {
        logger.debug('Adding Authorization and custom headers', req.url);
        
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
            ...additionalHeaders,
          },
        });
        
        return next(authReq);
      }),
      catchError((error) => handleAuthError(error, router, logger, mergedConfig))
    );
  };
}