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
  SmartInsight,
  ActivityEvent,
  UpcomingBill,
  RecurringSubscription,
  SavingsGoal,
  MonthlyReportItem,
  SpendingBreakdownSegment,
  CashflowPoint,
  RecentLogin,
  TaxSummaryItem,
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);

  private readonly useMock  = environment.api.mock.enabled;
  private readonly apiBase  = environment.api.baseUrl;
  private readonly mockBase = environment.api.mock.baseUrl;
  private readonly delays   = environment.api.mock.delays;

  isLoading = signal(false);

  private url(path: string): string {
    return this.useMock ? `${this.mockBase}/${path}.json` : `${this.apiBase}/${path}`;
  }

  private withDelay<T>(ms: number) {
    return (source: Observable<T>): Observable<T> =>
      this.useMock ? source.pipe(delay(ms)) : source;
  }

  // ─── Existing fetchers (unchanged) ───────────────────────────

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
    return this.http.get<IncomeData>(url).pipe(this.withDelay(this.delays.income));
  }

  getSpendingData(period?: string): Observable<SpendingData> {
    const url = this.useMock
      ? this.url('spending-data')
      : `${this.apiBase}/spending?period=${period || '30'}`;
    return this.http.get<SpendingData>(url).pipe(this.withDelay(this.delays.spending));
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

  getLiveRates(): Observable<LiveRate[]> {
    if (this.useMock) {
      return new Observable<LiveRate[]>(observer => {
        const emit = () => observer.next(this.generateMockRates());
        emit();
        const id = setInterval(emit, 5000);
        return () => clearInterval(id);
      });
    }
    return this.http.get<LiveRate[]>(`${this.apiBase}/rates/live`);
  }

  private generateMockRates(): LiveRate[] {
    const nudge = (base: number, spread: number) =>
      +(base + (Math.random() * spread * 2 - spread)).toFixed(4);
    const change = () => +(Math.random() * 0.4 - 0.2).toFixed(2);
    const sparklines = ['▁▃▅▇▅▆▇', '▇▅▃▅▃▂▃', '▂▄▅▃▆▇▆', '▃▅▇▅▄▃▅', '▆▄▂▄▆▇▅'];
    const pick = () => sparklines[Math.floor(Math.random() * sparklines.length)];
    const pairs = [
      { flag: '🇪🇺', pair: 'EUR/USD', base: 1.0842, spread: 0.003 },
      { flag: '🇬🇧', pair: 'GBP/USD', base: 1.2611, spread: 0.004 },
      { flag: '🇯🇵', pair: 'JPY/USD', base: 149.82, spread: 0.15  },
    ];
    return pairs.map(r => {
      const c = change();
      return { flag: r.flag, pair: r.pair, sparkline: pick(), value: nudge(r.base, r.spread), change: c, isUp: c >= 0 };
    });
  }

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
    }).pipe(map(data => { this.isLoading.set(false); return data; }));
  }

  // ─── Mutations (unchanged) ────────────────────────────────────

  sendMoney(userId: string, amount: number): Observable<{ success: boolean; message: string }> {
    if (this.useMock) {
      return new Observable(o => { setTimeout(() => { o.next({ success: true, message: 'Transfer successful' }); o.complete(); }, 1000); });
    }
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBase}/transactions/send`, { userId, amount });
  }

  requestMoney(amount: number): Observable<{ success: boolean; message: string }> {
    if (this.useMock) {
      return new Observable(o => { setTimeout(() => { o.next({ success: true, message: 'Request sent' }); o.complete(); }, 1000); });
    }
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBase}/transactions/request`, { amount });
  }

  topUp(amount: number): Observable<{ success: boolean; message: string }> {
    if (this.useMock) {
      return new Observable(o => { setTimeout(() => { o.next({ success: true, message: 'Top-up successful' }); o.complete(); }, 1000); });
    }
    return this.http.post<{ success: boolean; message: string }>(`${this.apiBase}/transactions/topup`, { amount });
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

  // ─── New widget mock methods ──────────────────────────────────

  getSmartInsights(): Observable<SmartInsight[]> {
    return of<SmartInsight[]>([
      { id: 1, icon: '⚠️', type: 'warning', tag: 'Spending', title: 'Dining spend up 40% this month', description: 'You\'ve spent $340 on restaurants vs $242 last month.' },
      { id: 2, icon: '✅', type: 'success', tag: 'Goal',     title: 'On track for Emergency Fund',   description: 'At this rate you\'ll hit your $10,000 goal by August.' },
      { id: 3, icon: '💡', type: 'info',    tag: 'Tip',      title: 'Unused subscriptions detected', description: '3 subscriptions haven\'t been used in 30+ days — $42/mo.' },
      { id: 4, icon: '🔔', type: 'alert',   tag: 'Bill',     title: 'Electricity bill due in 2 days', description: 'Estimated $128 due on 21 Feb. Sufficient balance available.' },
    ]).pipe(delay(200));
  }

  getActivityFeed(): Observable<ActivityEvent[]> {
    return of<ActivityEvent[]>([
      { id: 1, type: 'credit', title: 'Salary received from Acme Corp',    time: '2 min ago',  amount: 4200,  isCredit: true  },
      { id: 2, type: 'debit',  title: 'Netflix subscription charged',       time: '1 hr ago',   amount: 15.99, isCredit: false },
      { id: 3, type: 'credit', title: 'Refund from Amazon',                 time: '3 hrs ago',  amount: 49.99, isCredit: true  },
      { id: 4, type: 'debit',  title: 'Grocery store — Whole Foods',        time: '5 hrs ago',  amount: 87.40, isCredit: false },
      { id: 5, type: 'login',  title: 'New login from Chrome / Windows',    time: 'Yesterday',  amount: 0,     isCredit: false },
      { id: 6, type: 'debit',  title: 'Electricity bill payment',           time: 'Yesterday',  amount: 128,   isCredit: false },
    ]).pipe(delay(150));
  }

  getUpcomingBills(): Observable<UpcomingBill[]> {
    const now = new Date();
    const d = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString();
    return of<UpcomingBill[]>([
      { id: 1, icon: '⚡', name: 'Electricity',   dueDate: d(-1),  amount: 128,  urgency: 'overdue'  },
      { id: 2, icon: '📱', name: 'Phone Plan',    dueDate: d(0),   amount: 45,   urgency: 'today'    },
      { id: 3, icon: '🌐', name: 'Internet',      dueDate: d(3),   amount: 60,   urgency: 'upcoming' },
      { id: 4, icon: '🏠', name: 'Rent',          dueDate: d(7),   amount: 1800, urgency: 'upcoming' },
      { id: 5, icon: '🚗', name: 'Car Insurance', dueDate: d(12),  amount: 220,  urgency: 'upcoming' },
    ]).pipe(delay(200));
  }

  getRecurringSubscriptions(): Observable<RecurringSubscription[]> {
    const now = new Date();
    const d = (offset: number) => new Date(now.getTime() + offset * 86400000).toISOString();
    return of<RecurringSubscription[]>([
      { id: 1, icon: '🎬', name: 'Netflix',        nextDate: d(3),  amount: 15.99 },
      { id: 2, icon: '🎵', name: 'Spotify',        nextDate: d(7),  amount: 9.99  },
      { id: 3, icon: '☁️', name: 'iCloud Storage', nextDate: d(10), amount: 2.99  },
      { id: 4, icon: '🏋️', name: 'Gym Membership', nextDate: d(14), amount: 49.00 },
      { id: 5, icon: '🤖', name: 'ChatGPT Plus',   nextDate: d(18), amount: 20.00 },
    ]).pipe(delay(150));
  }

  getSavingsGoals(): Observable<SavingsGoal[]> {
    return of<SavingsGoal[]>([
      { id: 1, icon: '🏖️', name: 'Vacation Fund',    saved: 2400,  target: 5000,  deadline: '2025-08-01', color: 'cyan'    },
      { id: 2, icon: '🚨', name: 'Emergency Fund',   saved: 7200,  target: 10000, deadline: '2025-12-01', color: 'violet'  },
      { id: 3, icon: '💻', name: 'New MacBook',      saved: 800,   target: 2500,  deadline: '2025-06-01', color: 'emerald' },
      { id: 4, icon: '🏠', name: 'House Down Payment', saved: 18000, target: 60000, deadline: '2027-01-01', color: 'amber'   },
    ]).pipe(delay(200));
  }

  getMonthlyReport(): Observable<MonthlyReportItem[]> {
    // Build last 6 months with realistic mock data
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const now = new Date();
    const items: MonthlyReportItem[] = [];
    const incomes  = [5200, 4800, 5500, 5100, 5800, 5400];
    const expenses = [3800, 4100, 3600, 4400, 3900, 4200];
    const maxVal   = Math.max(...incomes, ...expenses);

    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const idx = 5 - i;
      items.push({
        label:          months[d.getMonth()],
        income:         incomes[idx],
        expense:        expenses[idx],
        incomePercent:  Math.round((incomes[idx] / maxVal) * 100),
        expensePercent: Math.round((expenses[idx] / maxVal) * 100),
      });
    }
    return of(items).pipe(delay(300));
  }

  getSpendingBreakdown(): Observable<SpendingBreakdownSegment[]> {
    const categories = [
      { label: 'Housing',    value: 1840, color: '#7c3aed' },
      { label: 'Food',       value: 380,  color: '#06b6d4' },
      { label: 'Transport',  value: 190,  color: '#10b981' },
      { label: 'Shopping',   value: 540,  color: '#f43f5e' },
      { label: 'Health',     value: 120,  color: '#f59e0b' },
      { label: 'Other',      value: 230,  color: '#8b8fa8' },
    ];
    const total = categories.reduce((s, c) => s + c.value, 0);
    const circumference = 2 * Math.PI * 45; // r=45 → ≈ 282.74

    let offset = 0;
    const segments: SpendingBreakdownSegment[] = categories.map(cat => {
      const pct     = cat.value / total;
      const dash    = pct * circumference;
      const gap     = circumference - dash;
      const seg: SpendingBreakdownSegment = {
        label:       cat.label,
        value:       cat.value,
        percent:     Math.round(pct * 100),
        color:       cat.color,
        dashArray:   `${dash.toFixed(2)} ${gap.toFixed(2)}`,
        dashOffset:  `${-offset.toFixed(2)}`,
      };
      offset += dash;
      return seg;
    });

    return of(segments).pipe(delay(200));
  }

  getCashflowData(): Observable<{ chartData: any[]; summary: CashflowPoint[] }> {
    const now   = new Date();
    const days  = Array.from({ length: 30 }, (_, i) => {
      const d = new Date(now);
      d.setDate(d.getDate() + i + 1);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    });

    // Simulate a realistic balance curve
    let balance = 12400;
    const series = days.map((name, i) => {
      balance += (Math.random() * 400 - 150);
      if (i === 6)  balance -= 1800; // rent
      if (i === 14) balance += 4200; // salary
      if (i === 21) balance -= 220;  // insurance
      return { name, value: Math.round(balance) };
    });

    return of({
      chartData: [{ name: 'Projected Balance', series }],
      summary: [
        { label: 'Current',     value: 12400,                    isPositive: true  },
        { label: 'In 30 days',  value: Math.round(balance),      isPositive: balance > 12400 },
        { label: 'Lowest',      value: Math.min(...series.map(s => s.value)), isPositive: true },
      ],
    }).pipe(delay(250));
  }

  getNetWorth(): Observable<{ netWorth: number; change: number; assets: number; liabilities: number }> {
    return of({
      netWorth:    84200,
      change:      1840,
      assets:      112500,
      liabilities: 28300,
    }).pipe(delay(200));
  }

  getRecentLogins(): Observable<RecentLogin[]> {
    return of<RecentLogin[]>([
      { id: 1, deviceIcon: '💻', device: 'Chrome on Windows',  location: 'Bengaluru, IN', time: 'Now',        isCurrent: true  },
      { id: 2, deviceIcon: '📱', device: 'Safari on iPhone',   location: 'Bengaluru, IN', time: '2 days ago', isCurrent: false },
      { id: 3, deviceIcon: '💻', device: 'Firefox on macOS',   location: 'Mumbai, IN',    time: '5 days ago', isCurrent: false },
    ]).pipe(delay(150));
  }

  getTaxSummary(): Observable<{ items: TaxSummaryItem[]; estimatedTax: number }> {
    return of({
      items: [
        { icon: '💰', label: 'Gross Income',    value: 62400, color: 'violet'  as const },
        { icon: '🧾', label: 'Deductible Exp.', value: 8200,  color: 'cyan'    as const },
        { icon: '📊', label: 'Taxable Income',  value: 54200, color: 'emerald' as const },
        { icon: '✅', label: 'Tax Paid YTD',    value: 9800,  color: 'amber'   as const },
      ],
      estimatedTax: 13550,
    }).pipe(delay(200));
  }

  getRewardsData(): Observable<{
    points: number; tier: string; tierPercent: number; tierCurrent: number; tierNext: number;
    cashbackMonth: number; cashbackTotal: number;
  }> {
    return of({
      points:        12840,
      tier:          'Gold',
      tierPercent:   68,
      tierCurrent:   12840,
      tierNext:      15000,
      cashbackMonth: 24.60,
      cashbackTotal: 312.45,
    }).pipe(delay(150));
  }
}