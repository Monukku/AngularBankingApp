import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, map, delay, of, shareReplay } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { ApiService } from '../../../core/services/api.service';
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
  BudgetCategory,
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

//interview resvision notes:
//@Injectable({ providedIn: 'root' }) : means this service will be a singleton and available throughout the app without needing to add it to any module's providers array.
//@Injectable({providedIn: 'platform' }): would make it available in all platforms (browser, server, web worker),
//@Injectable({providedIn: 'any' }) : creates a new instance in each lazy loaded module.
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private api = inject(ApiService);
  private readonly useMock  = environment.api.mock.enabled;
  private readonly apiBase  = environment.api.baseUrl;
  private readonly mockBase = environment.api.mock.baseUrl;
  private readonly delays   = environment.api.mock.delays;

  private url(path: string): string {
    return this.useMock ? `${this.mockBase}/${path}.json` : `${this.apiBase}/${path}`;
  }

  // Shared transaction stream — avoids duplicate HTTP calls within same render cycle
  private _txnCache$: Observable<any> | null = null;
  private getRawTransactions(size = 200): Observable<any> {
    if (!this._txnCache$) {
      this._txnCache$ = this.api.getMyTransactions({ size }).pipe(shareReplay(1));
    }
    return this._txnCache$;
  }

  clearTransactionCache(): void {
    this._txnCache$ = null;
  }

  private withDelay<T>(ms: number) {
    return (source: Observable<T>): Observable<T> =>
      this.useMock ? source.pipe(delay(ms)) : source;
  }

  // ─── Existing fetchers (unchanged) ───────────────────────────

  // GET /api/v1/accounts/my-accounts — sum all account balances
  getBalance(): Observable<BalanceData> {
    if (this.useMock) {
      return this.http.get<BalanceData>(this.url('balance')).pipe(this.withDelay(this.delays.balance));
    }
    return this.api.getMyAccounts().pipe(
      map((accounts: any[]) => {
        const total = (accounts ?? []).reduce((sum: number, a: any) => sum + (a.balance ?? 0), 0);
        return {
          totalBalance: total,
          currency: 'INR',
          lastUpdated: new Date().toISOString(),
          changePercentage: 0,
          savingsGoalPercent: 0,
        } as BalanceData;
      })
    );
  }

  // Compute income/spending from real transactions
  getIncomeSpending(): Observable<{ income: IncomeData; spending: SpendingData }> {
    if (this.useMock) {
      return of({ income: {} as IncomeData, spending: {} as SpendingData });
    }
    return this.getRawTransactions(200).pipe(
      map((res: any) => {
        const txns: any[] = res?.content ?? (Array.isArray(res) ? res : []);
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

        let totalIncome = 0, totalSpent = 0;
        let prevIncome = 0, prevSpent = 0;

        txns.forEach((t: any) => {
          const date = new Date(t.createdAt ?? t.date ?? 0);
          const amount = t.amount ?? 0;
          const isCredit = t.transactionType === 'CREDIT' || t.type === 'credit';
          if (date >= monthStart) {
            if (isCredit) totalIncome += amount; else totalSpent += amount;
          } else {
            if (isCredit) prevIncome += amount; else prevSpent += amount;
          }
        });

        const incomeChange = prevIncome > 0 ? +((totalIncome - prevIncome) / prevIncome * 100).toFixed(1) : 0;
        const spentChange  = prevSpent  > 0 ? +((totalSpent  - prevSpent)  / prevSpent  * 100).toFixed(1) : 0;

        return {
          income: { total: totalIncome, changePercentage: Math.abs(incomeChange), isPositive: incomeChange >= 0 } as IncomeData,
          spending: { total: totalSpent, changePercentage: Math.abs(spentChange), isPositive: spentChange <= 0 } as SpendingData,
        };
      })
    );
  }

  // No /quick-users endpoint — return empty array in real mode
  getQuickUsers(): Observable<QuickUser[]> {
    if (this.useMock) {
      return this.http.get<QuickUser[]>(this.url('quick-users')).pipe(this.withDelay(this.delays.quickUsers));
    }
    return of([]);
  }

  // GET /api/v1/transactions (paginated)
  getTransactions(_period?: string, searchQuery?: string): Observable<Transaction[]> {
    if (this.useMock) {
      return this.http.get<Transaction[]>(this.url('transactions')).pipe(
        this.withDelay(this.delays.transactions),
        map(transactions => {
          if (searchQuery) {
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
    return this.getRawTransactions(200).pipe(
      map((response: any) => {
        const all: any[] = response?.content ?? (Array.isArray(response) ? response : []);
        return all.slice(0, 10);
      })
    );
  }

  // No /income or /spending aggregate endpoints — return empty in real mode
  getIncomeData(_period?: string): Observable<IncomeData> {
    if (this.useMock) {
      return this.http.get<IncomeData>(this.url('income-data')).pipe(this.withDelay(this.delays.income));
    }
    return of({} as IncomeData);
  }

  getSpendingData(_period?: string): Observable<SpendingData> {
    if (this.useMock) {
      return this.http.get<SpendingData>(this.url('spending-data')).pipe(this.withDelay(this.delays.spending));
    }
    return of({} as SpendingData);
  }

  // GET /api/v1/cards/my-cards
  getCards(): Observable<CreditCard[]> {
    if (this.useMock) {
      return this.http.get<CreditCard[]>(this.url('cards')).pipe(this.withDelay(this.delays.cards));
    }
    return this.api.getMyCards() as Observable<CreditCard[]>;
  }

  // No /workflows endpoint — return empty in real mode
  getWorkflows(): Observable<Workflow[]> {
    if (this.useMock) {
      return this.http.get<Workflow[]>(this.url('workflows')).pipe(this.withDelay(this.delays.workflows));
    }
    return of([]);
  }

  // No /account/health endpoint — return static computed score in real mode
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
    return of<AccountHealthScore>({ score: 0, level: 'FAIR', recommendations: [] });
  }

  getLiveRates(): Observable<LiveRate[]> {
    // Return a single snapshot — interval causes NG0506 (app never stabilizes)
    return of(this.generateMockRates());
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
    return forkJoin({
      balance:      this.getBalance(),
      quickUsers:   this.getQuickUsers(),
      transactions: this.getTransactions(),
      income:       this.getIncomeData(),
      spending:     this.getSpendingData(),
      cards:        this.getCards(),
      workflows:    this.getWorkflows(),
    });
  }

  // ─── Mutations (unchanged) ────────────────────────────────────

  // POST /api/v1/transactions/transfer
  sendMoney(toAccountNumber: string, amount: number, fromAccountId: string, idempotencyKey: string): Observable<any> {
    if (this.useMock) {
      return new Observable(o => {
        setTimeout(() => { o.next({ success: true, message: 'Transfer successful' }); o.complete(); }, 1000);
      });
    }
    return this.api.transfer({ fromAccountId, toAccountNumber, amount }, idempotencyKey);
  }

  // requestMoney and topUp have no backend endpoints — mock only
  requestMoney(_amount: number): Observable<{ success: boolean; message: string }> {
    return new Observable(o => {
      setTimeout(() => { o.next({ success: true, message: 'Request sent' }); o.complete(); }, 1000);
    });
  }

  topUp(_amount: number): Observable<{ success: boolean; message: string }> {
    return new Observable(o => {
      setTimeout(() => { o.next({ success: true, message: 'Top-up successful' }); o.complete(); }, 1000);
    });
  }

  convertCurrency(
    from: string,
    to: string,
    amount: number
  ): Observable<{ success: boolean; rate: number; convertedAmount: number; from: string; to: string }> {
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

  // ─── NEW widget methods — all follow useMock pattern ─────────

  /**
   * GET /insights/smart
   * Mock: inline data  |  Real: GET request
   */
  getSmartInsights(): Observable<SmartInsight[]> {
    if (this.useMock) {
      return of<SmartInsight[]>([
        { id: 1, icon: '⚠️', type: 'warning', tag: 'Spending', title: 'Dining spend up 40% this month',   description: 'You\'ve spent $340 on restaurants vs $242 last month.' },
        { id: 2, icon: '✅', type: 'success', tag: 'Goal',     title: 'On track for Emergency Fund',      description: 'At this rate you\'ll hit your $10,000 goal by August.' },
        { id: 3, icon: '💡', type: 'info',    tag: 'Tip',      title: 'Unused subscriptions detected',    description: '3 subscriptions haven\'t been used in 30+ days — $42/mo.' },
        { id: 4, icon: '🔔', type: 'alert',   tag: 'Bill',     title: 'Electricity bill due in 2 days',   description: 'Estimated $128 due on 21 Feb. Sufficient balance available.' },
      ]).pipe(delay(200));
    }
    return of([]); // No /insights/smart endpoint on backend
  }

  /**
   * GET /activity/feed
   * Mock: inline data  |  Real: GET request
   */
  getActivityFeed(): Observable<ActivityEvent[]> {
    if (this.useMock) {
      return of<ActivityEvent[]>([
        { id: 1, type: 'credit', title: 'Salary received from Acme Corp',  time: '2 min ago', amount: 4200,  isCredit: true  },
        { id: 2, type: 'debit',  title: 'Netflix subscription charged',     time: '1 hr ago',  amount: 15.99, isCredit: false },
        { id: 3, type: 'credit', title: 'Refund from Amazon',               time: '3 hrs ago', amount: 49.99, isCredit: true  },
        { id: 4, type: 'debit',  title: 'Grocery store — Whole Foods',      time: '5 hrs ago', amount: 87.40, isCredit: false },
        { id: 5, type: 'login',  title: 'New login from Chrome / Windows',  time: 'Yesterday', amount: 0,     isCredit: false },
        { id: 6, type: 'debit',  title: 'Electricity bill payment',         time: 'Yesterday', amount: 128,   isCredit: false },
      ]).pipe(delay(150));
    }
    // Reuse the same transactions call (getTransactions fetches size:10) to avoid extra HTTP
    return this.getTransactions().pipe(
      map((txns: any[]) =>
        txns.slice(0, 6).map((t: any, i: number) => ({
          id: i + 1,
          type: t.transactionType === 'CREDIT' ? 'credit' : 'debit',
          title: t.description || t.transactionType,
          time: t.createdAt ?? t.date,
          amount: t.amount,
          isCredit: t.transactionType === 'CREDIT',
        })) as ActivityEvent[]
      )
    );
  }

  /**
   * GET /bills/upcoming
   * Mock: inline data  |  Real: GET request
   */
  getUpcomingBills(): Observable<UpcomingBill[]> {
    if (this.useMock) {
      const now = new Date();
      const d   = (offset: number) => new Date(now.getTime() + offset * 86_400_000).toISOString();
      return of<UpcomingBill[]>([
        { id: 1, icon: '⚡', name: 'Electricity',   dueDate: d(-1), amount: 128,  urgency: 'overdue'  },
        { id: 2, icon: '📱', name: 'Phone Plan',    dueDate: d(0),  amount: 45,   urgency: 'today'    },
        { id: 3, icon: '🌐', name: 'Internet',      dueDate: d(3),  amount: 60,   urgency: 'upcoming' },
        { id: 4, icon: '🏠', name: 'Rent',          dueDate: d(7),  amount: 1800, urgency: 'upcoming' },
        { id: 5, icon: '🚗', name: 'Car Insurance', dueDate: d(12), amount: 220,  urgency: 'upcoming' },
      ]).pipe(delay(200));
    }
    return of([]); // No /bills/upcoming endpoint on backend
  }

  /**
   * GET /subscriptions/recurring
   * Mock: inline data  |  Real: GET request
   */
  getRecurringSubscriptions(): Observable<RecurringSubscription[]> {
    if (this.useMock) {
      const now = new Date();
      const d   = (offset: number) => new Date(now.getTime() + offset * 86_400_000).toISOString();
      return of<RecurringSubscription[]>([
        { id: 1, icon: '🎬', name: 'Netflix',        nextDate: d(3),  amount: 15.99 },
        { id: 2, icon: '🎵', name: 'Spotify',        nextDate: d(7),  amount: 9.99  },
        { id: 3, icon: '☁️', name: 'iCloud Storage', nextDate: d(10), amount: 2.99  },
        { id: 4, icon: '🏋️', name: 'Gym Membership', nextDate: d(14), amount: 49.00 },
        { id: 5, icon: '🤖', name: 'ChatGPT Plus',   nextDate: d(18), amount: 20.00 },
      ]).pipe(delay(150));
    }
    return of([]); // No /subscriptions/recurring endpoint on backend
  }

  /**
   * GET /savings/goals
   * Mock: inline data  |  Real: GET request
   */
  getSavingsGoals(): Observable<SavingsGoal[]> {
    if (this.useMock) {
      return of<SavingsGoal[]>([
        { id: 1, icon: '🏖️', name: 'Vacation Fund',      saved: 2400,  target: 5000,  deadline: '2025-08-01', color: 'cyan'    },
        { id: 2, icon: '🚨', name: 'Emergency Fund',      saved: 7200,  target: 10000, deadline: '2025-12-01', color: 'violet'  },
        { id: 3, icon: '💻', name: 'New MacBook',         saved: 800,   target: 2500,  deadline: '2025-06-01', color: 'emerald' },
        { id: 4, icon: '🏠', name: 'House Down Payment',  saved: 18000, target: 60000, deadline: '2027-01-01', color: 'amber'   },
      ]).pipe(delay(200));
    }
    return of([]); // No /savings/goals endpoint on backend
  }

  /**
   * GET /reports/monthly
   * Mock: computed inline  |  Real: GET request
   */
  getMonthlyReport(): Observable<MonthlyReportItem[]> {
    if (this.useMock) {
      const months   = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      const now      = new Date();
      const incomes  = [5200, 4800, 5500, 5100, 5800, 5400];
      const expenses = [3800, 4100, 3600, 4400, 3900, 4200];
      const maxVal   = Math.max(...incomes, ...expenses);
      const items: MonthlyReportItem[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const idx  = 5 - i;
        items.push({
          label:          months[date.getMonth()],
          income:         incomes[idx],
          expense:        expenses[idx],
          incomePercent:  Math.round((incomes[idx]  / maxVal) * 100),
          expensePercent: Math.round((expenses[idx] / maxVal) * 100),
        });
      }
      return of(items).pipe(delay(300));
    }
    return of([]); // No /reports/monthly endpoint on backend
  }

  /**
   * GET /spending/breakdown
   * Mock: computed inline  |  Real: GET request
   * NOTE: When real API is used it should return pre-computed dashArray/dashOffset,
   *       OR you can keep the SVG computation here client-side by mapping the raw
   *       { label, value } array through buildBreakdownSegments().
   */
  getSpendingBreakdown(): Observable<SpendingBreakdownSegment[]> {
    if (this.useMock) {
      const categories = [
        { label: 'Housing',   value: 1840, color: '#7c3aed' },
        { label: 'Food',      value: 380,  color: '#06b6d4' },
        { label: 'Transport', value: 190,  color: '#10b981' },
        { label: 'Shopping',  value: 540,  color: '#f43f5e' },
        { label: 'Health',    value: 120,  color: '#f59e0b' },
        { label: 'Other',     value: 230,  color: '#8b8fa8' },
      ];
      return of(this.buildBreakdownSegments(categories)).pipe(delay(200));
    }
    return of([]); // No /spending/breakdown endpoint on backend
  }

  /** Shared SVG donut calculation — used by both mock and real paths */
  private buildBreakdownSegments(
    categories: { label: string; value: number; color: string }[]
  ): SpendingBreakdownSegment[] {
    const total         = categories.reduce((s, c) => s + c.value, 0);
    const circumference = 2 * Math.PI * 45; // r = 45 → ≈ 282.74
    let offset          = 0;

    return categories.map(cat => {
      const pct  = cat.value / total;
      const dash = pct * circumference;
      const gap  = circumference - dash;
      const seg: SpendingBreakdownSegment = {
        label:      cat.label,
        value:      cat.value,
        percent:    Math.round(pct * 100),
        color:      cat.color,
        dashArray:  `${dash.toFixed(2)} ${gap.toFixed(2)}`,
        dashOffset: `${-offset.toFixed(2)}`,
      };
      offset += dash;
      return seg;
    });
  }

  /**
   * GET /cashflow/forecast
   * Mock: computed inline  |  Real: GET request
   * NOTE: Real API should return { chartData: NgxChartsSeriesItem[], summary: CashflowPoint[] }
   */
  getCashflowData(): Observable<{ chartData: any[]; summary: CashflowPoint[] }> {
    if (this.useMock) {
      const now  = new Date();
      let balance = 12400;

      const series = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() + i + 1);
        const name = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        balance += (Math.random() * 400 - 150);
        if (i === 6)  balance -= 1800; // rent
        if (i === 14) balance += 4200; // salary
        if (i === 21) balance -= 220;  // insurance
        return { name, value: Math.round(balance) };
      });

      return of({
        chartData: [{ name: 'Projected Balance', series }],
        summary: [
          { label: 'Current',    value: 12400,                    isPositive: true  },
          { label: 'In 30 days', value: Math.round(balance),      isPositive: balance > 12400 },
          { label: 'Lowest',     value: Math.min(...series.map(s => s.value)), isPositive: true },
        ],
      }).pipe(delay(250));
    }
    return of({ chartData: [], summary: [] }); // No /cashflow/forecast endpoint on backend
  }

  /**
   * GET /net-worth
   * Mock: inline  |  Real: GET request
   */
  getNetWorth(): Observable<{ netWorth: number; change: number; assets: number; liabilities: number }> {
    if (this.useMock) {
      return of({ netWorth: 84200, change: 1840, assets: 112500, liabilities: 28300 })
        .pipe(delay(200));
    }
    return of({ netWorth: 0, change: 0, assets: 0, liabilities: 0 }); // No /net-worth endpoint on backend
  }

  /**
   * GET /security/logins
   * Mock: inline  |  Real: GET request
   */
  getRecentLogins(): Observable<RecentLogin[]> {
    if (this.useMock) {
      return of<RecentLogin[]>([
        { id: 1, deviceIcon: '💻', device: 'Chrome on Windows', location: 'Bengaluru, IN', time: 'Now',        isCurrent: true  },
        { id: 2, deviceIcon: '📱', device: 'Safari on iPhone',  location: 'Bengaluru, IN', time: '2 days ago', isCurrent: false },
        { id: 3, deviceIcon: '💻', device: 'Firefox on macOS',  location: 'Mumbai, IN',    time: '5 days ago', isCurrent: false },
      ]).pipe(delay(150));
    }
    return of([]); // No /security/logins endpoint on backend
  }

  /**
   * GET /tax/summary
   * Mock: inline  |  Real: GET request
   */
  getTaxSummary(): Observable<{ items: TaxSummaryItem[]; estimatedTax: number }> {
    if (this.useMock) {
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
    return of({ items: [], estimatedTax: 0 }); // No /tax/summary endpoint on backend
  }

  /**
   * GET /rewards
   * Mock: inline  |  Real: GET request
   */
  getRewardsData(): Observable<{
    points: number; tier: string; tierPercent: number; tierCurrent: number; tierNext: number;
    cashbackMonth: number; cashbackTotal: number;
  }> {
    if (this.useMock) {
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
    return of({ points: 0, tier: 'Bronze', tierPercent: 0, tierCurrent: 0, tierNext: 5000, cashbackMonth: 0, cashbackTotal: 0 }); // No /rewards endpoint on backend
  }

  // ─── FIX 1: Budget categories from service ────────────────────
  /**
   * GET /budget/categories
   * Mock: inline data  |  Real: GET request
   */
  getBudgetCategories(): Observable<BudgetCategory[]> {
    if (this.useMock) {
      return of<BudgetCategory[]>([
        { label: 'Housing',   icon: '🏠', spent: 1840, limit: 2000, colorClass: 'violet'  },
        { label: 'Food',      icon: '🍔', spent: 380,  limit: 600,  colorClass: 'cyan'    },
        { label: 'Transport', icon: '🚗', spent: 190,  limit: 400,  colorClass: 'emerald' },
        { label: 'Shopping',  icon: '🛍️', spent: 540,  limit: 500,  colorClass: 'rose'    },
      ]).pipe(delay(200));
    }
    return of([]); // No /budget/categories endpoint on backend
  }

  // ─── FIX 2: Period options from service ───────────────────────
  /**
   * GET /config/period-options
   * Mock: inline  |  Real: GET request
   * Drives all <select> period dropdowns — no hardcoded <option> tags in templates.
   */
  getPeriodOptions(): Observable<string[]> {
    if (this.useMock) {
      return of(['Last 30 days', 'Last 60 days', 'Last 90 days']).pipe(delay(50));
    }
    return of(['Last 30 days', 'Last 60 days', 'Last 90 days']); // No /config/period-options endpoint on backend
  }

  // ─── FIX 2: Supported currencies from service ─────────────────
  /**
   * GET /config/currencies
   * Mock: inline  |  Real: GET request
   * Drives currency <select> dropdowns — replaces hardcoded USD/EUR/GBP options.
   */
  getSupportedCurrencies(): Observable<{ code: string; flag: string; label: string }[]> {
    if (this.useMock) {
      return of([
        { code: 'USD', flag: '🇺🇸', label: 'USD' },
        { code: 'EUR', flag: '🇪🇺', label: 'EUR' },
        { code: 'GBP', flag: '🇬🇧', label: 'GBP' },
        { code: 'JPY', flag: '🇯🇵', label: 'JPY' },
        { code: 'INR', flag: '🇮🇳', label: 'INR' },
      ]).pipe(delay(50));
    }
    return of([
      { code: 'USD', flag: '🇺🇸', label: 'USD' },
      { code: 'EUR', flag: '🇪🇺', label: 'EUR' },
      { code: 'GBP', flag: '🇬🇧', label: 'GBP' },
      { code: 'INR', flag: '🇮🇳', label: 'INR' },
    ]); // No /config/currencies endpoint on backend
  }

  // ─── Load dashboard data method ───────────────────────────────
  loadDashboardData(): void {
    // This method would trigger reloading of all dashboard data
    // In a real implementation, this would emit to a subject that components subscribe to
    // For now, it's a placeholder that could be implemented with state management
  }
}