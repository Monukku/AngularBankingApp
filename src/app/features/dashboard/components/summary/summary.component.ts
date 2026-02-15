import {
  Component,
  Input,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  AccountSummary,
  FinancialOverview,
  AccountHealthScore,
} from '../../models/dashboard.model';

@Component({
  selector: 'app-summary',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatGridListModule,
    MatDividerModule,
    MatProgressBarModule,
  ],
  templateUrl: './summary.component.html',
  styleUrl: './summary.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SummaryComponent {
  @Input() accountSummary: AccountSummary | null = null;
  @Input() financialOverview: FinancialOverview | null = null;
  @Input() healthScore: AccountHealthScore | null = null;

  /**
   * Get status color based on account status with type safety
   */
  getStatusColor(status: AccountSummary['accountStatus']): string {
    const colorMap: Record<AccountSummary['accountStatus'], string> = {
      ACTIVE: '#4CAF50',
      INACTIVE: '#FFC107',
      CLOSED: '#F44336',
      SUSPENDED: '#FF5722',
    };
    return colorMap[status] || '#9E9E9E';
  }

  /**
   * Get health score level color
   */
  getHealthScoreColor(level: AccountHealthScore['level']): string {
    const colorMap: Record<AccountHealthScore['level'], string> = {
      EXCELLENT: '#4CAF50',
      GOOD: '#8BC34A',
      FAIR: '#FFC107',
      POOR: '#F44336',
    };
    return colorMap[level] || '#9E9E9E';
  }

  /**
   * Format currency with proper locale and type safety
   */
  formatCurrency(value: number, currency: string = 'USD'): string {
    try {
      const formatter = new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      return formatter.format(value);
    } catch {
      // Fallback for invalid currency codes
      return `${currency} ${value.toFixed(2)}`;
    }
  }

  /**
   * Get percentage change with sign
   */
  getPercentageChange(percentage: number): string {
    const sign = percentage >= 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  }

  /**
   * Get change status indicator
   */
  getChangeStatus(percentage: number): 'positive' | 'negative' {
    return percentage >= 0 ? 'positive' : 'negative';
  }

  /**
   * Format period by replacing underscores with spaces
   */
  formatPeriod(period: string): string {
    return period.replace(/_/g, ' ');
  }
}
