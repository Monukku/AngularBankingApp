import { Injectable, signal, computed } from '@angular/core';
import {
  BalanceData, QuickUser, Transaction, IncomeData, SpendingData,
  CreditCard, Workflow, LiveRate, AccountHealthScore, BudgetCategory,
  SmartInsight, ActivityEvent, UpcomingBill, RecurringSubscription,
  SavingsGoal, MonthlyReportItem, SpendingBreakdownSegment,
  CashflowPoint, RecentLogin, TaxSummaryItem,
} from '../models/dashboard.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardStateService {
  // ─── Core Data Signals ────────────────────────────────────────
  balanceData = signal<BalanceData | null>(null);
  quickUsers = signal<QuickUser[]>([]);
  transactions = signal<Transaction[]>([]);
  incomeData = signal<IncomeData | null>(null);
  spendingData = signal<SpendingData | null>(null);
  cards = signal<CreditCard[]>([]);
  workflows = signal<Workflow[]>([]);

  // ─── Widget Data Signals ──────────────────────────────────────
  liveRates = signal<LiveRate[]>([]);
  accountHealth = signal<AccountHealthScore | null>(null);
  budgetCategories = signal<BudgetCategory[]>([]);
  smartInsights = signal<SmartInsight[]>([]);
  activityFeed = signal<ActivityEvent[]>([]);
  upcomingBills = signal<UpcomingBill[]>([]);
  recurringSubscriptions = signal<RecurringSubscription[]>([]);
  savingsGoals = signal<SavingsGoal[]>([]);
  monthlyReport = signal<MonthlyReportItem[]>([]);
  spendingBreakdown = signal<SpendingBreakdownSegment[]>([]);
  cashflowRawData = signal<any[]>([]);
  cashflowSummaryData = signal<CashflowPoint[]>([]);
  recentLogins = signal<RecentLogin[]>([]);
  taxSummary = signal<TaxSummaryItem[]>([]);

  // ─── Rewards Data ─────────────────────────────────────────────
  rewardsPoints = signal(0);
  rewardsTier = signal('Gold');
  rewardsTierPercent = signal(0);
  rewardsTierCurrent = signal(0);
  rewardsTierNext = signal(0);
  cashbackEarned = signal(0);
  cashbackTotal = signal(0);

  // ─── Net Worth Data ───────────────────────────────────────────
  netWorth = signal(0);
  netWorthChange = signal(0);
  totalAssets = signal(0);
  totalLiabilities = signal(0);

  // ─── Tax/Security Data ────────────────────────────────────────
  estimatedTax = signal(0);
  securityLevel = signal('Strong');

  // ─── UI State ─────────────────────────────────────────────────
  searchQuery = signal('');
  selectedPeriod = signal('Last 30 days');
  selectedCard = signal(0);
  periodOptions = signal<string[]>([]);
  supportedCurrencies = signal<{ code: string; flag: string; label: string }[]>([]);
  hasError = signal(false);

  // ─── Computed Properties ──────────────────────────────────────
  // Core balance stats
  totalBalance = computed(() => this.balanceData()?.totalBalance ?? 0);
  savingsGoalPercent = computed(() => this.balanceData()?.savingsGoalPercent ?? 0);

  // UI computed properties
  savingsRingOffset = computed(() => {
    const c = 201;
    return c - (c * this.savingsGoalPercent() / 100);
  });

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

  // Transaction filtering
  filteredTransactions = computed(() => {
    const q = this.searchQuery().toLowerCase();
    if (!q) return this.transactions();
    return this.transactions().filter(t =>
      t.name.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.invoice.toLowerCase().includes(q)
    );
  });

  // Card navigation
  currentCard = computed(() => {
    const list = this.cards();
    return list[this.selectedCard()] ?? list[0] ?? null;
  });

  cardLimitPercent = computed(() => {
    const card = this.currentCard();
    if (!card?.limit) return 0;
    return Math.min((card.balance / card.limit) * 100, 100);
  });

  // Widget helpers
  overdueCount = computed(() =>
    this.upcomingBills().filter(b => b.urgency === 'overdue').length
  );

  subscriptionsTotal = computed(() =>
    this.recurringSubscriptions().reduce((s, r) => s + r.amount, 0)
  );

  spendingBreakdownTotal = computed(() =>
    this.spendingBreakdown().reduce((s, r) => s + r.value, 0)
  );

  cashflowSummary = computed(() => this.cashflowSummaryData());

  assetsPercent = computed(() => {
    const t = this.totalAssets() + this.totalLiabilities();
    return t ? Math.round((this.totalAssets() / t) * 100) : 0;
  });

  liabilitiesPercent = computed(() => {
    const t = this.totalAssets() + this.totalLiabilities();
    return t ? Math.round((this.totalLiabilities() / t) * 100) : 0;
  });

  currentYear = computed(() => new Date().getFullYear());

  // ─── Helper Methods ───────────────────────────────────────────
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  budgetIsOver(category: BudgetCategory): boolean {
    return category.spent > category.limit;
  }

  budgetPercent(category: BudgetCategory): number {
    return Math.min((category.spent / category.limit) * 100, 100);
  }

  // ─── State Update Methods ─────────────────────────────────────
  updateSearchQuery(query: string): void {
    this.searchQuery.set(query);
  }

  updateSelectedPeriod(period: string): void {
    this.selectedPeriod.set(period);
  }

  updateSelectedCard(index: number): void {
    this.selectedCard.set(index);
  }

  nextCard(): void {
    const len = this.cards().length;
    this.selectedCard.set((this.selectedCard() + 1) % len);
  }

  previousCard(): void {
    const len = this.cards().length;
    this.selectedCard.set(this.selectedCard() === 0 ? len - 1 : this.selectedCard() - 1);
  }
}