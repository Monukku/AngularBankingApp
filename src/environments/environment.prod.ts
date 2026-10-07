import { keycloakConfig } from './keycloak-config';

/**
 * Production Environment Configuration
 * Used for production deployment
 */
export const environment = {
  production: true,
  
  keycloak: keycloakConfig,
  
  api: {
    baseUrl: 'https://api.rewabank.com',
    timeout: 60000,
    endpoints: {
      accounts: '/accounts',
      transactions: '/transactions',
      cards: '/cards',
      loans: '/loans',
      users: '/users',
    },
  },
  
  app: {
    name: 'RewaBank',
    version: '1.0.0',
    itemsPerPage: 10,
    sessionTimeout: 900000,
  },

    // Security Settings
  security: {
    enableCSP: true,
    enableCORS: true,
    tokenRefreshBuffer: 5, // seconds before token expiry to refresh
    maxLoginAttempts: 5,
    lockoutDuration: 300000, // 5 minutes
  },
  
  features: {
    enableAnalytics: true,
    enablePWA: true,
    enableOfflineMode: true,
  },
  
  logging: {
    level: 'error',
    enableConsole: false,
    enableRemote: true,
  },
};
