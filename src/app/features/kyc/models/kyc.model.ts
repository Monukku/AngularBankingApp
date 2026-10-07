export interface KycAddressRequest {
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface KycSubmitRequest {
  aadhaarNumber: string;
  panNumber: string;
  dateOfBirth: string; // ISO date string: YYYY-MM-DD
  address: KycAddressRequest;
}

export type DocumentType =
  | 'AADHAAR_FRONT'
  | 'AADHAAR_BACK'
  | 'PAN_CARD'
  | 'PASSPORT'
  | 'VOTER_ID'
  | 'DRIVING_LICENSE'
  | 'SELFIE'
  | 'SIGNATURE';

export type DocumentStatus = 'UPLOADED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export type KycStatus = 'PENDING' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

export interface KycDocumentResponse {
  documentId: string;
  documentType: DocumentType;
  status: DocumentStatus;
  message: string;
}
