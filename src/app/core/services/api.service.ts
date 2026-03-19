import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

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
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/register`, data);
  }

  /**
   * Get current user profile
   * GET /api/v1/auth/profile
   */
  getProfile(): Observable<any> {
    return this.http.get(`${this.baseUrl}/auth/profile`);
  }

  /**
   * Change password
   * POST /api/v1/auth/change-password
   */
  changePassword(data: {
    currentPassword: string;
    newPassword: string;
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}/auth/change-password`, data);
  }

  // ============================================================
  // CUSTOMER ENDPOINTS
  // ============================================================

  /**
   * Get all customers (admin only)
   * GET /api/v1/customers
   */
  getCustomers(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers`, { params });
  }

  /**
   * Get customer by ID
   * GET /api/v1/customers/:id
   */
  getCustomer(customerId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/customers/${customerId}`);
  }

  /**
   * Create new customer
   * POST /api/v1/customers
   */
  createCustomer(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/customers`, data);
  }

  /**
   * Update customer
   * PUT /api/v1/customers/:id
   */
  updateCustomer(customerId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/customers/${customerId}`, data);
  }

  // ============================================================
  // ACCOUNTS ENDPOINTS
  // ============================================================

  /**
   * Get my accounts
   * GET /api/v1/accounts/my-accounts
   */
  getMyAccounts(): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts/my-accounts`);
  }

  /**
   * Get account by account number
   * GET /api/v1/accounts/:accountNumber
   */
  getAccount(accountNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts/${accountNumber}`);
  }

  /**
   * Get account balance
   * GET /api/v1/accounts/:accountNumber/balance
   */
  getBalance(accountNumber: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/accounts/${accountNumber}/balance`);
  }

  /**
   * Create new account
   * POST /api/v1/accounts
   */
  createAccount(data: any): Observable<any> {
    const headers = new HttpHeaders({
      'X-Customer-Id': data.customerId || '',
    });
    return this.http.post(`${this.baseUrl}/accounts`, data, { headers });
  }

  /**
   * Update account
   * PUT /api/v1/accounts/:accountNumber
   */
  updateAccount(accountNumber: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/accounts/${accountNumber}`, data);
  }

  /**
   * Close account
   * DELETE /api/v1/accounts/:accountNumber
   */
  closeAccount(accountNumber: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/accounts/${accountNumber}`);
  }

  // ============================================================
  // TRANSACTIONS ENDPOINTS
  // ============================================================

  /**
   * Get my transactions
   * GET /api/v1/transactions/my-transactions
   */
  getMyTransactions(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/transactions/my-transactions`, { params });
  }

  /**
   * Get transactions for specific account
   * GET /api/v1/transactions/account/:accountNumber
   */
  getAccountTransactions(
    accountNumber: string,
    params?: any
  ): Observable<any> {
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
  transfer(data: any, idempotencyKey: string): Observable<any> {
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
  getTransaction(transactionId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/transactions/${transactionId}`);
  }

  // ============================================================
  // CARDS ENDPOINTS
  // ============================================================

  /**
   * Get my cards
   * GET /api/v1/cards/my-cards
   */
  getMyCards(): Observable<any> {
    return this.http.get(`${this.baseUrl}/cards/my-cards`);
  }

  /**
   * Get card by ID
   * GET /api/v1/cards/:cardId
   */
  getCard(cardId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/cards/${cardId}`);
  }

  /**
   * Create new card
   * POST /api/v1/cards
   */
  createCard(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/cards`, data);
  }

  /**
   * Update card
   * PUT /api/v1/cards/:cardId
   */
  updateCard(cardId: string, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/cards/${cardId}`, data);
  }

  /**
   * Block card
   * POST /api/v1/cards/:cardId/block
   */
  blockCard(cardId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cards/${cardId}/block`, {});
  }

  /**
   * Unblock card
   * POST /api/v1/cards/:cardId/unblock
   */
  unblockCard(cardId: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/cards/${cardId}/unblock`, {});
  }

  // ============================================================
  // LOANS ENDPOINTS
  // ============================================================

  /**
   * Get my loans
   * GET /api/v1/loans/my-loans
   */
  getMyLoans(): Observable<any> {
    return this.http.get(`${this.baseUrl}/loans/my-loans`);
  }

  /**
   * Get loan by ID
   * GET /api/v1/loans/:loanId
   */
  getLoan(loanId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/loans/${loanId}`);
  }

  /**
   * Apply for loan
   * POST /api/v1/loans/apply
   */
  applyLoan(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loans/apply`, data);
  }

  /**
   * Get loan repayment schedule
   * GET /api/v1/loans/:loanId/schedule
   */
  getLoanSchedule(loanId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/loans/${loanId}/schedule`);
  }

  /**
   * Make loan payment
   * POST /api/v1/loans/:loanId/payment
   */
  makeLoanPayment(loanId: string, data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/loans/${loanId}/payment`, data);
  }

  // ============================================================
  // FRAUD DETECTION ENDPOINTS
  // ============================================================

  /**
   * Check transaction for fraud
   * POST /api/v1/fraud/check
   */
  checkFraud(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/fraud/check`, data);
  }

  /**
   * Report fraud transaction
   * POST /api/v1/fraud/report
   */
  reportFraud(transactionId: string, reason: string): Observable<any> {
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
  getNotifications(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/notifications`, { params });
  }

  /**
   * Mark notification as read
   * PUT /api/v1/notifications/:notificationId/read
   */
  markNotificationAsRead(notificationId: string): Observable<any> {
    return this.http.put(
      `${this.baseUrl}/notifications/${notificationId}/read`,
      {}
    );
  }

  /**
   * Delete notification
   * DELETE /api/v1/notifications/:notificationId
   */
  deleteNotification(notificationId: string): Observable<any> {
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
  getAuditLogs(params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/audit`, { params });
  }

  /**
   * Get user audit logs
   * GET /api/v1/audit/user/:userId
   */
  getUserAuditLogs(userId: string, params?: any): Observable<any> {
    return this.http.get(`${this.baseUrl}/audit/user/${userId}`, { params });
  }
}

