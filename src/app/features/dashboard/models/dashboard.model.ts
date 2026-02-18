// dashboard.model.ts — Complete with all existing + new widget models

// ─── Existing models (unchanged) ─────────────────────────────

export interface BalanceData {
  totalBalance: number;
  currency: string;
  lastUpdated: string;
  changePercentage: number;
  savingsGoalPercent: number;
}

export interface AccountSummary {
  totalBalance: number;
  accountNumber: string;
  accountType: string;
  accountStatus: 'ACTIVE' | 'INACTIVE' | 'CLOSED' | 'SUSPENDED';
  accountCategory: string;
  currency: string;
}

export interface FinancialOverview {
  totalIncome: number;
  totalExpenses: number;
  netChange: number;
  percentageChange: number;
  period: 'LAST_7_DAYS' | 'LAST_30_DAYS' | 'LAST_90_DAYS' | 'LAST_YEAR';
  currency: string;
}

export interface AccountHealthScore {
  score: number;
  level: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR';
  recommendations: string[];
}

export interface QuickUser {
  id: string;
  name: string;
  amount: string;
  avatar: string;
  accountNumber?: string;
}

export interface Transaction {
  id: string;
  invoice: string;
  name: string;
  category: string;
  email?: string;
  date: string;
  amount: number;
  status: 'Completed' | 'On Progress' | 'Pending';
  logo: string;
  type: 'debit' | 'credit';
}

export interface ChartDataPoint {
  month: string;
  value: number;
}

export interface IncomeData {
  total: number;
  changePercentage: number;
  isPositive: boolean;
  period: string;
  chartData: ChartDataPoint[];
}

export interface SpendingData {
  total: number;
  changePercentage: number;
  isPositive: boolean;
  period: string;
  chartData: ChartDataPoint[];
}

export interface CreditCard {
  id: string;
  cardHolder: string;
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  brand: 'VISA' | 'Mastercard' | 'Amex';
  type: 'Credit' | 'Debit';
  balance: number;
  limit: number;
}

export interface Workflow {
  id: string;
  title: string;
  status: string;
  icon: string;
}

export interface LiveRate {
  flag: string;
  pair: string;
  sparkline: string;
  value: number;
  change: number;
  isUp: boolean;
}

export interface BudgetCategory {
  label: string;
  icon: string;
  spent: number;
  limit: number;
  colorClass: 'violet' | 'cyan' | 'emerald' | 'rose';
}

export interface DashboardData {
  balance: BalanceData;
  quickUsers: QuickUser[];
  transactions: Transaction[];
  income: IncomeData;
  spending: SpendingData;
  cards: CreditCard[];
  workflows: Workflow[];
}

// ─── New widget models ────────────────────────────────────────

export interface SmartInsight {
  id: number;
  icon: string;
  type: 'warning' | 'success' | 'info' | 'alert';
  tag: string;
  title: string;
  description: string;
}

export interface ActivityEvent {
  id: number;
  type: 'credit' | 'debit' | 'alert' | 'login';
  title: string;
  time: string;
  amount: number;
  isCredit: boolean;
}

export interface UpcomingBill {
  id: number;
  icon: string;
  name: string;
  dueDate: string;
  amount: number;
  urgency: 'overdue' | 'today' | 'upcoming';
}

export interface RecurringSubscription {
  id: number;
  icon: string;
  name: string;
  nextDate: string;
  amount: number;
}

export interface SavingsGoal {
  id: number;
  icon: string;
  name: string;
  saved: number;
  target: number;
  deadline: string;
  color: 'violet' | 'cyan' | 'emerald' | 'amber' | 'rose';
}

export interface MonthlyReportItem {
  label: string;
  income: number;
  expense: number;
  incomePercent: number;
  expensePercent: number;
}

export interface SpendingBreakdownSegment {
  label: string;
  value: number;
  percent: number;
  color: string;
  dashArray: string;
  dashOffset: string;
}

export interface CashflowPoint {
  label: string;
  value: number;
  isPositive: boolean;
}

export interface RecentLogin {
  id: number;
  deviceIcon: string;
  device: string;
  location: string;
  time: string;
  isCurrent: boolean;
}

export interface TaxSummaryItem {
  icon: string;
  label: string;
  value: number;
  color: 'violet' | 'cyan' | 'emerald' | 'amber';
}