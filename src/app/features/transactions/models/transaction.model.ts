/**
 * Transaction Type Union
 * Represents the type of transaction performed
 */
export type TransactionType = 'DEBIT' | 'CREDIT' | 'TRANSFER' | 'WITHDRAWAL' | 'DEPOSIT';

/**
 * Transaction Status Union
 * Represents the current status of the transaction
 */
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'PROCESSING';

/**
 * Transaction Category Union
 * Represents the category or purpose of the transaction
 */
export type TransactionCategory = 
  | 'SALARY'
  | 'UTILITIES'
  | 'SHOPPING'
  | 'FOOD'
  | 'TRANSPORT'
  | 'ENTERTAINMENT'
  | 'HEALTHCARE'
  | 'EDUCATION'
  | 'TRANSFER'
  | 'WITHDRAWAL'
  | 'DEPOSIT'
  | 'OTHER';

/**
 * Core Transaction Interface
 * Represents the fundamental transaction data
 */
export interface Transaction {
  id: string;
  accountNumber: string;
  amount: number;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  category?: TransactionCategory;
  description?: string;
  date: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

/**
 * Transaction Details Interface
 * Extended transaction information with additional metadata
 */
export interface TransactionDetails extends Transaction {
  referenceNumber?: string;
  counterpartyName?: string;
  counterpartyAccount?: string;
  counterpartyBank?: string;
  fee?: number;
  exchangeRate?: number;
  notes?: string;
  attachments?: string[];
}

/**
 * Create Transaction Request Interface
 * Data structure for creating new transactions
 */
export interface CreateTransactionRequest {
  toAccountNumber: string;
  amount: number;
  transactionType: TransactionType;
  category?: TransactionCategory;
  description?: string;
  counterpartyName?: string;
}

/**
 * Update Transaction Request Interface
 * Data structure for updating transaction metadata (not amount/type)
 */
export interface UpdateTransactionRequest {
  category?: TransactionCategory;
  description?: string;
  notes?: string;
}

/**
 * Transaction Filter Criteria Interface
 * Used for filtering transactions in list views
 */
export interface TransactionFilterCriteria {
  startDate?: string | Date;
  endDate?: string | Date;
  transactionType?: TransactionType;
  transactionStatus?: TransactionStatus;
  category?: TransactionCategory;
  minAmount?: number;
  maxAmount?: number;
  searchText?: string;
}

/**
 * Transaction List Response Interface
 * Paginated transaction response from API
 */
export interface TransactionListResponse {
  data: TransactionDetails[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  hasMore: boolean;
}

/**
 * Legacy Transaction Class - Backward Compatibility
 * Kept for existing code that may depend on the constructor pattern
 * DEPRECATED: Use Transaction interface instead
 */
export class TransactionClass implements Transaction {
  id: string;
  accountNumber: string;
  amount: number;
  transactionType: TransactionType;
  transactionStatus: TransactionStatus;
  category?: TransactionCategory;
  description?: string;
  date: string | Date;
  createdAt?: string | Date;
  updatedAt?: string | Date;

  constructor(
    id: string,
    accountNumber: string,
    amount: number,
    transactionType: TransactionType,
    transactionStatus: TransactionStatus,
    date: string | Date,
    category?: TransactionCategory,
    description?: string
  ) {
    this.id = id;
    this.accountNumber = accountNumber;
    this.amount = amount;
    this.transactionType = transactionType;
    this.transactionStatus = transactionStatus;
    this.date = date;
    this.category = category;
    this.description = description;
  }
}
