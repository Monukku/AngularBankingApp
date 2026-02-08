import { keycloakConfig } from './keycloakConfig';

/**
 * Development Environment Configuration
 * Used during local development and testing
 */
export const environment = {
  production: false,
  environment: 'development',
  apiBaseUrl: 'http://localhost:8811',
  apiUrl: 'http://localhost:8811/rewabank',
  keycloak: keycloakConfig,
  cacheDuration: 300000, // Cache token for 5 minutes
  retryAttempts: 3, // Number of retry attempts for failed requests
  logLevel: 'debug', // Log level for development
  enableProfiling: true, // Enable performance profiling
  mockData: false, // Use mock data instead of API calls
};
