export type AccountType = 'SAVINGS' | 'CURRENT' | 'FIXED_DEPOSIT' | 'RECURRING_DEPOSIT' | 'SALARY' | 'BUSINESS';

export type AccountStatus = 'PENDING' | 'ACTIVE' | 'DORMANT' | 'FROZEN' | 'CLOSED';

export interface Account {
  id?: string;
  accountNumber: string;
  accountType: AccountType;
  accountStatus: AccountStatus;
  balance: number;
  currency: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface AccountDetails extends Account {
  name: string;
  email: string;
  mobileNumber: string;
  branchAddress?: string;
}

export interface CreateAccountRequest {
  accountType: AccountType;
  customerId?: string;
}

export interface UpdateAccountRequest {
  accountStatus?: AccountStatus;
  branchAddress?: string;
}
