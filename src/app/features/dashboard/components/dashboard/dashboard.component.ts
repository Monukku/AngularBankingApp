import {
  Component, signal, computed, inject, OnInit,
  ChangeDetectionStrategy, DestroyRef,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Angular Material
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Services
import { DashboardService } from '../../services/dashboard.service';
import { DashboardStateService } from '../../services/dashboard-state.service';

// Components
import { BalanceWidgetComponent } from '../balance-widget/balance-widget.component';
import { StatsCardsComponent } from '../stats-cards/stats-cards.component';
import { TransactionListWidgetComponent } from '../transaction-list-widget/transaction-list-widget.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,

    // Custom components
    BalanceWidgetComponent,
    StatsCardsComponent,
    TransactionListWidgetComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private stateService = inject(DashboardStateService);
  private snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  // ─── Loading & UI State ───────────────────────────────────────
  isLoading = signal(false);

  // ─── Currency Conversion ──────────────────────────────────────
  conversionAmount1 = signal(0);
  conversionCurrency1 = signal('USD');
  conversionAmount2 = signal(0);
  conversionCurrency2 = signal('EUR');

  // ─── Lifecycle ────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadAllData();
  }

  // ─── Data Loading ─────────────────────────────────────────────
  private loadAllData(): void {
    this.isLoading.set(true);
    this.stateService.hasError.set(false);

    // Load core dashboard data
    this.loadCoreData();
    // Load config and settings
    this.loadConfig();
    // Load live rates (continuous stream)
    this.loadLiveRates();
    // Load account health
    this.loadAccountHealth();
    // Load all widget data
    this.loadNewWidgets();
  }

  private loadCoreData(): void {
    this.dashboardService.getAllDashboardData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.stateService.balanceData.set(data.balance);
          this.stateService.quickUsers.set(data.quickUsers);
          this.stateService.transactions.set(data.transactions);
          this.stateService.incomeData.set(data.income);
          this.stateService.spendingData.set(data.spending);
          this.stateService.cards.set(data.cards);
          this.stateService.workflows.set(data.workflows);
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Failed to load core dashboard data:', err);
          this.stateService.hasError.set(true);
          this.isLoading.set(false);
        }
      });
  }

  private loadConfig(): void {
    this.dashboardService.getPeriodOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(opts => {
        this.stateService.periodOptions.set(opts);
        if (opts.length) this.stateService.selectedPeriod.set(opts[0]);
      });

    this.dashboardService.getSupportedCurrencies()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(currencies => {
        this.stateService.supportedCurrencies.set(currencies);
        if (currencies.length >= 2) {
          this.conversionCurrency1.set(currencies[0].code);
          this.conversionCurrency2.set(currencies[1].code);
        }
      });
  }

  loadLiveRates(): void {
    this.dashboardService.getLiveRates()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(rates => this.stateService.liveRates.set(rates));
  }

  loadAccountHealth(): void {
    this.dashboardService.getAccountHealth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(health => this.stateService.accountHealth.set(health));
  }

  private loadNewWidgets(): void {
    // Load all widget data
    this.dashboardService.getBudgetCategories()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.budgetCategories.set(d));

    this.dashboardService.getSmartInsights()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.smartInsights.set(d));

    this.dashboardService.getActivityFeed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.activityFeed.set(d));

    this.dashboardService.getUpcomingBills()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.upcomingBills.set(d));

    this.dashboardService.getRecurringSubscriptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.recurringSubscriptions.set(d));

    this.dashboardService.getSavingsGoals()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.savingsGoals.set(d));

    this.dashboardService.getMonthlyReport()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.monthlyReport.set(d));

    this.dashboardService.getSpendingBreakdown()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.spendingBreakdown.set(d));

    this.dashboardService.getCashflowData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.stateService.cashflowRawData.set(d.chartData);
        this.stateService.cashflowSummaryData.set(d.summary);
      });

    this.dashboardService.getNetWorth()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.stateService.netWorth.set(d.netWorth);
        this.stateService.netWorthChange.set(d.change);
        this.stateService.totalAssets.set(d.assets);
        this.stateService.totalLiabilities.set(d.liabilities);
      });

    this.dashboardService.getRecentLogins()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => this.stateService.recentLogins.set(d));

    this.dashboardService.getTaxSummary()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.stateService.taxSummary.set(d.items);
        this.stateService.estimatedTax.set(d.estimatedTax);
      });

    this.dashboardService.getRewardsData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(d => {
        this.stateService.rewardsPoints.set(d.points);
        this.stateService.rewardsTier.set(d.tier);
        this.stateService.rewardsTierPercent.set(d.tierPercent);
        this.stateService.rewardsTierCurrent.set(d.tierCurrent);
        this.stateService.rewardsTierNext.set(d.tierNext);
        this.stateService.cashbackEarned.set(d.cashbackMonth);
        this.stateService.cashbackTotal.set(d.cashbackTotal);
      });
  }

  // ─── Event Handlers ───────────────────────────────────────────
  onSearchChange(query: string): void {
    this.stateService.updateSearchQuery(query);
  }

  onCurrency1Change(event: any): void {
    this.conversionCurrency1.set(event.value);
    this.conversionAmount2.set(0);
  }

  onCurrency2Change(event: any): void {
    this.conversionCurrency2.set(event.value);
    this.conversionAmount2.set(0);
  }

  onAmount1Change(event: Event): void {
    this.conversionAmount1.set(+(event.target as HTMLInputElement).value);
    this.conversionAmount2.set(0);
  }

  reloadTransactions(): void {
    this.dashboardService.getTransactions(this.stateService.selectedPeriod())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(t => this.stateService.transactions.set(t));
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

  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`],
    });
  }

  // ─── Expose state service properties ──────────────────────────
  get balanceData() { return this.stateService.balanceData; }
  get savingsGoalPercent() { return this.stateService.savingsGoalPercent; }
  get statCards() { return this.stateService.statCards; }
  get transactions() { return this.stateService.transactions; }
  get filteredTransactions() { return this.stateService.filteredTransactions; }
  get searchQuery() { return this.stateService.searchQuery; }
  get selectedPeriod() { return this.stateService.selectedPeriod; }
  get periodOptions() { return this.stateService.periodOptions; }
  get supportedCurrencies() { return this.stateService.supportedCurrencies; }
  get incomeData() { return this.stateService.incomeData; }
  get spendingData() { return this.stateService.spendingData; }
  get totalBalance() { return this.stateService.totalBalance; }
  get accountHealth() { return this.stateService.accountHealth; }
  get monthlyReport() { return this.stateService.monthlyReport; }
  get spendingBreakdown() { return this.stateService.spendingBreakdown; }
  get spendingBreakdownTotal() { return computed(() => this.spendingBreakdown().reduce((s, r) => s + r.value, 0)); }
  get savingsGoals() { return this.stateService.savingsGoals; }
  get cashflowSummary() { return this.stateService.cashflowSummaryData; }
  get netWorth() { return this.stateService.netWorth; }
  get netWorthChange() { return this.stateService.netWorthChange; }
  get totalAssets() { return this.stateService.totalAssets; }
  get assetsPercent() { return computed(() => {
    const t = this.totalAssets() + this.stateService.totalLiabilities();
    return t ? Math.round((this.totalAssets() / t) * 100) : 0;
  }); }
  get totalLiabilities() { return this.stateService.totalLiabilities; }
  get liabilitiesPercent() { return computed(() => {
    const t = this.totalAssets() + this.stateService.totalLiabilities();
    return t ? Math.round((this.stateService.totalLiabilities() / t) * 100) : 0;
  }); }
  get currentYear() { return computed(() => new Date().getFullYear()); }
  get taxSummary() { return this.stateService.taxSummary; }
  get estimatedTax() { return this.stateService.estimatedTax; }
  get securityLevel() { return this.stateService.securityLevel; }
  get hasError() { return this.stateService.hasError; }
  get smartInsights() { return this.stateService.smartInsights; }
  get quickUsers() { return this.stateService.quickUsers; }
  get activityFeed() { return this.stateService.activityFeed; }
  get upcomingBills() { return this.stateService.upcomingBills; }
  get recurringSubscriptions() { return this.stateService.recurringSubscriptions; }
  get liveRates() { return this.stateService.liveRates; }
  get budgetCategories() { return this.stateService.budgetCategories; }
  get recentLogins() { return this.stateService.recentLogins; }
  get rewardsPoints() { return this.stateService.rewardsPoints; }
  get rewardsTier() { return this.stateService.rewardsTier; }
  get rewardsTierPercent() { return this.stateService.rewardsTierPercent; }
  get rewardsTierCurrent() { return this.stateService.rewardsTierCurrent; }
  get rewardsTierNext() { return this.stateService.rewardsTierNext; }
  get cashbackEarned() { return this.stateService.cashbackEarned; }
  get cashbackTotal() { return this.stateService.cashbackTotal; }
  get currentCard() { return this.stateService.currentCard; }
  get cards() { return this.stateService.cards; }
  get selectedCard() { return this.stateService.selectedCard; }
  get cardLimitPercent() { return this.stateService.cardLimitPercent; }
  get overdueCount() { return this.stateService.overdueCount; }
  get subscriptionsTotal() { return this.stateService.subscriptionsTotal; }
  get workflows() { return this.stateService.workflows; }

  // Methods
  loadDashboardData() {
    // Reload all dashboard data from scratch
    this.loadAllData();
  }

  onUserClick(user: any) {
    // Handle user click - could navigate to user profile or send money
    console.log('User clicked:', user);
  }

  onPeriodChange(value: string | Event): void {
    let period: string;
    if (typeof value === 'string') {
      period = value;
    } else {
      period = (value.target as HTMLSelectElement)?.value || '';
    }
    if (period) {
      this.stateService.selectedPeriod.set(period);
    }
  }

  onAddCard() {
    // Handle add card functionality
    console.log('Add card clicked');
  }

  formatCardNumber(cardNumber: string): string {
    // Format card number for display
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  previousCard() {
    const current = this.selectedCard();
    const total = this.cards().length;
    this.stateService.selectedCard.set(current > 0 ? current - 1 : total - 1);
  }

  nextCard() {
    const current = this.selectedCard();
    const total = this.cards().length;
    this.stateService.selectedCard.set(current < total - 1 ? current + 1 : 0);
  }

  onAmount2Change(event: any) {
    // Handle amount 2 change
    console.log('Amount 2 changed:', event);
  }

  onWorkflowClick(workflow: any) {
    // Handle workflow click
    console.log('Workflow clicked:', workflow);
  }

  budgetIsOver(cat: any): boolean {
    return cat.spent > cat.limit;
  }

  budgetPercent(cat: any): number {
    return cat.limit ? Math.min((cat.spent / cat.limit) * 100, 100) : 0;
  }
}