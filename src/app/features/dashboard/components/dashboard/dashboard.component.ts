import {
  Component, signal, computed, inject, OnInit,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import type { EChartsOption } from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services & Models
import { DashboardService } from '../../services/dashboard.service';
import {
  BalanceData, QuickUser, Transaction, IncomeData, SpendingData,
  CreditCard, Workflow, LiveRate, AccountHealthScore, BudgetCategory,
  SmartInsight, ActivityEvent, UpcomingBill, RecurringSubscription,
  SavingsGoal, MonthlyReportItem, SpendingBreakdownSegment,
  CashflowPoint, RecentLogin, TaxSummaryItem,
} from '../../models/dashboard.model';

// Full echarts import — works with Angular 18+ and ngx-echarts v8+
// Tree-shaking is handled by the bundler for production builds.

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    NgxEchartsModule,      // replaces NgxChartsModule — no more [view] / ResizeObserver
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private snackBar         = inject(MatSnackBar);
  private destroyRef       = inject(DestroyRef);

  // ─── Loading & error ──────────────────────────────────────────
  isLoading = this.dashboardService.isLoading;
  hasError  = signal(false);

  // ─── Core data signals ────────────────────────────────────────
  balanceData      = signal<BalanceData | null>(null);
  quickUsers       = signal<QuickUser[]>([]);
  transactions     = signal<Transaction[]>([]);
  incomeData       = signal<IncomeData | null>(null);
  spendingData     = signal<SpendingData | null>(null);
  cards            = signal<CreditCard[]>([]);
  workflows        = signal<Workflow[]>([]);
  liveRates        = signal<LiveRate[]>([]);
  accountHealth    = signal<AccountHealthScore | null>(null);
  budgetCategories = signal<BudgetCategory[]>([]);

  // ─── New widget data signals ──────────────────────────────────
  smartInsights          = signal<SmartInsight[]>([]);
  activityFeed           = signal<ActivityEvent[]>([]);
  upcomingBills          = signal<UpcomingBill[]>([]);
  recurringSubscriptions = signal<RecurringSubscription[]>([]);
  savingsGoals           = signal<SavingsGoal[]>([]);
  monthlyReport          = signal<MonthlyReportItem[]>([]);
  spendingBreakdown      = signal<SpendingBreakdownSegment[]>([]);
  cashflowRawData        = signal<any[]>([]);
  cashflowSummaryData    = signal<CashflowPoint[]>([]);
  recentLogins           = signal<RecentLogin[]>([]);
  taxSummary             = signal<TaxSummaryItem[]>([]);

  // Rewards
  rewardsPointsVal  = signal(0);
  rewardsTierVal    = signal('Gold');
  rewardsTierPct    = signal(0);
  rewardsTierCurr   = signal(0);
  rewardsTierNxt    = signal(0);
  cashbackEarnedVal = signal(0);
  cashbackTotalVal  = signal(0);

  // Net worth
  netWorthVal       = signal(0);
  netWorthChangeVal = signal(0);
  totalAssetsVal    = signal(0);
  totalLiabsVal     = signal(0);

  // Tax / Security
  estimatedTaxVal  = signal(0);
  securityLevelVal = signal('Strong');

  // ─── UI state ─────────────────────────────────────────────────
  searchQuery         = signal('');
  selectedPeriod      = signal('Last 30 days');
  selectedCard        = signal(0);
  periodOptions       = signal<string[]>([]);
  supportedCurrencies = signal<{ code: string; flag: string; label: string }[]>([]);

  conversionAmount1   = signal(0);
  conversionCurrency1 = signal('USD');
  conversionAmount2   = signal(0);
  conversionCurrency2 = signal('EUR');

  displayedColumns = ['select', 'invoice', 'transaction', 'date', 'amount', 'status'];

  // ─── Shared palette matching your SCSS vars ───────────────────
  private readonly p = {
    violet:  '#7c3aed',
    vLight:  '#a78bfa',
    cyan:    '#06b6d4',
    emerald: '#10b981',
    grid:    'rgba(255,255,255,0.07)',
    text:    '#5a5e78',
    tooltip: '#1c1f35',
  };

  private baseStyle = {
    backgroundColor: 'transparent',
    textStyle: { color: this.p.text, fontFamily: 'DM Sans, sans-serif' },
  };

  // ─── Computed: core ───────────────────────────────────────────
  totalBalance       = computed(() => this.balanceData()?.totalBalance ?? 0);
  savingsGoalPercent = computed(() => this.balanceData()?.savingsGoalPercent ?? 0);

  savingsRingOffset = computed(() => {
    const c = 201;
    return c - (c * this.savingsGoalPercent() / 100);
  });

  statCards = computed(() => [
    {
      label: 'Total Balance', icon: '💼', color: 'violet',
      value: this.totalBalance(),
      changeLabel: `${this.balanceData()?.changePercentage ?? 0}% this month`,
      isPositive: (this.balanceData()?.changePercentage ?? 0) >= 0,
      isPercent: false,
    },
    {
      label: 'Total Spent', icon: '📤', color: 'cyan',
      value: this.spendingData()?.total ?? 0,
      changeLabel: `${this.spendingData()?.changePercentage ?? 0}% vs last`,
      isPositive: this.spendingData()?.isPositive ?? true,
      isPercent: false,
    },
    {
      label: 'Total Income', icon: '📥', color: 'emerald',
      value: this.incomeData()?.total ?? 0,
      changeLabel: `${this.incomeData()?.changePercentage ?? 0}% this month`,
      isPositive: this.incomeData()?.isPositive ?? true,
      isPercent: false,
    },
    {
      label: 'Savings Goal', icon: '🎯', color: 'rose',
      value: this.savingsGoalPercent(),
      changeLabel: 'On track',
      isPositive: true,
      isPercent: true,
    },
  ]);

  filteredTransactions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.invoice.toLowerCase().includes(q)
    );
  });

  currentCard = computed(() => {
    const list = this.cards();
    return list[this.selectedCard()] ?? list[0] ?? null;
  });

  cardLimitPercent = computed(() => {
    const card = this.currentCard();
    if (!card?.limit) return 0;
    return Math.min((card.balance / card.limit) * 100, 100);
  });

  // ─── Computed: widget helpers ─────────────────────────────────
  overdueCount = computed(() =>
    this.upcomingBills().filter(b => b.urgency === 'overdue').length
  );
  subscriptionsTotal = computed(() =>
    this.recurringSubscriptions().reduce((s, r) => s + r.amount, 0)
  );
  spendingBreakdownTotal = computed(() =>
    this.spendingBreakdown().reduce((s, r) => s + r.value, 0)
  );
  cashflowSummary    = computed(() => this.cashflowSummaryData());
  netWorth           = computed(() => this.netWorthVal());
  netWorthChange     = computed(() => this.netWorthChangeVal());
  totalAssets        = computed(() => this.totalAssetsVal());
  totalLiabilities   = computed(() => this.totalLiabsVal());
  assetsPercent      = computed(() => {
    const t = this.totalAssetsVal() + this.totalLiabsVal();
    return t ? Math.round((this.totalAssetsVal() / t) * 100) : 0;
  });
  liabilitiesPercent = computed(() => {
    const t = this.totalAssetsVal() + this.totalLiabsVal();
    return t ? Math.round((this.totalLiabsVal() / t) * 100) : 0;
  });
  rewardsPoints      = computed(() => this.rewardsPointsVal());
  rewardsTier        = computed(() => this.rewardsTierVal());
  rewardsTierPercent = computed(() => this.rewardsTierPct());
  rewardsTierCurrent = computed(() => this.rewardsTierCurr());
  rewardsTierNext    = computed(() => this.rewardsTierNxt());
  cashbackEarned     = computed(() => this.cashbackEarnedVal());
  cashbackTotal      = computed(() => this.cashbackTotalVal());
  estimatedTax       = computed(() => this.estimatedTaxVal());
  securityLevel      = computed(() => this.securityLevelVal());
  currentYear        = computed(() => new Date().getFullYear());

  // ─── Computed: ECharts options ────────────────────────────────
  // All three are computed signals so they update reactively when
  // data signals change. ECharts [autoresize]="true" handles sizing —
  // no ViewChild, no ResizeObserver, no [view] tuple needed.

  incomeChartOption = computed<EChartsOption>(() => {
    const d = this.incomeData();
    if (!d) return {};
    return {
      ...this.baseStyle,
      tooltip: this.makeTooltip(this.p.emerald),
      grid: { top: 10, right: 10, bottom: 20, left: 45 },
      xAxis: this.makeCategoryAxis(d.chartData.map(c => c.month)),
      yAxis: this.makeValueAxis(),
      series: [{
        type: 'line',
        data: d.chartData.map(c => c.value),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: this.p.emerald, width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16,185,129,0.35)' },
            { offset: 1, color: 'rgba(16,185,129,0.02)' },
          ]),
        },
      }],
    };
  });

  spendingChartOption = computed<EChartsOption>(() => {
    const d = this.spendingData();
    if (!d) return {};
    return {
      ...this.baseStyle,
      tooltip: this.makeTooltip(this.p.cyan),
      grid: { top: 10, right: 10, bottom: 20, left: 45 },
      xAxis: this.makeCategoryAxis(d.chartData.map(c => c.month)),
      yAxis: this.makeValueAxis(),
      series: [{
        type: 'line',
        data: d.chartData.map(c => c.value),
        smooth: true,
        symbol: 'none',
        lineStyle: { color: this.p.cyan, width: 2.5 },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(6,182,212,0.35)' },
            { offset: 1, color: 'rgba(6,182,212,0.02)' },
          ]),
        },
      }],
    };
  });

  cashflowChartOption = computed<EChartsOption>(() => {
    const raw    = this.cashflowRawData();
    if (!raw.length) return {};
    const series = raw[0]?.series ?? [];
    return {
      ...this.baseStyle,
      tooltip: this.makeTooltip(this.p.violet),
      grid: { top: 10, right: 10, bottom: 30, left: 55 },
      xAxis: this.makeCategoryAxis(
        series.map((s: any) => s.name),
        { interval: 4 }
      ),
      yAxis: this.makeValueAxis(),
      series: [{
        type: 'line',
        data: series.map((s: any) => s.value),
        smooth: true,
        symbol: 'none',
        lineStyle: {
          color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
            { offset: 0, color: this.p.violet },
            { offset: 1, color: this.p.cyan },
          ]),
          width: 2.5,
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(124,58,237,0.30)' },
            { offset: 1, color: 'rgba(6,182,212,0.02)' },
          ]),
        },
      }],
    };
  });

  // ─── ECharts builder helpers (DRY) ────────────────────────────
  private makeTooltip(borderColor: string) {
    return {
      trigger: 'axis' as const,
      backgroundColor: this.p.tooltip,
      borderColor,
      borderWidth: 1,
      textStyle: { color: '#f0f2ff', fontSize: 12 },
      formatter: (params: any) =>
        `${params[0].name}<br/><b>$${(params[0].value as number).toLocaleString()}</b>`,
    };
  }

  private makeCategoryAxis(data: string[], extra: Record<string, any> = {}) {
    return {
      type: 'category' as const,
      data,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: this.p.text, fontSize: 11, ...extra },
      splitLine: { show: false },
    };
  }

  private makeValueAxis() {
    return {
      type: 'value' as const,
      axisLabel: {
        color: this.p.text,
        fontSize: 11,
        formatter: (v: number) => `$${v / 1000}k`,
      },
      splitLine: { lineStyle: { color: this.p.grid } },
      axisLine: { show: false },
      axisTick: { show: false },
    };
  }

  // ─── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadConfig();
    this.loadDashboardData();
    this.loadLiveRates();
    this.loadAccountHealth();
    this.loadNewWidgets();
  }

  // ─── Config loader ────────────────────────────────────────────
  private loadConfig(): void {
    this.dashboardService.getPeriodOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(opts => {
        this.periodOptions.set(opts);
        if (opts.length) this.selectedPeriod.set(opts[0]);
      });

    this.dashboardService.getSupportedCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(currencies => {
        this.supportedCurrencies.set(currencies);
        if (currencies.length >= 2) {
          this.conversionCurrency1.set(currencies[0].code);
          this.conversionCurrency2.set(currencies[1].code);
        }
      });
  }

  // ─── Data loaders ─────────────────────────────────────────────
  loadDashboardData(): void {
    this.hasError.set(false);
    this.dashboardService.getAllDashboardData().pipe(
      finalize(() => this.dashboardService.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef),
    ).subscribe({
      next: data => {
        this.balanceData.set(data.balance);
        this.quickUsers.set(data.quickUsers);
        this.transactions.set(data.transactions);
        this.incomeData.set(data.income);
        this.spendingData.set(data.spending);
        this.cards.set(data.cards);
        this.workflows.set(data.workflows);
      },
      error: () => {
        this.hasError.set(true);
        this.showMessage('Error loading dashboard data', 'error');
      },
    });
  }

  loadLiveRates(): void {
    this.dashboardService.getLiveRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(rates => this.liveRates.set(rates));
  }

  loadAccountHealth(): void {
    this.dashboardService.getAccountHealth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(health => this.accountHealth.set(health));
  }

  reloadTransactions(): void {
    this.dashboardService.getTransactions(this.selectedPeriod())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(t => this.transactions.set(t));
  }

  private loadNewWidgets(): void {
    this.dashboardService.getBudgetCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.budgetCategories.set(d));

    this.dashboardService.getSmartInsights()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.smartInsights.set(d));

    this.dashboardService.getActivityFeed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.activityFeed.set(d));

    this.dashboardService.getUpcomingBills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.upcomingBills.set(d));

    this.dashboardService.getRecurringSubscriptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.recurringSubscriptions.set(d));

    this.dashboardService.getSavingsGoals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.savingsGoals.set(d));

    this.dashboardService.getMonthlyReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.monthlyReport.set(d));

    this.dashboardService.getSpendingBreakdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.spendingBreakdown.set(d));

    this.dashboardService.getCashflowData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.cashflowRawData.set(d.chartData);
        this.cashflowSummaryData.set(d.summary);
      });

    this.dashboardService.getNetWorth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.netWorthVal.set(d.netWorth);
        this.netWorthChangeVal.set(d.change);
        this.totalAssetsVal.set(d.assets);
        this.totalLiabsVal.set(d.liabilities);
      });

    this.dashboardService.getRecentLogins()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.recentLogins.set(d));

    this.dashboardService.getTaxSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.taxSummary.set(d.items);
        this.estimatedTaxVal.set(d.estimatedTax);
      });

    this.dashboardService.getRewardsData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.rewardsPointsVal.set(d.points);
        this.rewardsTierVal.set(d.tier);
        this.rewardsTierPct.set(d.tierPercent);
        this.rewardsTierCurr.set(d.tierCurrent);
        this.rewardsTierNxt.set(d.tierNext);
        this.cashbackEarnedVal.set(d.cashbackMonth);
        this.cashbackTotalVal.set(d.cashbackTotal);
      });
  }

  // ─── Event handlers ───────────────────────────────────────────
  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onPeriodChange(event: Event): void {
    this.selectedPeriod.set((event.target as HTMLSelectElement).value);
    this.reloadTransactions();
  }

  onCurrency1Change(event: Event): void {
    this.conversionCurrency1.set((event.target as HTMLSelectElement).value);
    this.conversionAmount2.set(0);
  }

  onCurrency2Change(event: Event): void {
    this.conversionCurrency2.set((event.target as HTMLSelectElement).value);
    this.conversionAmount2.set(0);
  }

  onAmount1Change(event: Event): void {
    this.conversionAmount1.set(+(event.target as HTMLInputElement).value);
    this.conversionAmount2.set(0);
  }

  onAmount2Change(event: Event): void {
    this.conversionAmount2.set(+(event.target as HTMLInputElement).value);
  }

  // ─── Actions ──────────────────────────────────────────────────
  onSend(): void    { this.showMessage('Send money feature'); }
  onRequest(): void { this.showMessage('Request money feature'); }
  onTopUp(): void   { this.showMessage('Top-up feature'); }
  onAddCard(): void { this.showMessage('Add new card feature'); }

  onUserClick(user: QuickUser): void {
    if (user.amount) this.showMessage(`Quick transfer to ${user.name}`);
  }

  onWorkflowClick(workflow: Workflow): void {
    this.showMessage(`Opening ${workflow.title} workflow`);
  }

  nextCard(): void {
    this.selectedCard.set((this.selectedCard() + 1) % this.cards().length);
  }

  previousCard(): void {
    const len = this.cards().length;
    this.selectedCard.set(this.selectedCard() === 0 ? len - 1 : this.selectedCard() - 1);
  }

  convert(): void {
    if (!this.conversionAmount1()) {
      this.showMessage('Please enter an amount to convert', 'error');
      return;
    }
    this.dashboardService
      .convertCurrency(this.conversionCurrency1(), this.conversionCurrency2(), this.conversionAmount1())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: result => {
          this.conversionAmount2.set(result.convertedAmount);
          this.showMessage(
            `${this.conversionAmount1()} ${result.from} = ${result.convertedAmount} ${result.to}`
          );
        },
        error: () => this.showMessage('Conversion failed', 'error'),
      });
  }

  // ─── Template helpers ─────────────────────────────────────────
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  budgetIsOver(cat: BudgetCategory): boolean { return cat.spent > cat.limit; }
  budgetPercent(cat: BudgetCategory): number  { return Math.min((cat.spent / cat.limit) * 100, 100); }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }
}