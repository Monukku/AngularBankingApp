import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

type ApiRequestBody = Record<string, unknown>;
export type ApiParams = Record<string, string | number | boolean | ReadonlyArray<string>>;
export type ApiResponse<T = unknown> = Observable<T>;

/**
 * API Service - Central API communication layer
 * All HTTP requests to backend go through this service
 * Auth interceptor automatically adds JWT token to requests
 */
@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = environment.api.baseUrl;

  // ============================================================
  // AUTH ENDPOINTS
  // ============================================================

  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  register(data: {
    fullName: string;
    email: string;
    mobileNumber: string;
    password: string;
  }): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  getProfile(): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/auth/profile`);
  }

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/auth/change-password`, data);
  }

  /**
   * Send password reset link to email
   * POST /api/v1/auth/forgot-password
   */
  forgotPassword(email: string): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/auth/forgot-password`, { email });
  }

  // ============================================================
  // CUSTOMER ENDPOINTS
  // ============================================================

  /**
   * Get all customers (admin only)
   * GET /api/v1/customers
   */
  getCustomers(params?: ApiParams): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/customers`, { params });
  }

  /**
   * Get customer by ID
   * GET /api/v1/customers/:id
   */
  getCustomer(customerId: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}`);
  }

  /**
   * Create new customer
   * POST /api/v1/customers
   */
  createCustomer(data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/customers`, data);
  }

  /**
   * Update customer
   * PUT /api/v1/customers/:id
   */
  updateCustomer(customerId: string, data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.put(`${this.baseUrl}/customers/${customerId}`, data);
  }

  // ============================================================
  // ACCOUNTS ENDPOINTS
  // ============================================================

  /**
   * Get my accounts
   * GET /api/v1/accounts/my-accounts
   */
  getMyAccounts(): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/accounts/my-accounts`);
  }

  /**
   * Get account by account number
   * GET /api/v1/accounts/:accountNumber
   */
  getAccount(accountNumber: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/accounts/${accountNumber}`);
  }

  /**
   * Get account balance
   * GET /api/v1/accounts/:accountNumber/balance
   */
  getBalance(accountNumber: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/accounts/${accountNumber}/balance`);
  }

  /**
   * Create new account
   * POST /api/v1/accounts
   */
  createAccount(data: ApiRequestBody): ApiResponse<unknown> {
    const headers = new HttpHeaders({
      'X-Customer-Id': (data as { customerId?: string }).customerId || '',
    });
    return this.http.post(`${this.baseUrl}/accounts`, data, { headers });
  }

  /**
   * Update account
   * PUT /api/v1/accounts/:accountNumber
   */
  updateAccount(accountNumber: string, data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.put(`${this.baseUrl}/accounts/${accountNumber}`, data);
  }

  /**
   * Close account
   * DELETE /api/v1/accounts/:accountNumber
   */
  closeAccount(accountNumber: string): ApiResponse<unknown> {
    return this.http.delete(`${this.baseUrl}/accounts/${accountNumber}`);
  }

  // ============================================================
  // TRANSACTIONS ENDPOINTS
  // ============================================================

  /**
   * Get my transactions
   * GET /api/v1/transactions/my-transactions
   */
  getMyTransactions(params?: ApiParams): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/transactions/my-transactions`, { params });
  }

  /**
   * Get transactions for specific account
   * GET /api/v1/transactions/account/:accountNumber
   */
  getAccountTransactions(
    accountNumber: string,
    params?: ApiParams
  ): ApiResponse<unknown> {
    return this.http.get(
      `${this.baseUrl}/transactions/account/${accountNumber}`,
      { params }
    );
  }

  /**
   * Transfer money
   * POST /api/v1/transactions/transfer
   * Requires X-Idempotency-Key header for idempotency
   */
  transfer(data: ApiRequestBody, idempotencyKey: string): ApiResponse<unknown> {
    const headers = new HttpHeaders({
      'X-Idempotency-Key': idempotencyKey,
    });
    return this.http.post(`${this.baseUrl}/transactions/transfer`, data, {
      headers,
    });
  }

  /**
   * Get transaction by ID
   * GET /api/v1/transactions/:transactionId
   */
  getTransaction(transactionId: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/transactions/${transactionId}`);
  }

  // ============================================================
  // CARDS ENDPOINTS
  // ============================================================

  /**
   * Get my cards
   * GET /api/v1/cards/my-cards
   */
  getMyCards(): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/cards/my-cards`);
  }

  /**
   * Get card by ID
   * GET /api/v1/cards/:cardId
   */
  getCard(cardId: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/cards/${cardId}`);
  }

  /**
   * Create new card
   * POST /api/v1/cards
   */
  createCard(data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/cards`, data);
  }

  /**
   * Update card
   * PUT /api/v1/cards/:cardId
   */
  updateCard(cardId: string, data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.put(`${this.baseUrl}/cards/${cardId}`, data);
  }

  /**
   * Block card
   * POST /api/v1/cards/:cardId/block
   */
  blockCard(cardId: string): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/cards/${cardId}/block`, {});
  }

  /**
   * Unblock card
   * POST /api/v1/cards/:cardId/unblock
   */
  unblockCard(cardId: string): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/cards/${cardId}/unblock`, {});
  }

  // ============================================================
  // LOANS ENDPOINTS
  // ============================================================

  /**
   * Get my loans
   * GET /api/v1/loans/my-loans
   */
  getMyLoans(): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/loans/my-loans`);
  }

  /**
   * Get loan by ID
   * GET /api/v1/loans/:loanId
   */
  getLoan(loanId: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/loans/${loanId}`);
  }

  /**
   * Apply for loan
   * POST /api/v1/loans/apply
   */
  applyLoan(data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/loans/apply`, data);
  }

  /**
   * Get loan repayment schedule
   * GET /api/v1/loans/:loanId/schedule
   */
  getLoanSchedule(loanId: string): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/loans/${loanId}/schedule`);
  }

  /**
   * Make loan payment
   * POST /api/v1/loans/:loanId/payment
   */
  makeLoanPayment(loanId: string, data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/loans/${loanId}/payment`, data);
  }

  // ============================================================
  // FRAUD DETECTION ENDPOINTS
  // ============================================================

  /**
   * Check transaction for fraud
   * POST /api/v1/fraud/check
   */
  checkFraud(data: ApiRequestBody): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/fraud/check`, data);
  }

  /**
   * Report fraud transaction
   * POST /api/v1/fraud/report
   */
  reportFraud(transactionId: string, reason: string): ApiResponse<unknown> {
    return this.http.post(`${this.baseUrl}/fraud/report`, {
      transactionId,
      reason,
    });
  }

  // ============================================================
  // NOTIFICATION ENDPOINTS
  // ============================================================

  /**
   * Get my notifications
   * GET /api/v1/notifications
   */
  getNotifications(params?: ApiParams): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/notifications`, { params });
  }

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/:notificationId/read
   */
  markNotificationAsRead(notificationId: string): ApiResponse<unknown> {
    return this.http.put(
      `${this.baseUrl}/notifications/${notificationId}/read`,
      {}
    );
  }

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:notificationId
   */
  deleteNotification(notificationId: string): ApiResponse<unknown> {
    return this.http.delete(
      `${this.baseUrl}/notifications/${notificationId}`
    );
  }

  // ============================================================
  // AUDIT ENDPOINTS (Admin only)
  // ============================================================

  /**
   * Get audit logs
   * GET /api/v1/audit
   */
  getAuditLogs(params?: ApiParams): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/audit`, { params });
  }

  /**
   * Get user audit logs
   * GET /api/v1/audit/user/:userId
   */
  getUserAuditLogs(userId: string, params?: ApiParams): ApiResponse<unknown> {
    return this.http.get(`${this.baseUrl}/audit/user/${userId}`, { params });
  }
}

