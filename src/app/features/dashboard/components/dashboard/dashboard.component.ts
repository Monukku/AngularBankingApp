import {
  Component, signal, computed, inject, OnInit,
  ChangeDetectionStrategy, DestroyRef, ElementRef, ViewChild, AfterViewInit
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

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
import * as shape from 'd3-shape';

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

  @ViewChild('incomeChartWrap')   incomeChartWrap?: ElementRef<HTMLDivElement>;
  @ViewChild('spendingChartWrap') spendingChartWrap?: ElementRef<HTMLDivElement>;

  // ─── Loading & error ───────────────────────────────────────────
  isLoading = this.dashboardService.isLoading;
  hasError  = signal(false);

  // ─── Chart curve ───────────────────────────────────────────────
  curve = shape.curveMonotoneX;

  // ─── Data signals ──────────────────────────────────────────────
  balanceData   = signal<BalanceData | null>(null);
  quickUsers    = signal<QuickUser[]>([]);
  transactions  = signal<Transaction[]>([]);
  incomeData    = signal<IncomeData | null>(null);
  spendingData  = signal<SpendingData | null>(null);
  cards         = signal<CreditCard[]>([]);
  workflows     = signal<Workflow[]>([]);
  liveRates     = signal<LiveRate[]>([]);
  accountHealth = signal<AccountHealthScore | null>(null);

  // ─── Budget categories — connect to API when endpoint is ready ─
  budgetCategories = signal<BudgetCategory[]>([
    { label: 'Housing',   icon: '🏠', spent: 1840, limit: 2000, colorClass: 'violet'  },
    { label: 'Food',      icon: '🍔', spent: 380,  limit: 600,  colorClass: 'cyan'    },
    { label: 'Transport', icon: '🚗', spent: 190,  limit: 400,  colorClass: 'emerald' },
    { label: 'Shopping',  icon: '🛍️', spent: 540,  limit: 500,  colorClass: 'rose'    },
  ]);

  // ─── UI state ──────────────────────────────────────────────────
  searchQuery    = signal('');
  selectedPeriod = signal('Last 30 days');
  selectedCard   = signal(0);
  chartView      = signal<[number, number]>([500, 200]);

  // ─── Computed: totals ──────────────────────────────────────────
  totalBalance = computed(() => this.balanceData()?.totalBalance ?? 0);

  // ─── Computed: savings goal — from BalanceData ─────────────────
  savingsGoalPercent = computed(() => this.balanceData()?.savingsGoalPercent ?? 0);

  // ─── Computed: savings ring stroke offset ─────────────────────
  // SVG circle circumference = 2 * π * r = 2 * π * 32 ≈ 201
  savingsRingOffset = computed(() => {
    const circumference = 201;
    return circumference - (circumference * this.savingsGoalPercent() / 100);
  });

  // ─── Computed: stat cards — fully from signals ─────────────────
  statCards = computed(() => [
    {
      label: 'Total Balance',
      icon: '💼',
      color: 'violet',
      value: this.totalBalance(),
      changeLabel: `${this.balanceData()?.changePercentage ?? 0}% this month`,
      isPositive: (this.balanceData()?.changePercentage ?? 0) >= 0,
      isPercent: false,
    },
    {
      label: 'Total Spent',
      icon: '📤',
      color: 'cyan',
      value: this.spendingData()?.total ?? 0,
      changeLabel: `${this.spendingData()?.changePercentage ?? 0}% vs last`,
      isPositive: this.spendingData()?.isPositive ?? true,
      isPercent: false,
    },
    {
      label: 'Total Income',
      icon: '📥',
      color: 'emerald',
      value: this.incomeData()?.total ?? 0,
      changeLabel: `${this.incomeData()?.changePercentage ?? 0}% this month`,
      isPositive: this.incomeData()?.isPositive ?? true,
      isPercent: false,
    },
    {
      label: 'Savings Goal',
      icon: '🎯',
      color: 'rose',
      value: this.savingsGoalPercent(),
      changeLabel: 'On track',
      isPositive: true,
      isPercent: true,
    },
  ]);

  // ─── Computed: filtered transactions ──────────────────────────
  filteredTransactions = computed(() => {
    const query = this.searchQuery().toLowerCase();
    if (!query) return this.transactions();
    return this.transactions().filter(t =>
      t.name.toLowerCase().includes(query) ||
      t.category.toLowerCase().includes(query) ||
      t.invoice.toLowerCase().includes(query)
    );
  });

  // ─── Computed: current card ────────────────────────────────────
  currentCard = computed(() => {
    const list = this.cards();
    return list[this.selectedCard()] ?? list[0] ?? null;
  });

  // ─── Computed: card limit percentage ──────────────────────────
  cardLimitPercent = computed(() => {
    const card = this.currentCard();
    if (!card?.limit) return 0;
    return Math.min((card.balance / card.limit) * 100, 100);
  });

  // ─── Computed: ngx-charts multi-series format ─────────────────
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

  // ─── Chart display options ─────────────────────────────────────
  showXAxis      = true;
  showYAxis      = false;
  gradient       = false;
  showLegend     = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  timeline       = false;
  autoScale      = true;

  incomeColorScheme:   any = { domain: ['#10b981', '#059669', '#047857'] };
  spendingColorScheme: any = { domain: ['#fbbf24', '#f59e0b', '#d97706'] };

  // ─── Table columns ─────────────────────────────────────────────
  displayedColumns = ['select', 'invoice', 'transaction', 'date', 'amount', 'status'];

  // ─── Conversion state ──────────────────────────────────────────
  conversionAmount1   = signal(238);
  conversionCurrency1 = signal('USD');
  conversionAmount2   = signal(222.13);
  conversionCurrency2 = signal('EUR');

  // ─── Lifecycle ─────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadDashboardData();
    this.loadLiveRates();
    this.loadAccountHealth();
  }

  ngAfterViewInit(): void {
    // Small timeout ensures layout is painted before measuring
    setTimeout(() => this.recalcChartSize(), 0);

    const ro = new ResizeObserver(() => this.recalcChartSize());
    if (this.incomeChartWrap?.nativeElement)   ro.observe(this.incomeChartWrap.nativeElement);
    if (this.spendingChartWrap?.nativeElement) ro.observe(this.spendingChartWrap.nativeElement);
    this.destroyRef.onDestroy(() => ro.disconnect());
  }

  private recalcChartSize(): void {
    const el = this.incomeChartWrap?.nativeElement;
    if (el) this.chartView.set([el.offsetWidth || 500, 200]);
  }

  // ─── Data loaders ──────────────────────────────────────────────
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

  // ─── Typed event handlers — no $any() ──────────────────────────
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

  // ─── Actions ───────────────────────────────────────────────────
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
          this.showMessage(
            `${this.conversionAmount1()} ${result.from} = ${result.convertedAmount} ${result.to}`
          );
        },
        error: () => this.showMessage('Conversion failed', 'error'),
      });
  }

  // ─── Template helpers ──────────────────────────────────────────
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