// core/providers/http.providers.ts
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { createAuthInterceptor } from '../interceptors/auth.interceptor';
import { createLoggingInterceptor } from '../interceptors/logging.interceptor';
import { createErrorInterceptor } from '../interceptors/error.interceptor';
import { environment } from '../../../environments/environment'; 

export function provideHttpConfig() {
  return [
    provideHttpClient(
      withFetch(),
      withInterceptors([
        createAuthInterceptor({
          excludedUrls: ['/assets', '/api/public'],
          autoRefreshToken: !environment.production,
          tokenMinValiditySeconds: environment.production ? 30 : 300,
        }),
        createLoggingInterceptor({
          logOnlyErrors: environment.production,
          logRequestBody: !environment.production,
          logResponseBody: !environment.production,
        }),
        createErrorInterceptor({
          maxRetries: environment.production ? 2 : 0,
          retryDelay: 1000,
        }),
      ])
    ),
  ];
}