import { keycloakConfig } from "./keycloak-config";

/**
 * Test Environment Configuration
 * Used for running unit tests
 */
export const environment = {
  production: false,
  environment: 'test',
  apiBaseUrl: 'http://localhost:8811',
  apiUrl: 'http://localhost:8811/rewabank',
  keycloak: {
    keycloakConfig,
    credentials: {
      secret: 'test-secret',
    },
  },
  cacheDuration: 300000,
  retryAttempts: 1,
  logLevel: 'warn',
  enableProfiling: false,
  mockData: true, // Use mock data for tests
};
