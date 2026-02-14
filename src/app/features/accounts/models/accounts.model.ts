export interface Account {
  id: string;
  accountNumber: string;
  accountType: 'savings' | 'current' | 'fixed_deposit';
  balance: number;
  currency: string;
  status: 'active' | 'inactive' | 'frozen';
  createdAt: string;
  updatedAt: string;
}