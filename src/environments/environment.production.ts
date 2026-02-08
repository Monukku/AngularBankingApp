import { keycloakConfig } from './keycloakConfig';

/**
 * Production Environment Configuration
 * Used for production deployment
 */
export const environment = {
  production: true,
  environment: 'production',
  apiBaseUrl: 'https://api.rewabank.com',
  apiUrl: 'https://api.rewabank.com/rewabank',
  keycloak: {
    ...keycloakConfig,
    url: 'https://auth.rewabank.com/auth',
  },
  cacheDuration: 900000, // Cache token for 15 minutes
  retryAttempts: 1, // Minimal retries for production
  logLevel: 'error', // Only log errors in production
  enableProfiling: false, // Disable performance profiling
  mockData: false, // Use real API calls
};
