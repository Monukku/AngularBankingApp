import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Account } from '../../features/accounts/models/account.model';
import { Card } from '../../features/cards/models/card.model';
import { Loan } from '../../features/loans/models/loan.model';
import { Transaction } from '../../features/transactions/models/transaction.model';

// ── Shared response shapes ────────────────────────────────────────────────────

export interface PagedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
}

export interface BalanceResponse {
  accountNumber: string;
  balance: number;
  currency: string;
  availableBalance?: number;
}

export interface RegisterResponse {
  keycloakUserId: string;
  email: string;
  maskedMobile: string;
  message: string;
  timestamp: string;
}

export interface OtpResponse {
  success: boolean;
  message: string;
  expiresAt?: string | null;
  purpose?: string | null;
}

export interface AuthMeResponse {
  userId: string;
  email: string;
  fullName: string;
  maskedMobile: string;
  kycVerified: boolean;
  status: string;
}

export interface StaffMember {
  keycloakUserId: string;
  email: string;
  fullName: string;
  enabled: boolean;
  roles: string[];
}

export interface CustomerProfile {
  customerId: string;
  keycloakUserId: string;
  fullName: string;
  email: string;
  mobileNumber?: string;
  kycStatus: string;
  createdAt?: string;
}

export interface FraudAlert {
  alertId: string;
  accountId: string;
  alertType: string;
  severity: string;
  status: string;
  description: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface AuditLog {
  id: string;
  keycloakUserId: string;
  aggregateId: string;
  eventType: string;
  payload?: Record<string, unknown>;
  createdAt: string;
}

export interface FixedDepositResponse {
  id: string;
  sourceAccountId: string;
  depositAmount: number;
  tenureMonths: number;
  interestRate: number;
  maturityDate: string;
  status: string;
}

export interface RecurringDepositResponse {
  id: string;
  sourceAccountId: string;
  installmentAmount: number;
  tenureMonths: number;
  nextDueDate: string;
  status: string;
}

// ── Service ───────────────────────────────────────────────────────────────────

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.api.baseUrl;

  // ── AUTH ─────────────────────────────────────────────────────────────────

