/**
 * Account Type Constants
 */
export type AccountType = 'SAVINGS' | 'CHECKING' | 'BUSINESS' | 'INVESTMENT';

/**
 * Account Status Constants
 */
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'CLOSED';

/**
 * Base Account Interface
 */
export interface Account {
  id?: string;
  accountNumber: string;
  accountType: AccountType;
  accountStatus: AccountStatus;
  accountCategory?: string;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

/**
 * Account Details with additional information
 */
export interface AccountDetails extends Account {
  name: string;
  email: string;
  mobileNumber: string;
  branchAddress?: string;
  accountsDto?: {
    accountNumber: string;
    branchAddress?: string;
    accountType: AccountType;
    accountCategory?: string;
    accountStatus: AccountStatus;
  };
}

/**
 * Create Account Request
 */
export interface CreateAccountRequest {
  name: string;
  email: string;
  mobileNumber: string;
  accountType: AccountType;
  accountCategory?: string;
}

/**
 * Update Account Request
 */
export interface UpdateAccountRequest {
  name?: string;
  email?: string;
  mobileNumber?: string;
  accountStatus?: AccountStatus;
  branchAddress?: string;
}

/**
 * Legacy Account Class for backward compatibility
 */
export class AccountClass {
  name: string;
  email: string;
  mobileNumber: string;

  constructor(name: string, email: string, mobileNumber: string) {
    this.name = name;
    this.email = email;
    this.mobileNumber = mobileNumber;
  }
}
