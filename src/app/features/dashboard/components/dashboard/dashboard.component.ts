import { Component, signal, computed, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

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
import * as shape from 'd3-shape'; // For ngx-charts curve types 
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
} from '../../models/dashboard.model';
interface ChartData {
  name: string;
  value: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
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
    NgxChartsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  private snackBar = inject(MatSnackBar);

  // Loading states
  isLoading = this.dashboardService.isLoading;
  
  curve = shape.curveMonotoneX; // Smooth curve like the design
  // Data signals
  balanceData = signal<BalanceData | null>(null);
  quickUsers = signal<QuickUser[]>([]);
  transactions = signal<Transaction[]>([]);
  incomeData = signal<IncomeData | null>(null);
  spendingData = signal<SpendingData | null>(null);
  cards = signal<CreditCard[]>([]);
  workflows = signal<Workflow[]>([]);

  // UI state signals
  searchQuery = signal('');
  selectedPeriod = signal('Last 30 days');
  selectedCard = signal(0);

  // Computed values
  totalBalance = computed(() => this.balanceData()?.totalBalance || 0);
  
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
    const cards = this.cards();
    const index = this.selectedCard();
    return cards[index] || cards[0];
  });

  // Chart data for ngx-charts
  incomeChartData = computed(() => {
    const income = this.incomeData();
    if (!income) return [];
    return income.chartData.map(d => ({
      name: d.month,
      value: d.value
    }));
  });

  spendingChartData = computed(() => {
    const spending = this.spendingData();
    if (!spending) return [];
    return spending.chartData.map(d => ({
      name: d.month,
      value: d.value
    }));
  });

  // Chart options for ngx-charts
  view: [number, number] = [600, 200];
  showXAxis = true;
  showYAxis = false;
  gradient = false;
  showLegend = false;
  showXAxisLabel = false;
  showYAxisLabel = false;
  timeline = false;
  autoScale = true;
  
  incomeColorScheme: any = {
    domain: ['#10b981', '#059669', '#047857']
  };

  spendingColorScheme: any = {
    domain: ['#fbbf24', '#f59e0b', '#d97706']
  };

  // Table columns
  displayedColumns: string[] = ['select', 'invoice', 'transaction', 'date', 'amount', 'status'];

  // Conversion signals
  conversionAmount1 = signal(238);
  conversionCurrency1 = signal('USD');
  conversionAmount2 = signal(222.13);
  conversionCurrency2 = signal('EUR');
  conversionRate = signal(0.9339);

  ngOnInit(): void {
    this.loadDashboardData();
  }

  /**
   * Load all dashboard data
   */
  loadDashboardData(): void {
    this.dashboardService.getAllDashboardData().subscribe({
      next: (data) => {
        this.balanceData.set(data.balance);
        this.quickUsers.set(data.quickUsers);
        this.transactions.set(data.transactions);
        this.incomeData.set(data.income);
        this.spendingData.set(data.spending);
        this.cards.set(data.cards);
        this.workflows.set(data.workflows);
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.showMessage('Error loading dashboard data', 'error');
      }
    });
  }

  /**
   * Reload transactions
   */
  reloadTransactions(): void {
    this.dashboardService.getTransactions(this.selectedPeriod()).subscribe({
      next: (transactions) => {
        this.transactions.set(transactions);
      },
      error: (error) => {
        console.error('Error loading transactions:', error);
      }
    });
  }

  /**
   * Handle send money
   */
  onSend(): void {
    this.showMessage('Send money feature');
  }

  /**
   * Handle request money
   */
  onRequest(): void {
    this.showMessage('Request money feature');
  }

  /**
   * Handle top-up
   */
  onTopUp(): void {
    this.showMessage('Top-up feature');
  }

  /**
   * Handle quick user click
   */
  onUserClick(user: QuickUser): void {
    if (user.amount) {
      this.showMessage(`Quick transfer to ${user.name}`);
    }
  }

  /**
   * Handle period change
   */
  onPeriodChange(period: string): void {
    this.selectedPeriod.set(period);
    this.reloadTransactions();
  }

  /**
   * Handle search
   */
  onSearchChange(query: string): void {
    this.searchQuery.set(query);
  }

  /**
   * Handle currency conversion
   */
  convert(): void {
    const from = this.conversionCurrency1();
    const to = this.conversionCurrency2();
    const amount = this.conversionAmount1();

    this.dashboardService.convertCurrency(from, to, amount).subscribe({
      next: (result) => {
        this.conversionAmount2.set(result.convertedAmount);
        this.conversionRate.set(result.rate);
        this.showMessage(`Converted ${amount} ${from} to ${result.convertedAmount.toFixed(2)} ${to}`);
      },
      error: (error) => {
        console.error('Conversion error:', error);
        this.showMessage('Conversion failed', 'error');
      }
    });
  }

  /**
   * Navigate to next card
   */
  nextCard(): void {
    const cards = this.cards();
    const current = this.selectedCard();
    this.selectedCard.set((current + 1) % cards.length);
  }

  /**
   * Navigate to previous card
   */
  previousCard(): void {
    const cards = this.cards();
    const current = this.selectedCard();
    this.selectedCard.set(current === 0 ? cards.length - 1 : current - 1);
  }

  /**
   * Add new card
   */
  onAddCard(): void {
    this.showMessage('Add new card feature');
  }

  /**
   * Handle workflow click
   */
  onWorkflowClick(workflow: Workflow): void {
    this.showMessage(`Opening ${workflow.title} workflow`);
  }

  /**
   * Format card number for display
   */
  formatCardNumber(cardNumber: string): string {
    return cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ');
  }

  /**
   * Chart tooltip format
   */
  formatTooltip(data: any): string {
    return `$${data.value.toLocaleString()}`;
  }

  /**
   * Show snackbar message
   */
  private showMessage(message: string, type: 'success' | 'error' | 'info' = 'info'): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`snackbar-${type}`]
    });
  }
}