  register(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${this.baseUrl}/auth/register`, data);
  }

  getProfile(): Observable<AuthMeResponse> {
    return this.http.get<AuthMeResponse>(`${this.baseUrl}/auth/me`);
  }

  updateProfile(data: { firstName?: string; lastName?: string }): Observable<any> {
    return this.http.patch<any>(`${this.baseUrl}/auth/me`, data);
  }

  generateOtp(data: { purpose: string; accountId?: string }): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.baseUrl}/auth/otp/generate`, data);
  }

  verifyOtp(data: { otp: string; purpose: string }): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${this.baseUrl}/auth/otp/verify`, data);
  }

  getStaffList(): Observable<StaffMember[]> {
    return this.http.get<StaffMember[]>(`${this.baseUrl}/auth/staff`);
  }

  createStaff(data: { fullName: string; email: string; role: string; password?: string }): Observable<StaffMember> {
    return this.http.post<StaffMember>(`${this.baseUrl}/auth/staff`, data);
  }

  assignStaffRole(keycloakUserId: string, role: string): Observable<{ keycloakUserId: string; role: string }> {
    return this.http.patch<{ keycloakUserId: string; role: string }>(
      `${this.baseUrl}/auth/staff/${keycloakUserId}/roles`, { role }
    );
  }

  setStaffStatus(keycloakUserId: string, enabled: boolean): Observable<{ keycloakUserId: string; enabled: boolean }> {
    return this.http.patch<{ keycloakUserId: string; enabled: boolean }>(
      `${this.baseUrl}/auth/staff/${keycloakUserId}/status`, { enabled }
    );
  }

  // ── CUSTOMERS ────────────────────────────────────────────────────────────

  getMyCustomerProfile(): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.baseUrl}/customers/me`);
  }

  updateCustomerAddress(data: { addressLine1?: string; addressLine2?: string; city?: string; state?: string; pincode?: string; country?: string }): Observable<CustomerProfile> {
    return this.http.patch<CustomerProfile>(`${this.baseUrl}/customers/me`, data);
  }

  getCustomer(customerId: string): Observable<CustomerProfile> {
    return this.http.get<CustomerProfile>(`${this.baseUrl}/customers/${customerId}`);
  }

  searchCustomers(query: string, byEmail: boolean): Observable<CustomerProfile[]> {
    const params = byEmail ? `email=${encodeURIComponent(query)}` : `name=${encodeURIComponent(query)}`;
    return this.http.get<CustomerProfile[]>(`${this.baseUrl}/customers/search?${params}`);
  }

  // ── KYC ──────────────────────────────────────────────────────────────────

  submitKyc(data: Record<string, unknown>): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/kyc/submit`, data);
  }

  uploadKycDocument(formData: FormData): Observable<{ documentId: string; message: string }> {
    return this.http.post<{ documentId: string; message: string }>(
      `${this.baseUrl}/kyc/documents/upload`, formData
    );
  }

  startKycReview(customerId: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/kyc/${customerId}/start-review`, {});
  }

  verifyKyc(
    customerId: string,
    data: { decision: 'VERIFIED' | 'REJECTED'; rejectionReason?: string }
  ): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.baseUrl}/kyc/${customerId}/verify`, data);
  }

  getKycDocumentUrl(documentId: string): Observable<{ url: string }> {
    return this.http.get<{ url: string }>(`${this.baseUrl}/kyc/documents/${documentId}/view-url`);
  }

  getPendingKyc(): Observable<CustomerProfile[]> {
    return this.http.get<CustomerProfile[]>(`${this.baseUrl}/kyc/pending`);
  }

  // ── ACCOUNTS ─────────────────────────────────────────────────────────────

  getMyAccounts(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts/my-accounts`);
  }

  getAccount(accountId: string): Observable<Account> {
    return this.http.get<Account>(`${this.baseUrl}/accounts/${accountId}`);
  }

  getBalance(accountNumber: string): Observable<BalanceResponse> {
    return this.http.get<BalanceResponse>(`${this.baseUrl}/accounts/${accountNumber}/balance`);
  }

  createAccount(data: { accountType: string; customerId: string }): Observable<Account> {
    const headers = new HttpHeaders({ 'X-Customer-Id': data.customerId });
    const { customerId, ...body } = data;
    return this.http.post<Account>(`${this.baseUrl}/accounts`, body, { headers });
  }

  getAccountsByStatus(status: string): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.baseUrl}/accounts/status/${status}`);
  }

  activateAccount(accountId: string): Observable<Account> {
    return this.http.patch<Account>(`${this.baseUrl}/accounts/${accountId}/activate`, {});
  }

  rejectAccount(accountId: string, reason: string): Observable<Account> {
    return this.http.patch<Account>(`${this.baseUrl}/accounts/${accountId}/reject`, { reason });
  }

  freezeAccount(accountId: string, reason: string = 'Frozen by user'): Observable<Account> {
    return this.http.patch<Account>(`${this.baseUrl}/accounts/${accountId}/freeze`, { reason });
  }

  unfreezeAccount(accountId: string): Observable<Account> {
    return this.http.patch<Account>(`${this.baseUrl}/accounts/${accountId}/unfreeze`, {});
  }

  closeAccount(accountId: string): Observable<Account> {
    return this.http.patch<Account>(`${this.baseUrl}/accounts/${accountId}/close`, {});
  }

  openFixedDeposit(
    data: { sourceAccountId: string; depositAmount: number; tenureMonths: number },
    customerId: string
  ): Observable<FixedDepositResponse> {
    const headers = new HttpHeaders({ 'X-Customer-Id': customerId });
    return this.http.post<FixedDepositResponse>(`${this.baseUrl}/accounts/fixed-deposit`, data, { headers });
  }

  getMyFixedDeposits(): Observable<FixedDepositResponse[]> {
    return this.http.get<FixedDepositResponse[]>(`${this.baseUrl}/accounts/my-fixed-deposits`);
  }

  openRecurringDeposit(
    data: { sourceAccountId: string; installmentAmount: number; tenureMonths: number },
    customerId: string
  ): Observable<RecurringDepositResponse> {
    const headers = new HttpHeaders({ 'X-Customer-Id': customerId });
    return this.http.post<RecurringDepositResponse>(`${this.baseUrl}/accounts/recurring-deposit`, data, { headers });
  }

  getMyRecurringDeposits(): Observable<RecurringDepositResponse[]> {
    return this.http.get<RecurringDepositResponse[]>(`${this.baseUrl}/accounts/my-recurring-deposits`);
  }

  openSalaryAccount(data: {
    customerId: string;
    employerName: string;
    employerCode: string;
    branchCode?: string;
    ifscCode?: string;
  }): Observable<Account> {
    return this.http.post<Account>(`${this.baseUrl}/accounts/salary`, data);
  }

  // ── TRANSACTIONS ──────────────────────────────────────────────────────────

  getMyTransactions(params?: { page?: number; size?: number; sort?: string }): Observable<PagedResponse<Transaction>> {
    return this.http.get<PagedResponse<Transaction>>(`${this.baseUrl}/transactions`, { params: params as Record<string, string | number> });
  }

  getTransaction(transactionId: string): Observable<Transaction> {
    return this.http.get<Transaction>(`${this.baseUrl}/transactions/${transactionId}`);
  }

  transfer(data: Record<string, unknown>, idempotencyKey: string): Observable<Transaction> {
    const headers = new HttpHeaders({ 'X-Idempotency-Key': idempotencyKey });
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/transfer`, data, { headers });
  }

  getAllTransactions(params?: { page?: number; size?: number }): Observable<PagedResponse<Transaction>> {
    return this.http.get<PagedResponse<Transaction>>(`${this.baseUrl}/transactions/all`, { params: params as Record<string, string | number> });
  }

  reverseTransaction(transactionId: string, reason: string = 'Manual reversal'): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.baseUrl}/transactions/${transactionId}/reverse`, { reason });
  }

  // ── CARDS ────────────────────────────────────────────────────────────────

  getMyCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards/my-cards`);
  }

  getCard(cardId: string): Observable<Card> {
    return this.http.get<Card>(`${this.baseUrl}/cards/${cardId}`);
  }

  createCard(data: Record<string, unknown>, idempotencyKey?: string): Observable<Card> {
    const headers = idempotencyKey
      ? new HttpHeaders({ 'X-Idempotency-Key': idempotencyKey })
      : undefined;
    return this.http.post<Card>(`${this.baseUrl}/cards`, data, headers ? { headers } : {});
  }

  blockCard(cardId: string, data: { otp?: string; reason?: string }): Observable<Card> {
    return this.http.patch<Card>(`${this.baseUrl}/cards/${cardId}/block`, data);
  }

  unblockCard(cardId: string): Observable<Card> {
    return this.http.patch<Card>(`${this.baseUrl}/cards/${cardId}/unblock`, {});
  }

  activateCard(cardId: string): Observable<Card> {
    return this.http.patch<Card>(`${this.baseUrl}/cards/${cardId}/activate`, {});
  }

  cancelCard(cardId: string, reason: string): Observable<Card> {
    return this.http.patch<Card>(`${this.baseUrl}/cards/${cardId}/cancel`, { reason });
  }

  getAllCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards`);
  }

  getPendingCards(): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards/pending`);
  }

  getCardsByCustomer(customerId: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards/customer/${customerId}`);
  }

  getCardsByKeycloakUserId(keycloakUserId: string): Observable<Card[]> {
    return this.http.get<Card[]>(`${this.baseUrl}/cards/customer/by-user/${keycloakUserId}`);
  }

  // ── LOANS ────────────────────────────────────────────────────────────────

  getMyLoans(): Observable<Loan[]> {
    return this.http.get<Loan[]>(`${this.baseUrl}/loans/my-loans`);
  }

  getLoan(loanId: string): Observable<Loan> {
    return this.http.get<Loan>(`${this.baseUrl}/loans/${loanId}`);
  }

  applyLoan(data: Record<string, unknown>): Observable<Loan> {
    return this.http.post<Loan>(`${this.baseUrl}/loans`, data);
  }

  getAllLoans(params?: { page?: number; size?: number }): Observable<PagedResponse<Loan>> {
    return this.http.get<PagedResponse<Loan>>(`${this.baseUrl}/loans`, { params: params as Record<string, string | number> });
  }

  getLoansByStatus(status: string, params?: { page?: number; size?: number }): Observable<PagedResponse<Loan>> {
    return this.http.get<PagedResponse<Loan>>(
      `${this.baseUrl}/loans/status/${status}`, { params: params as Record<string, string | number> }
    );
  }

  startLoanReview(loanId: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/loans/${loanId}/review/start`, {});
  }

  reviewLoan(loanId: string, data: {
    decision: string;
    approvedAmount?: number;
    interestRate?: number;
    reviewNotes?: string;
    rejectionReason?: string;
  }): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/loans/${loanId}/review`, data);
  }

  disburseLoan(loanId: string): Observable<Loan> {
    return this.http.patch<Loan>(`${this.baseUrl}/loans/${loanId}/disburse`, {});
  }

  // ── FRAUD ────────────────────────────────────────────────────────────────

  getFraudAlerts(params?: { page?: number; size?: number }): Observable<PagedResponse<FraudAlert>> {
    return this.http.get<PagedResponse<FraudAlert>>(`${this.baseUrl}/fraud/alerts`, { params: params as Record<string, string | number> });
  }

  getFraudAlertsForAccount(accountId: string): Observable<FraudAlert[]> {
    return this.http.get<FraudAlert[]>(`${this.baseUrl}/fraud/alerts/account/${accountId}`);
  }

  resolveFraudAlert(
    alertId: string,
    notes: string = '',
    resolution: string = 'RESOLVED'
  ): Observable<FraudAlert> {
    return this.http.patch<FraudAlert>(`${this.baseUrl}/fraud/alerts/${alertId}/resolve`, { notes, resolution });
  }

  // ── AUDIT ────────────────────────────────────────────────────────────────

  getUserAuditLogs(userId: string, params?: Record<string, string | number>): Observable<PagedResponse<AuditLog>> {
    return this.http.get<PagedResponse<AuditLog>>(`${this.baseUrl}/audit/user/${userId}`, { params });
  }

  getAggregateAuditLogs(aggregateId: string, params?: Record<string, string | number>): Observable<PagedResponse<AuditLog>> {
    return this.http.get<PagedResponse<AuditLog>>(`${this.baseUrl}/audit/aggregate/${aggregateId}`, { params });
  }

  getAuditLogsByEventType(eventType: string, params?: Record<string, string | number>): Observable<PagedResponse<AuditLog>> {
    return this.http.get<PagedResponse<AuditLog>>(`${this.baseUrl}/audit/event-type/${eventType}`, { params });
  }

  getAuditLogsByDateRange(params: { from: string; to: string }): Observable<PagedResponse<AuditLog>> {
    return this.http.get<PagedResponse<AuditLog>>(`${this.baseUrl}/audit/date-range`, { params });
  }
}
