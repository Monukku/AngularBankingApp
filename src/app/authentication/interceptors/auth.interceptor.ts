import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, from, throwError } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';
import { LoggerService } from '../../core/services/logger.service';

/**
 * Auth Interceptor to add Bearer token to all HTTP requests
 * Automatically refreshes token when needed
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(
    private keycloakService: KeycloakService,
    private router: Router,
    private logger: LoggerService
  ) {}

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // List of URLs that should not have the auth token
    const excludedUrls = ['/assets', '/clients/public'];
    const shouldExclude = excludedUrls.some((url) =>
      req.url.includes(url)
    );

    if (shouldExclude) {
      return next.handle(req);
    }

    return from(this.keycloakService.getToken()).pipe(
      switchMap((token) => {
        if (token) {
          this.logger.debug('Adding Authorization header to request', req.url);
          req = req.clone({
            setHeaders: {
              Authorization: `Bearer ${token}`,
            },
          });
        } else {
          this.logger.warn('No token available for request', req.url);
        }
        return next.handle(req);
      }),
      catchError((error) => {
        this.logger.error('Error in auth interceptor', error);

        // If 401 Unauthorized, redirect to login
        if (error instanceof HttpErrorResponse && error.status === 401) {
          this.logger.warn('Unauthorized request, redirecting to login');
          this.router.navigate(['/auth/login']);
        }

        return throwError(() => error);
      })
    );
  }
}

