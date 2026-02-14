import { environment } from '../../../environments/environment';

export class ApiConstants {
  // Base URL
  static readonly BASE_URL = environment.api.baseUrl;
  
  // Endpoints
  static readonly ACCOUNTS = `${this.BASE_URL}${environment.api.endpoints.accounts}`;
  static readonly TRANSACTIONS = `${this.BASE_URL}${environment.api.endpoints.transactions}`;
  static readonly CARDS = `${this.BASE_URL}${environment.api.endpoints.cards}`;
  static readonly LOANS = `${this.BASE_URL}${environment.api.endpoints.loans}`;
  static readonly USERS = `${this.BASE_URL}${environment.api.endpoints.users}`;
  
  // Specific endpoints
  static readonly ACCOUNT_BALANCE = (accountId: string) => 
    `${this.ACCOUNTS}/${accountId}/balance`;
  
  static readonly ACCOUNT_TRANSACTIONS = (accountId: string) => 
    `${this.ACCOUNTS}/${accountId}/transactions`;
  
  static readonly TRANSFER_FUNDS = `${this.TRANSACTIONS}/transfer`;
}