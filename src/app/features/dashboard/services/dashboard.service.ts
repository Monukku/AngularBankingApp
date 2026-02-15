import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, delay } from 'rxjs';
import {
  BalanceData,
  QuickUser,
  Transaction,
  IncomeData,
  SpendingData,
  CreditCard,
  Workflow,
  DashboardData
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  
  // Base URL - Change this when switching to real API
  private readonly USE_MOCK_DATA = true; // Set to false for real API
  private readonly MOCK_BASE_URL = 'assets/mock-data';
  private readonly API_BASE_URL = 'https://your-api.com/api'; // Your future API URL
  
  // Computed base URL
  private get baseUrl(): string {
    return this.USE_MOCK_DATA ? this.MOCK_BASE_URL : this.API_BASE_URL;
  }

  // Signal for loading state
  isLoading = signal(false);
  
  /**
   * Get balance data
   */
  getBalance(): Observable<BalanceData> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/balance.json`
      : `${this.baseUrl}/balance`;
    
    return this.http.get<BalanceData>(url).pipe(
      delay(this.USE_MOCK_DATA ? 500 : 0) // Simulate network delay for mock data
    );
  }

  /**
   * Get quick users for quick transaction
   */
  getQuickUsers(): Observable<QuickUser[]> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/quick-users.json`
      : `${this.baseUrl}/quick-users`;
    
    return this.http.get<QuickUser[]>(url).pipe(
      delay(this.USE_MOCK_DATA ? 300 : 0)
    );
  }

  /**
   * Get transactions
   */
  getTransactions(period?: string, searchQuery?: string): Observable<Transaction[]> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/transactions.json`
      : `${this.baseUrl}/transactions`;
    
    return this.http.get<Transaction[]>(url).pipe(
      delay(this.USE_MOCK_DATA ? 400 : 0),
      map(transactions => {
        // Client-side filtering for mock data
        if (searchQuery && this.USE_MOCK_DATA) {
          const query = searchQuery.toLowerCase();
          return transactions.filter(t => 
            t.name.toLowerCase().includes(query) ||
            t.category.toLowerCase().includes(query) ||
            t.invoice.toLowerCase().includes(query)
          );
        }
        return transactions;
      })
    );
  }

  /**
   * Get income data
   */
  getIncomeData(period?: string): Observable<IncomeData> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/income-data.json`
      : `${this.baseUrl}/income?period=${period || '30'}`;
    
    return this.http.get<IncomeData>(url).pipe(
      delay(this.USE_MOCK_DATA ? 350 : 0)
    );
  }

  /**
   * Get spending data
   */
  getSpendingData(period?: string): Observable<SpendingData> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/spending-data.json`
      : `${this.baseUrl}/spending?period=${period || '30'}`;
    
    return this.http.get<SpendingData>(url).pipe(
      delay(this.USE_MOCK_DATA ? 350 : 0)
    );
  }

  /**
   * Get credit cards
   */
  getCards(): Observable<CreditCard[]> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/cards.json`
      : `${this.baseUrl}/cards`;
    
    return this.http.get<CreditCard[]>(url).pipe(
      delay(this.USE_MOCK_DATA ? 300 : 0)
    );
  }

  /**
   * Get workflows
   */
  getWorkflows(): Observable<Workflow[]> {
    const url = this.USE_MOCK_DATA 
      ? `${this.baseUrl}/workflows.json`
      : `${this.baseUrl}/workflows`;
    
    return this.http.get<Workflow[]>(url).pipe(
      delay(this.USE_MOCK_DATA ? 250 : 0)
    );
  }

  /**
   * Get all dashboard data at once
   * This is useful for initial load
   */
  getAllDashboardData(): Observable<DashboardData> {
    this.isLoading.set(true);
    
    return forkJoin({
      balance: this.getBalance(),
      quickUsers: this.getQuickUsers(),
      transactions: this.getTransactions(),
      income: this.getIncomeData(),
      spending: this.getSpendingData(),
      cards: this.getCards(),
      workflows: this.getWorkflows()
    }).pipe(
      map(data => {
        this.isLoading.set(false);
        return data;
      })
    );
  }

  /**
   * Send money to quick user
   */
  sendMoney(userId: string, amount: number): Observable<any> {
    const url = `${this.API_BASE_URL}/transactions/send`;
    
    // For mock data, just return success
    if (this.USE_MOCK_DATA) {
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true, message: 'Transfer successful' });
          observer.complete();
        }, 1000);
      });
    }
    
    return this.http.post(url, { userId, amount });
  }

  /**
   * Request money
   */
  requestMoney(amount: number): Observable<any> {
    const url = `${this.API_BASE_URL}/transactions/request`;
    
    if (this.USE_MOCK_DATA) {
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true, message: 'Request sent' });
          observer.complete();
        }, 1000);
      });
    }
    
    return this.http.post(url, { amount });
  }

  /**
   * Top up account
   */
  topUp(amount: number): Observable<any> {
    const url = `${this.API_BASE_URL}/transactions/topup`;
    
    if (this.USE_MOCK_DATA) {
      return new Observable(observer => {
        setTimeout(() => {
          observer.next({ success: true, message: 'Top-up successful' });
          observer.complete();
        }, 1000);
      });
    }
    
    return this.http.post(url, { amount });
  }

  /**
   * Convert currency
   */
  convertCurrency(from: string, to: string, amount: number): Observable<any> {
    const url = `${this.API_BASE_URL}/currency/convert`;
    
    if (this.USE_MOCK_DATA) {
      // Mock conversion rates
      const rates: Record<string, Record<string, number>> = {
        'USD': { 'EUR': 0.93, 'GBP': 0.79, 'USD': 1 },
        'EUR': { 'USD': 1.08, 'GBP': 0.85, 'EUR': 1 },
        'GBP': { 'USD': 1.27, 'EUR': 1.18, 'GBP': 1 }
      };
      
      return new Observable(observer => {
        setTimeout(() => {
          const rate = rates[from]?.[to] || 1;
          observer.next({ 
            success: true, 
            rate,
            convertedAmount: amount * rate,
            from,
            to
          });
          observer.complete();
        }, 500);
      });
    }
    
    return this.http.post(url, { from, to, amount });
  }
}