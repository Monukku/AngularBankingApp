import { keycloakConfig } from './keycloak-config';

export const environment = {
  production: false,

  // Keycloak Configuration
  keycloak: keycloakConfig,

  // API Configuration
  api: {
    baseUrl: 'http://localhost/api/v1', // ✅ API Gateway via Istio ingress (no port-forward)
    timeout: 30000,
    endpoints: {
      auth: '/auth',
      accounts: '/accounts',
      transactions: '/transactions',
      cards: '/cards',
      loans: '/loans',
      users: '/users',
      customers: '/customers',
      fraud: '/fraud',
    },
    // Mock Configuration
    mock: {
      enabled: false, // ✅ Disable mocks — use real backend
      baseUrl: 'assets/mock-data',
      delays: {
        balance: 500,
        quickUsers: 300,
        transactions: 400,
        income: 350,
        spending: 350,
        cards: 300,
        workflows: 250,
      },
    },
  },

  // App Configuration
  app: {
    name: 'RewaBank',
    version: '1.0.0',
    itemsPerPage: 10,
    sessionTimeout: 900000, // 15 minutes in ms
  },

  // Feature Flags
  features: {
    enableAnalytics: false,
    enablePWA: true,
    enableOfflineMode: false,
  },

  // Logging
  logging: {
    level: 'debug', // debug | info | warn | error
    enableConsole: true,
    enableRemote: false,
  },
};
