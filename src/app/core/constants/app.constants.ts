import { environment } from '../../../environments/environment';

export class AppConstants {
  static readonly APP_NAME = environment.app.name;
  static readonly APP_VERSION = environment.app.version;
  static readonly ITEMS_PER_PAGE = environment.app.itemsPerPage;
  static readonly SESSION_TIMEOUT = environment.app.sessionTimeout;
  
  // Storage Keys
  static readonly STORAGE_KEYS = {
    USER_PREFERENCES: 'user_preferences',
    THEME: 'theme',
    LANGUAGE: 'language',
  };
  
  // Date Formats
  static readonly DATE_FORMATS = {
    DISPLAY: 'dd MMM yyyy',
    API: 'yyyy-MM-dd',
    DATETIME: 'dd MMM yyyy HH:mm',
  };
  
  // Account Types
  static readonly ACCOUNT_TYPES = {
    SAVINGS: 'savings',
    CURRENT: 'current',
    FIXED_DEPOSIT: 'fixed_deposit',
  };
  
  // Transaction Types
  static readonly TRANSACTION_TYPES = {
    CREDIT: 'credit',
    DEBIT: 'debit',
  };
}