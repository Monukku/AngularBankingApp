import { keycloakConfig } from './keycloak-config';

export const environment = {
  production: false,
  staging: true,
  
  // Application Info
  app: {
    name: 'RewaBank',
    version: '1.0.0-staging',
    buildNumber: '${BUILD_NUMBER}', // CI/CD will replace this
    itemsPerPage: 10,
    sessionTimeout: 900000, // 15 minutes in milliseconds
    autoRefreshInterval: 300000, // 5 minutes
  },
  
  // Keycloak Configuration
  keycloak: {
    url: 'https://auth-staging.rewabank.com',
    realm: 'rewabank-realm-staging',
    clientId: 'angular-client-staging',
    // Staging-specific settings
    enableDebug: true,
    checkLoginIframe: false,
    silentCheckSsoRedirectUri: '/assets/silent-check-sso.html',
  },
  
  // API Configuration
  api: {
    baseUrl: 'https://api-staging.rewabank.com',
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
  
  // Security Settings
  security: {
    enableCSP: true,
    enableCORS: true,
    tokenRefreshBuffer: 5, // seconds before token expiry to refresh
    maxLoginAttempts: 5,
    lockoutDuration: 300000, // 5 minutes
  },
  
  // Feature Flags
  features: {
    enableAnalytics: true,
    enablePWA: true,
    enableOfflineMode: false,
    enableDarkMode: true,
    enableNotifications: true,
    enableBiometric: false,
    enableChatSupport: true,
    enableFileUpload: true,
    maxFileSize: 5242880, // 5MB in bytes
  },
  
  // Logging Configuration
  logging: {
    level: 'info', // debug | info | warn | error
    enableConsole: true,
    enableRemote: true,
    remoteUrl: 'https://logs-staging.rewabank.com/api/logs',
    batchSize: 10,
    flushInterval: 30000, // 30 seconds
  },
  
  // Analytics
  analytics: {
    enabled: true,
    googleAnalyticsId: 'UA-XXXXXXXX-2', // Staging GA ID
    mixpanelToken: 'STAGING_MIXPANEL_TOKEN',
    trackPageViews: true,
    trackEvents: true,
  },
  
  // Error Tracking
  errorTracking: {
    enabled: true,
    sentryDsn: 'https://xxxx@sentry.io/staging',
    environment: 'staging',
    tracesSampleRate: 0.5,
  },
  
  // Cache Configuration
  cache: {
    enabled: true,
    defaultTTL: 300000, // 5 minutes
    maxSize: 50, // MB
  },
  
  // Storage
  storage: {
    prefix: 'rewabank_staging_',
    encrypt: true,
    compressionEnabled: false,
  },
  
  // Third-Party Services
  thirdParty: {
    googleMapsApiKey: 'STAGING_GOOGLE_MAPS_KEY',
    stripePublicKey: 'pk_test_staging_xxxxxxxxxx',
    twilioAccountSid: 'STAGING_TWILIO_SID',
  },
  
  // Payment Gateway
  payment: {
    gateway: 'stripe',
    testMode: true,
    currency: 'INR',
    supportedMethods: ['card', 'upi', 'netbanking'],
  },
  
  // Notification Settings
  notifications: {
    webPush: {
      enabled: true,
      vapidPublicKey: 'STAGING_VAPID_PUBLIC_KEY',
    },
    email: {
      enabled: true,
      provider: 'sendgrid',
    },
    sms: {
      enabled: true,
      provider: 'twilio',
    },
  },
  
  // Rate Limiting
  rateLimit: {
    enabled: true,
    maxRequests: 100,
    windowMs: 60000, // 1 minute
  },
  
  // Debug Options
  debug: {
    showVersionInfo: true,
    enableDevTools: true,
    mockBackend: false,
    bypassAuth: false, // WARNING: Never enable in production
  },
};