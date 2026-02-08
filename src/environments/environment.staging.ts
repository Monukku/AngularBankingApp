import { keycloakConfig } from './keycloakConfig';

/**
 * Staging Environment Configuration
 * Used for QA and user acceptance testing
 */
export const environment = {
  production: false,
  environment: 'staging',
  apiBaseUrl: 'https://staging-api.rewabank.com',
  apiUrl: 'https://staging-api.rewabank.com/rewabank',
  keycloak: {
    ...keycloakConfig,
    url: 'https://staging-auth.rewabank.com/auth',
  },
  cacheDuration: 600000, // Cache token for 10 minutes
  retryAttempts: 2, // Number of retry attempts for failed requests
  logLevel: 'warn', // Log level for staging
  enableProfiling: false, // Disable performance profiling in staging
  mockData: false, // Use real API calls
};
