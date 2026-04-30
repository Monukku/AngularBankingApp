/**
 * Card Type Union
 * Represents the type of payment card
 */
export type CardType = 'DEBIT' | 'CREDIT' | 'PREPAID';

/**
 * Card Network Enum
 * Represents the card network provider
 */
export type CardNetwork = 'VISA' | 'MASTERCARD' | 'AMEX' | 'RUPAY';

/**
 * Card Status Union
 * Represents the current status of the card
 */
export type CardStatus = 'ACTIVE' | 'INACTIVE' | 'BLOCKED' | 'EXPIRED' | 'CLOSED';

/**
 * Core Card Interface
 * Represents the fundamental card data
 */
export interface Card {
  cardId: string;
  cardNumber: string; // Only last 4 digits typically shown
  cardNetwork: CardNetwork;
  cardType: CardType;
  cardStatus: CardStatus;
  accountNumber: string;
  cardholderName: string;
  expiryDate: string; // Format: MM/YY
  cvv?: string; // Only for creation, never stored
  issueDate?: string;
  lastFourDigits: string;
}

/**
 * Card Details Interface
 * Extended card information with additional metadata
 */
export interface CardDetails extends Card {
  dailyLimit?: number;
  monthlyLimit?: number;
  availableLimit?: number;
  totalSpent?: number;
  isContactless?: boolean;
  isOnlineTxnAllowed?: boolean;
  isInternationalTxnAllowed?: boolean;
  isPinSet?: boolean;
  createdAt?: string | Date;
  updatedAt?: string | Date;
  replacementReason?: 'LOST' | 'STOLEN' | 'DAMAGED' | 'EXPIRED' | 'OTHER';
  replacementCardId?: string;
}

/**
 * Card PIN Management Interface
 * For setting or changing card PIN
 */
export interface CardPINRequest {
  cardId: string;
  oldPin?: string; // Required for change, not for initial set
  newPin: string;
  confirmPin: string;
}

/**
 * Create Card Request Interface
 * Data structure for creating new cards
 */
export interface CreateCardRequest {
  accountNumber: string;
  cardType: CardType;
  cardNetwork: CardNetwork;
  cardholderName: string;
  dailyLimit: number;
  monthlyLimit: number;
  isContactless?: boolean;
  isOnlineTxnAllowed?: boolean;
  isInternationalTxnAllowed?: boolean;
}

/**
 * Update Card Request Interface
 * Data structure for updating card settings
 */
export interface UpdateCardRequest {
  cardholderName?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  cardStatus?: CardStatus;
  isContactless?: boolean;
  isOnlineTxnAllowed?: boolean;
  isInternationalTxnAllowed?: boolean;
}

/**
 * Card Transaction Interface
 * Represents transactions made using a card
 */
export interface CardTransaction {
  transactionId: string;
  cardId: string;
  amount: number;
  currency: string;
  merchant: string;
  merchantCategory: string;
  transactionDate: string | Date;
  description: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED';
  location?: string;
}

/**
 * Card List Response Interface
 * Response from API for listing cards
 */
export interface CardListResponse {
  data: CardDetails[];
  totalCount: number;
  totalCards: number;
}

/**
 * Card Statement Interface
 * Monthly card statement
 */
export interface CardStatement {
  statementId: string;
  cardId: string;
  statementPeriod: {
    startDate: string | Date;
    endDate: string | Date;
  };
  openingBalance: number;
  transactions: CardTransaction[];
  closingBalance: number;
  totalDebits: number;
  totalCredits: number;
  interestCharged?: number;
  minimumDueAmount: number;
  totalDueAmount: number;
  dueDate: string | Date;
  pdfUrl?: string;
}

/**
 * Legacy Card Class - Backward Compatibility
 * Kept for existing code that may depend on the constructor pattern
 * DEPRECATED: Use Card interface instead
 */
export class CardClass implements Card {
  cardId: string;
  cardNumber: string;
  cardNetwork: CardNetwork;
  cardType: CardType;
  cardStatus: CardStatus;
  accountNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv?: string;
  lastFourDigits: string;

  constructor(
    cardId: string,
    cardNumber: string,
    cardNetwork: CardNetwork,
    cardType: CardType,
    cardStatus: CardStatus,
    accountNumber: string,
    cardholderName: string,
    expiryDate: string,
    lastFourDigits: string
  ) {
    this.cardId = cardId;
    this.cardNumber = cardNumber;
    this.cardNetwork = cardNetwork;
    this.cardType = cardType;
    this.cardStatus = cardStatus;
    this.accountNumber = accountNumber;
    this.cardholderName = cardholderName;
    this.expiryDate = expiryDate;
    this.lastFourDigits = lastFourDigits;
  }
}
