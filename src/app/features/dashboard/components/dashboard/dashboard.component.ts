import {
  Component, signal, computed, inject, OnInit,
  ChangeDetectionStrategy, DestroyRef, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';
import * as shape from 'd3-shape';

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

// ngx-charts
import { NgxChartsModule } from '@swimlane/ngx-charts';

// Services & Models
import { DashboardService } from '../../services/dashboard.service';
import {
  BalanceData,
  QuickUser,
  Transaction,
  IncomeData,
  SpendingData,
  CreditCard,
  Workflow,
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
} from '../../models/dashboard.model';

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
    NgxChartsModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit {
  private dashboardService = inject(DashboardService);
  private snackBar         = inject(MatSnackBar);
  private destroyRef       = inject(DestroyRef);

  @ViewChild('incomeChartWrap')    incomeChartWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('spendingChartWrap')  spendingChartWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('cashflowChartWrap')  cashflowChartWrap?: ElementRef<HTMLDivElement>;

  // ─── Loading & error ──────────────────────────────────────────
  isLoading = this.dashboardService.isLoading;
  hasError  = signal(false);

  // ─── Chart curve ──────────────────────────────────────────────
  curve = shape.curveMonotoneX;

  // ─── Existing data signals ────────────────────────────────────
  balanceData   = signal<BalanceData | null>(null);
  quickUsers    = signal<QuickUser[]>([]);
  transactions  = signal<Transaction[]>([]);
  incomeData    = signal<IncomeData | null>(null);
  spendingData  = signal<SpendingData | null>(null);
  cards         = signal<CreditCard[]>([]);
  workflows     = signal<Workflow[]>([]);
  liveRates     = signal<LiveRate[]>([]);
  accountHealth = signal<AccountHealthScore | null>(null);

  budgetCategories = signal<BudgetCategory[]>([
    { label: 'Housing',   icon: '🏠', spent: 1840, limit: 2000, colorClass: 'violet'  },
    { label: 'Food',      icon: '🍔', spent: 380,  limit: 600,  colorClass: 'cyan'    },
    { label: 'Transport', icon: '🚗', spent: 190,  limit: 400,  colorClass: 'emerald' },
    { label: 'Shopping',  icon: '🛍️', spent: 540,  limit: 500,  colorClass: 'rose'    },
  ]);

  // ─── New widget data signals ──────────────────────────────────
  smartInsights           = signal<SmartInsight[]>([]);
  activityFeed            = signal<ActivityEvent[]>([]);
  upcomingBills           = signal<UpcomingBill[]>([]);
  recurringSubscriptions  = signal<RecurringSubscription[]>([]);
  savingsGoals            = signal<SavingsGoal[]>([]);
  monthlyReport           = signal<MonthlyReportItem[]>([]);
  spendingBreakdown       = signal<SpendingBreakdownSegment[]>([]);
  cashflowData            = signal<any[]>([]);
  cashflowSummaryData     = signal<CashflowPoint[]>([]);
  recentLogins            = signal<RecentLogin[]>([]);
  taxSummary              = signal<TaxSummaryItem[]>([]);

  // Rewards
  rewardsPointsVal   = signal(0);
  rewardsTierVal     = signal('Gold');
  rewardsTierPct     = signal(0);
  rewardsTierCurr    = signal(0);
  rewardsTierNxt     = signal(15000);
  cashbackEarnedVal  = signal(0);
  cashbackTotalVal   = signal(0);

  // Net worth
  netWorthVal       = signal(0);
  netWorthChangeVal = signal(0);
  totalAssetsVal    = signal(0);
  totalLiabsVal     = signal(0);

  // Tax
  estimatedTaxVal = signal(0);

  // Security
  securityLevelVal = signal('Strong');

  // ─── UI state ─────────────────────────────────────────────────
  searchQuery    = signal('');
  selectedPeriod = signal('Last 30 days');
  selectedCard   = signal(0);
  chartView      = signal<[number, number]>([500, 200]);
  cashflowChartView = signal<[number, number]>([500, 160]);

  // ─── Computed: existing ───────────────────────────────────────
  totalBalance = computed(() => this.balanceData()?.totalBalance ?? 0);

  savingsGoalPercent = computed(() => this.balanceData()?.savingsGoalPercent ?? 0);

  savingsRingOffset = computed(() => {
    const circumference = 201;
    return circumference - (circumference * this.savingsGoalPercent() / 100);
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
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.transactions();
    return this.transactions().filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.invoice.toLowerCase().includes(query)
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

  incomeChartData = computed(() => {
    const d = this.incomeData();
    if (!d) return [];
    return [{ name: 'Income', series: d.chartData.map(p => ({ name: p.month, value: p.value })) }];
  });

  spendingChartData = computed(() => {
    const d = this.spendingData();
    if (!d) return [];
    return [{ name: 'Spent', series: d.chartData.map(p => ({ name: p.month, value: p.value })) }];
  });

  // ─── Computed: new widgets ────────────────────────────────────

  overdueCount = computed(() =>
    this.upcomingBills().filter(b => b.urgency === 'overdue').length
  );

  subscriptionsTotal = computed(() =>
    this.recurringSubscriptions().reduce((sum, s) => sum + s.amount, 0)
  );

  spendingBreakdownTotal = computed(() =>
    this.spendingBreakdown().reduce((sum, s) => sum + s.value, 0)
  );

  cashflowSummary = computed(() => this.cashflowSummaryData());

  netWorth          = computed(() => this.netWorthVal());
  netWorthChange    = computed(() => this.netWorthChangeVal());
  totalAssets       = computed(() => this.totalAssetsVal());
  totalLiabilities  = computed(() => this.totalLiabsVal());
  assetsPercent     = computed(() => {
    const total = this.totalAssetsVal() + this.totalLiabsVal();
    return total ? Math.round((this.totalAssetsVal() / total) * 100) : 0;
  });
  liabilitiesPercent = computed(() => {
    const total = this.totalAssetsVal() + this.totalLiabsVal();
    return total ? Math.round((this.totalLiabsVal() / total) * 100) : 0;
  });

  rewardsPoints      = computed(() => this.rewardsPointsVal());
  rewardsTier        = computed(() => this.rewardsTierVal());
  rewardsTierPercent = computed(() => this.rewardsTierPct());
  rewardsTierCurrent = computed(() => this.rewardsTierCurr());
  rewardsTierNext    = computed(() => this.rewardsTierNxt());
  cashbackEarned     = computed(() => this.cashbackEarnedVal());
  cashbackTotal      = computed(() => this.cashbackTotalVal());

  estimatedTax  = computed(() => this.estimatedTaxVal());
  securityLevel = computed(() => this.securityLevelVal());
  currentYear   = computed(() => new Date().getFullYear());

  // ─── Chart options (existing) ─────────────────────────────────
  showXAxis      = true;
  showYAxis      = false;
  gradient       = false;
  showLegend     = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  timeline       = false;
  autoScale      = true;

  incomeColorScheme:    any = { domain: ['#10b981', '#059669', '#047857'] };
  spendingColorScheme:  any = { domain: ['#fbbf24', '#f59e0b', '#d97706'] };
  cashflowColorScheme:  any = { domain: ['#7c3aed', '#a78bfa', '#06b6d4'] };

  displayedColumns = ['select', 'invoice', 'transaction', 'date', 'amount', 'status'];

  // ─── Conversion state (existing) ─────────────────────────────
  conversionAmount1   = signal(238);
  conversionCurrency1 = signal('USD');
  conversionAmount2   = signal(222.13);
  conversionCurrency2 = signal('EUR');

  // ─── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDashboardData();
    this.loadLiveRates();
    this.loadAccountHealth();
    this.loadNewWidgets();
  }

  ngAfterViewInit(): void {
    setTimeout(() => this.recalcChartSize(), 0);
    const ro = new ResizeObserver(() => this.recalcChartSize());
    if (this.incomeChartWrap?.nativeElement)   ro.observe(this.incomeChartWrap.nativeElement);
    if (this.spendingChartWrap?.nativeElement) ro.observe(this.spendingChartWrap.nativeElement);
    if (this.cashflowChartWrap?.nativeElement) ro.observe(this.cashflowChartWrap.nativeElement);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  private recalcChartSize(): void {
    const el = this.incomeChartWrap?.nativeElement;
    if (el) this.chartView.set([el.offsetWidth || 500, 200]);
    const cf = this.cashflowChartWrap?.nativeElement;
    if (cf) this.cashflowChartView.set([cf.offsetWidth || 500, 160]);
  }

  // ─── Data loaders (existing) ──────────────────────────────────
  loadDashboardData(): void {
    this.hasError.set(false);
    this.dashboardService.getAllDashboardData().pipe(
      finalize(() => this.dashboardService.isLoading.set(false)),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (data) => {
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
      .subscribe({ next: rates => this.liveRates.set(rates) });
  }

  loadAccountHealth(): void {
    this.dashboardService.getAccountHealth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: health => this.accountHealth.set(health) });
  }

  reloadTransactions(): void {
    this.dashboardService.getTransactions(this.selectedPeriod())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: t => this.transactions.set(t) });
  }

  // ─── New widget loaders ───────────────────────────────────────
  private loadNewWidgets(): void {
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
        this.cashflowData.set(d.chartData);
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

  // ─── Event handlers (existing) ───────────────────────────────
  onSearchChange(event: Event): void {
    this.searchQuery.set((event.target as HTMLInputElement).value);
  }

  onPeriodChange(event: Event): void {
    this.selectedPeriod.set((event.target as HTMLSelectElement).value);
    this.reloadTransactions();
  }

  onCurrency1Change(event: Event): void {
    this.conversionCurrency1.set((event.target as HTMLSelectElement).value);
  }

  onCurrency2Change(event: Event): void {
    this.conversionCurrency2.set((event.target as HTMLSelectElement).value);
  }

  onAmount1Change(event: Event): void {
    this.conversionAmount1.set(+(event.target as HTMLInputElement).value);
  }

  onAmount2Change(event: Event): void {
    this.conversionAmount2.set(+(event.target as HTMLInputElement).value);
  }

  // ─── Actions (existing) ──────────────────────────────────────
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
    this.dashboardService
      .convertCurrency(this.conversionCurrency1(), this.conversionCurrency2(), this.conversionAmount1())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (result) => {
          this.conversionAmount2.set(result.convertedAmount);
          this.showMessage(`${this.conversionAmount1()} ${result.from} = ${result.convertedAmount} ${result.to}`);
        },
        error: () => this.showMessage('Conversion failed', 'error'),
      });
  }

  // ─── Template helpers (existing + new) ───────────────────────
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  budgetIsOver(cat: BudgetCategory): boolean {
    return cat.spent > cat.limit;
  }

  budgetPercent(cat: BudgetCategory): number {
    return Math.min((cat.spent / cat.limit) * 100, 100);
  }

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }
}