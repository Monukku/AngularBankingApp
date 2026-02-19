import {
  ApplicationConfig,
  ErrorHandler,
  provideZoneChangeDetection,
  isDevMode,
  importProvidersFrom,
} from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';

import { provideAnimations } from '@angular/platform-browser/animations';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import {
  NavigationActionTiming,
  provideRouterStore,
  routerReducer,
  RouterState,
} from '@ngrx/router-store';
import { KeycloakService } from 'keycloak-angular';

// Routes
import { routes } from './app.routes';

// Interceptors
import { createAuthInterceptor } from './core/interceptors/auth.interceptor';
import { createLoggingInterceptor } from './core/interceptors/logging.interceptor';
import { createErrorInterceptor } from './core/interceptors/error.interceptor';

// Error Handler
import { GlobalErrorHandler } from './core/handlers/global-error.handler';

// NgRx
import { authReducer } from './store/auth/auth.reducer';
import { AuthEffects } from './store/auth/auth.effects';
import { CustomRouterSerializer } from './store/router/custom-router-serializer';

// Environment
import { environment } from '../environments/environment';
import { NgxEchartsModule } from 'ngx-echarts';

export const appConfig: ApplicationConfig = {
  providers: [
    // 1. Zone Change Detection - Optimizes change detection performance
    provideZoneChangeDetection({ eventCoalescing: true }),

    // 2. Router - Handles navigation between views
    provideRouter(routes),

    // 3. Client Hydration - Enables Server-Side Rendering (SSR) support
    provideClientHydration(),

    // 4. Animations - Enables Angular animations
    provideAnimations(),

     importProvidersFrom(
      NgxEchartsModule.forRoot({ echarts: () => import('echarts') })
    ),
    // 5. HTTP Client with Interceptors
    // Interceptor order matters: auth → logging → error
    // - Auth interceptor adds authentication tokens to requests
    // - Logging interceptor logs all HTTP requests/responses
    // - Error interceptor handles errors and implements retry logic
    provideHttpClient(
      withFetch(), // Use modern Fetch API instead of XMLHttpRequest
      withInterceptors([
        // Auth Interceptor - Adds Bearer token and handles token refresh
        createAuthInterceptor({
          excludedUrls: ['/assets', '/api/public'], // URLs that don't need auth
          autoRefreshToken: !environment.production, // Auto-refresh in dev only
          tokenMinValiditySeconds: environment.production ? 30 : 300, // Refresh threshold
        }),
        // Logging Interceptor - Logs requests/responses for debugging
        createLoggingInterceptor({
          logOnlyErrors: environment.production, // In prod, only log errors
          logRequestBody: !environment.production, // Log request body in dev
          logResponseBody: !environment.production, // Log response body in dev
        }),
        // Error Interceptor - Handles errors and retries failed requests
        createErrorInterceptor({
          maxRetries: environment.production ? 2 : 0, // Retry in prod, not in dev
          retryDelay: 1000, // Wait 1 second between retries
        }),
      ])
    ),

    // 6. NgRx Store - Central state management
    // Stores application state in a single immutable state tree
    provideStore({
      auth: authReducer, // Authentication state
      router: routerReducer, // Router state (URL, params, etc.)
    }),

    // 7. NgRx Effects - Handles side effects like API calls
    // Effects listen for actions and perform async operations
    provideEffects([AuthEffects]),

    // 8. NgRx Router Store - Synchronizes Angular Router with NgRx Store
    // Allows selecting router state from store and time-travel debugging
    provideRouterStore({
      serializer: CustomRouterSerializer, // Custom serializer for minimal state
      navigationActionTiming: NavigationActionTiming.PostActivation, // When to dispatch
      routerState: RouterState.Minimal, // Store minimal router state for performance
    }),

    // 9. NgRx DevTools - Redux DevTools for debugging (development only)
    // Enables time-travel debugging, action replay, and state inspection
    ...(isDevMode()
      ? [
          provideStoreDevtools({
            maxAge: 25, // Retains last 25 states in history
            logOnly: false, // Allow time-travel debugging in dev
            autoPause: true, // Pause recording when DevTools window is closed
            trace: false, // Don't include stack traces (for performance)
            traceLimit: 75, // Maximum stack trace frames if trace is enabled
            connectInZone: true, // Run in Angular zone for better integration
          }),
        ]
      : []),

    // 10. Global Error Handler - Catches all unhandled errors
    // Provides centralized error handling, logging, and user notifications
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler,
    },

    // 11. Keycloak Service - OAuth 2.0 / OpenID Connect authentication
    // Handles user authentication, token management, and SSO
    KeycloakService,
  ],
};
