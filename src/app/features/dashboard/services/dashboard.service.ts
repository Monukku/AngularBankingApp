import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, delay, of, interval, switchMap } from 'rxjs';
import { environment } from '../../../../environments/environment'; 
import {
  BalanceData,
  QuickUser,
  Transaction,
  IncomeData,
  SpendingData,
  CreditCard,
  Workflow,
  DashboardData,
  LiveRate,
  AccountHealthScore,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);

  // ─── Read everything from environment ─────────────────────────
  private readonly useMock  = environment.api.mock.enabled;
  private readonly apiBase  = environment.api.baseUrl;
  private readonly mockBase = environment.api.mock.baseUrl;
  private readonly delays   = environment.api.mock.delays;

  // ─── Global loading state ──────────────────────────────────────
  isLoading = signal(false);

  // ─── URL builder ───────────────────────────────────────────────
  private url(path: string): string {
    return this.useMock
      ? `${this.mockBase}/${path}.json`
      : `${this.apiBase}/${path}`;
  }

  // ─── Conditional delay — zero cost in production ───────────────
  private withDelay<T>(ms: number) {
    return (source: Observable<T>): Observable<T> =>
      this.useMock ? source.pipe(delay(ms)) : source;
  }

  // ───────────────────────────────────────────────────────────────
  // Fetchers
  // ───────────────────────────────────────────────────────────────

  getBalance(): Observable<BalanceData> {
    return this.http.get<BalanceData>(this.url('balance'))
      .pipe(this.withDelay(this.delays.balance));
  }

  getQuickUsers(): Observable<QuickUser[]> {
    return this.http.get<QuickUser[]>(this.url('quick-users'))
      .pipe(this.withDelay(this.delays.quickUsers));
  }

  getTransactions(period?: string, searchQuery?: string): Observable<Transaction[]> {
    const url = this.useMock
      ? this.url('transactions')
      : `${this.apiBase}/transactions${period ? `?period=${period}` : ''}${searchQuery ? `&q=${searchQuery}` : ''}`;

    return this.http.get<Transaction[]>(url).pipe(
      this.withDelay(this.delays.transactions),
      map(transactions => {
        // Client-side filter only in mock mode — real API filters server-side
        if (searchQuery && this.useMock) {
          const q = searchQuery.toLowerCase();
          return transactions.filter(t =>
            t.name.toLowerCase().includes(q) ||
            t.category.toLowerCase().includes(q) ||
            t.invoice.toLowerCase().includes(q)
          );
        }
        return transactions;
      })
    );
  }

  getIncomeData(period?: string): Observable<IncomeData> {
    const url = this.useMock
      ? this.url('income-data')
      : `${this.apiBase}/income?period=${period || '30'}`;
    return this.http.get<IncomeData>(url)
      .pipe(this.withDelay(this.delays.income));
  }

  getSpendingData(period?: string): Observable<SpendingData> {
    const url = this.useMock
      ? this.url('spending-data')
      : `${this.apiBase}/spending?period=${period || '30'}`;
    return this.http.get<SpendingData>(url)
      .pipe(this.withDelay(this.delays.spending));
  }

  getCards(): Observable<CreditCard[]> {
    return this.http.get<CreditCard[]>(this.url('cards'))
      .pipe(this.withDelay(this.delays.cards));
  }

  getWorkflows(): Observable<Workflow[]> {
    return this.http.get<Workflow[]>(this.url('workflows'))
      .pipe(this.withDelay(this.delays.workflows));
  }

  getAccountHealth(): Observable<AccountHealthScore> {
    if (this.useMock) {
      return of<AccountHealthScore>({
        score: 82,
        level: 'GOOD',
        recommendations: [
          'Reduce shopping budget by 8% to stay on target',
          'Consider moving $500 to savings this month',
          'You have 3 subscriptions that overlap — review them',
        ],
      }).pipe(delay(300));
    }
    return this.http.get<AccountHealthScore>(`${this.apiBase}/account/health`);
  }

  // ─── Live Rates ────────────────────────────────────────────────
  // Mock:  emits immediately then every 5s with randomised values
  // Prod:  swap comment to use SSE, WebSocket, or polling
  getLiveRates(): Observable<LiveRate[]> {
    if (this.useMock) {
      return new Observable<LiveRate[]>(observer => {
        const emit = () => observer.next(this.generateMockRates());
        emit(); // immediate first value
        const id = setInterval(emit, 5000);
        return () => clearInterval(id); // cleanup on unsubscribe
      });
    }

    // ── Uncomment one when your backend is ready ──────────────────

    // Option A — SSE (best for Keycloak, auth headers work natively)
    // return new Observable(observer => {
    //   const source = new EventSource(`${this.apiBase}/rates/stream`);
    //   source.onmessage = e => observer.next(JSON.parse(e.data));
    //   source.onerror   = e => observer.error(e);
    //   return () => source.close();
    // });

    // Option B — WebSocket
    // import { webSocket } from 'rxjs/webSocket';
    // return webSocket(`wss://your-api.com/rates`);

    // Option C — Polling every 5s (simplest, works with any REST backend)
    // return interval(5000).pipe(
    //   switchMap(() => this.http.get<LiveRate[]>(`${this.apiBase}/rates/live`))
    // );

    return this.http.get<LiveRate[]>(`${this.apiBase}/rates/live`);
  }

  // ─── Generates slightly randomised rates to simulate movement ──
  private generateMockRates(): LiveRate[] {
    const nudge = (base: number, spread: number) =>
      +(base + (Math.random() * spread * 2 - spread)).toFixed(4);

    const change = () =>
      +(Math.random() * 0.4 - 0.2).toFixed(2);

    const sparklines = [
      '▁▃▅▇▅▆▇', '▇▅▃▅▃▂▃', '▂▄▅▃▆▇▆', '▃▅▇▅▄▃▅', '▆▄▂▄▆▇▅',
    ];

    const pick = () => sparklines[Math.floor(Math.random() * sparklines.length)];

    const pairs = [
      { flag: '🇪🇺', pair: 'EUR/USD', base: 1.0842, spread: 0.003 },
      { flag: '🇬🇧', pair: 'GBP/USD', base: 1.2611, spread: 0.004 },
      { flag: '🇯🇵', pair: 'JPY/USD', base: 149.82, spread: 0.15  },
    ];

    return pairs.map(r => {
      const c = change();
      return {
        flag:      r.flag,
        pair:      r.pair,
        sparkline: pick(),
        value:     nudge(r.base, r.spread),
        change:    c,
        isUp:      c >= 0,
      };
    });
  }

  // ─── Aggregate load ────────────────────────────────────────────
  getAllDashboardData(): Observable<DashboardData> {
    this.isLoading.set(true);
    return forkJoin({
      balance:      this.getBalance(),
      quickUsers:   this.getQuickUsers(),
      transactions: this.getTransactions(),
      income:       this.getIncomeData(),
      spending:     this.getSpendingData(),
      cards:        this.getCards(),
      workflows:    this.getWorkflows(),
    }).pipe(
      map(data => {
        this.isLoading.set(false);
        return data;
      })
    );
  }

  // ─── Mutations ─────────────────────────────────────────────────
  sendMoney(userId: string, amount: number): Observable<{ success: boolean; message: string }> {
    if (this.useMock) {
      return new Observable(o => {
        setTimeout(() => {
          o.next({ success: true, message: 'Transfer successful' });
          o.complete();
        }, 1000);
      });
    }
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiBase}/transactions/send`, { userId, amount }
    );
  }

  requestMoney(amount: number): Observable<{ success: boolean; message: string }> {
    if (this.useMock) {
      return new Observable(o => {
        setTimeout(() => {
          o.next({ success: true, message: 'Request sent' });
          o.complete();
        }, 1000);
      });
    }
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiBase}/transactions/request`, { amount }
    );
  }

  topUp(amount: number): Observable<{ success: boolean; message: string }> {
    if (this.useMock) {
      return new Observable(o => {
        setTimeout(() => {
          o.next({ success: true, message: 'Top-up successful' });
          o.complete();
        }, 1000);
      });
    }
    return this.http.post<{ success: boolean; message: string }>(
      `${this.apiBase}/transactions/topup`, { amount }
    );
  }

  convertCurrency(from: string, to: string, amount: number): Observable<{
    success: boolean; rate: number; convertedAmount: number; from: string; to: string;
  }> {
    if (this.useMock) {
      const rates: Record<string, Record<string, number>> = {
        USD: { EUR: 0.93, GBP: 0.79, USD: 1 },
        EUR: { USD: 1.08, GBP: 0.85, EUR: 1 },
        GBP: { USD: 1.27, EUR: 1.18, GBP: 1 },
      };
      return new Observable(o => {
        setTimeout(() => {
          const rate = rates[from]?.[to] ?? 1;
          o.next({ success: true, rate, convertedAmount: +(amount * rate).toFixed(2), from, to });
          o.complete();
        }, 500);
      });
    }
    return this.http.post<any>(`${this.apiBase}/currency/convert`, { from, to, amount });
  }
}