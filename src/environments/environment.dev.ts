import { keycloakConfig } from './keycloak-config';

/**
 * Development Environment Configuration
 * Used during local development and testing
 */

export const environment = {
  production: false,
  environment: 'development',

  // API Configuration
  api: {
    baseUrl: 'https://api-dev.rewabank.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
    
    // API Endpoints
    endpoints: {
      auth: '/auth',
      accounts: '/accounts',
      transactions: '/transactions',
      cards: '/cards',
      loans: '/loans',
      users: '/users',
      notifications: '/notifications',
      settings: '/settings',
    },
    
    // API Versions
    version: 'v1',
  },
  // Keycloak Configuration
  keycloak: keycloakConfig,
  cacheDuration: 300000, // Cache token for 5 minutes
  retryAttempts: 3, // Number of retry attempts for failed requests
  logLevel: 'debug', // Log level for development
  enableProfiling: true, // Enable performance profiling
  mockData: false, // Use mock data instead of API calls
};
