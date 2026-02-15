/**
 * Loan Type Union
 * Represents the type of loan product
 */
export type LoanType = 'PERSONAL' | 'HOME' | 'AUTO' | 'EDUCATION' | 'BUSINESS' | 'GOLD';

/**
 * Loan Status Union
 * Represents the current status of the loan
 */
export type LoanStatus = 'PENDING_APPROVAL' | 'APPROVED' | 'ACTIVE' | 'CLOSED' | 'DEFAULTED' | 'REJECTED';

/**
 * EMI Status Union
 * Represents the status of EMI (Equated Monthly Installment)
 */
export type EMIStatus = 'PENDING' | 'PAID' | 'OVERDUE' | 'PARTIAL';

/**
 * Core Loan Interface
 * Represents the fundamental loan data
 */
export interface Loan {
  loanId: string;
  accountNumber: string;
  loanType: LoanType;
  loanStatus: LoanStatus;
  principalAmount: number;
  disbursedAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  currency: string;
  createdDate: string | Date;
  disbursementDate?: string | Date;
}

/**
 * Loan Details Interface
 * Extended loan information with additional metadata
 */
export interface LoanDetails extends Loan {
  approvalDate?: string | Date;
  maturityDate?: string | Date;
  outstandingBalance: number;
  totalPrincipalPaid: number;
  totalInterestPaid: number;
  totalOutstandingInterest: number;
  paidEMIs: number;
  remainingEMIs: number;
  lastEMIPaymentDate?: string | Date;
  nextEMIDueDate?: string | Date;
  preclosureAllowed?: boolean;
  preclosurePenalty?: number;
  prepaymentPenalty?: number;
  purpose?: string;
  collateral?: string;
  collateralValue?: number;
  sanctionedAmount: number;
}

/**
 * EMI Schedule Interface
 * Represents a single EMI installment schedule
 */
export interface EMISchedule {
  emiNumber: number;
  dueDate: string | Date;
  principalAmount: number;
  interestAmount: number;
  totalEMI: number;
  outstandingBalance: number;
  status: EMIStatus;
  paymentDate?: string | Date;
}

/**
 * Apply Loan Request Interface
 * Data structure for applying for a new loan
 */
export interface ApplyLoanRequest {
  loanType: LoanType;
  requestedAmount: number;
  tenureMonths: number;
  purpose: string;
  employmentType?: 'SALARIED' | 'SELF_EMPLOYED' | 'RETIRED';
  monthlyIncome?: number;
  occupationDetails?: string;
  collateral?: string;
  collateralValue?: number;
}

/**
 * Loan Approval Response Interface
 * Response containing loan approval details
 */
export interface LoanApprovalResponse {
  loanId: string;
  approvalStatus: 'APPROVED' | 'REJECTED' | 'PENDING_DOCUMENTS';
  approvalDate?: string | Date;
  sanctionedAmount: number;
  approvedTenure: number;
  approvedInterestRate: number;
  estimatedEMI: number;
  approvalReference: string;
  rejectionReason?: string;
  remarks?: string;
}

/**
 * Loan Disbursement Request Interface
 * Request for loan disbursement
 */
export interface LoanDisbursementRequest {
  loanId: string;
  accountNumber: string;
  disbursementAmount: number;
  disbursementMode: 'IMMEDIATE' | 'SCHEDULED';
  disbursementDate?: string | Date;
}

/**
 * Loan Repayment Request Interface
 * Request for making loan repayment
 */
export interface LoanRepaymentRequest {
  loanId: string;
  amount: number;
  paymentMode: 'ACCOUNT_TRANSFER' | 'CARD' | 'CHECK' | 'OTHER';
  referenceNumber?: string;
}

/**
 * Loan Statement Interface
 * Complete loan statement with transaction history
 */
export interface LoanStatement {
  statementId: string;
  loanId: string;
  statementPeriod: {
    startDate: string | Date;
    endDate: string | Date;
  };
  openingBalance: number;
  principalPaid: number;
  interestPaid: number;
  totalPaid: number;
  closingBalance: number;
  emiSchedules: EMISchedule[];
  penalties?: number;
  pdfUrl?: string;
}

/**
 * Loan Preclosure Request Interface
 * Request for early closure of loan
 */
export interface LoanPreclosureRequest {
  loanId: string;
  preclosureAmount?: number; // If not provided, full outstanding balance
  reasonForPreclosure?: string;
}

/**
 * Loan Preclosure Response Interface
 * Response containing preclosure details
 */
export interface LoanPreclosureResponse {
  loanId: string;
  preclosureAmount: number;
  penaltyAmount: number;
  totalAmount: number;
  savingsAmount: number;
  processingFee?: number;
  availableFrom: string | Date;
  approvalReference: string;
}

/**
 * Loan List Response Interface
 * Paginated loan response from API
 */
export interface LoanListResponse {
  data: LoanDetails[];
  totalCount: number;
  activeLoans: number;
  closedLoans: number;
}

/**
 * Legacy Loan Class - Backward Compatibility
 * Kept for existing code that may depend on the constructor pattern
 * DEPRECATED: Use Loan interface instead
 */
export class LoanClass implements Loan {
  loanId: string;
  accountNumber: string;
  loanType: LoanType;
  loanStatus: LoanStatus;
  principalAmount: number;
  disbursedAmount: number;
  interestRate: number;
  tenureMonths: number;
  emiAmount: number;
  currency: string;
  createdDate: string | Date;

  constructor(
    loanId: string,
    accountNumber: string,
    loanType: LoanType,
    loanStatus: LoanStatus,
    principalAmount: number,
    disbursedAmount: number,
    interestRate: number,
    tenureMonths: number,
    emiAmount: number,
    currency: string,
    createdDate: string | Date
  ) {
    this.loanId = loanId;
    this.accountNumber = accountNumber;
    this.loanType = loanType;
    this.loanStatus = loanStatus;
    this.principalAmount = principalAmount;
    this.disbursedAmount = disbursedAmount;
    this.interestRate = interestRate;
    this.tenureMonths = tenureMonths;
    this.emiAmount = emiAmount;
    this.currency = currency;
    this.createdDate = createdDate;
  }
}
