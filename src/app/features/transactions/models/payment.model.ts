export type PaymentMethod = 'UPI' | 'CARD';

export type PaymentStatus = 'CREATED' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

export interface PaymentOrderRequest {
  sourceAccountId: string;
  sourceAccountNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
}

export interface PaymentOrder {
  id: string;
  razorpayOrderId: string;
  razorpayKeyId: string;
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  createdAt: string;
}

/** Statuses after which the order will not change any more. */
export const FINAL_PAYMENT_STATUSES: PaymentStatus[] = ['COMPLETED', 'FAILED', 'REFUNDED'];
