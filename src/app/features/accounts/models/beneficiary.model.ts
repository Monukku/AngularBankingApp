/**
 * Beneficiary Type Union
 * Represents the type of beneficiary
 */
export type BeneficiaryType = 'OWN_ACCOUNT' | 'INTERNAL' | 'EXTERNAL';

/**
 * Beneficiary Verification Status Union
 * Represents verification status of beneficiary
 */
export type BeneficiaryVerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'INACTIVE';

/**
 * Core Beneficiary Interface
 * Represents the fundamental beneficiary data
 */
export interface Beneficiary {
  beneficiaryId: string;
  name: string;
  accountNumber: string;
  ifscCode?: string;
  bankName?: string;
  accountHolderName: string;
  accountType?: string;
  beneficiaryType: BeneficiaryType;
  verificationStatus: BeneficiaryVerificationStatus;
  relationship?: string;
  mobileNumber?: string;
  emailAddress?: string;
  createdAt: string | Date;
}

/**
 * Beneficiary Details Interface
 * Extended beneficiary information with additional metadata
 */
export interface BeneficiaryDetails extends Beneficiary {
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  bankCode?: string;
  branchCode?: string;
  verificationDate?: string | Date;
  verificationMethod?: 'MICRO_DEPOSIT' | 'OTP' | 'DOCUMENT' | 'AUTO';
  dailyLimit?: number;
  monthlyLimit?: number;
  totalTransferred?: number;
  lastTransactionDate?: string | Date;
  remarks?: string;
  updateAt?: string | Date;
}

/**
 * Add Beneficiary Request Interface
 * Data structure for adding a new beneficiary
 */
export interface AddBeneficiaryRequest {
  name: string;
  accountNumber: string;
  ifscCode?: string;
  bankName?: string;
  accountHolderName: string;
  accountType?: string;
  beneficiaryType: BeneficiaryType;
  relationship?: string;
  mobileNumber?: string;
  emailAddress?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
}

/**
 * Update Beneficiary Request Interface
 * Data structure for updating beneficiary details
 */
export interface UpdateBeneficiaryRequest {
  name?: string;
  relationship?: string;
  mobileNumber?: string;
  emailAddress?: string;
  dailyLimit?: number;
  monthlyLimit?: number;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

/**
 * Verify Beneficiary Request Interface
 * Data structure for verifying a beneficiary
 */
export interface VerifyBeneficiaryRequest {
  beneficiaryId: string;
  verificationMethod: 'MICRO_DEPOSIT' | 'OTP' | 'DOCUMENT';
  verificationCode?: string; // For OTP verification
  documentType?: string; // For document verification
  documentNumber?: string;
}

/**
 * Beneficiary List Response Interface
 * Response from API for listing beneficiaries
 */
export interface BeneficiaryListResponse {
  data: BeneficiaryDetails[];
  totalCount: number;
  verifiedCount: number;
  pendingVerificationCount: number;
}

/**
 * Beneficiary Verification Response Interface
 * Response for beneficiary verification
 */
export interface BeneficiaryVerificationResponse {
  beneficiaryId: string;
  verificationStatus: BeneficiaryVerificationStatus;
  verificationDate?: string | Date;
  message: string;
  nextSteps?: string;
}

/**
 * Legacy Beneficiary Class - Backward Compatibility
 * Kept for existing code that may depend on the constructor pattern
 * DEPRECATED: Use Beneficiary interface instead
 */
export class BeneficiaryClass implements Beneficiary {
  beneficiaryId: string;
  name: string;
  accountNumber: string;
  accountHolderName: string;
  beneficiaryType: BeneficiaryType;
  verificationStatus: BeneficiaryVerificationStatus;
  createdAt: string | Date;
  ifscCode?: string;
  bankName?: string;

  constructor(
    beneficiaryId: string,
    name: string,
    accountNumber: string,
    accountHolderName: string,
    beneficiaryType: BeneficiaryType,
    verificationStatus: BeneficiaryVerificationStatus,
    createdAt: string | Date,
    ifscCode?: string,
    bankName?: string
  ) {
    this.beneficiaryId = beneficiaryId;
    this.name = name;
    this.accountNumber = accountNumber;
    this.accountHolderName = accountHolderName;
    this.beneficiaryType = beneficiaryType;
    this.verificationStatus = verificationStatus;
    this.createdAt = createdAt;
    this.ifscCode = ifscCode;
    this.bankName = bankName;
  }
}