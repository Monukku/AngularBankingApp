import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-balance-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  template: `
    <div class="balance-widget">
      <div class="balance-header">
        <h2>Total Balance</h2>
        <div class="balance-amount">
          <span class="currency">$</span>
          <span class="amount">{{ totalBalance() | number:'1.0-0' }}</span>
        </div>
        <div class="balance-change" [class.positive]="changePercentage() >= 0">
          <mat-icon>{{ changePercentage() >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
          <span>{{ changePercentage() }}% this month</span>
        </div>
      </div>

      <div class="savings-goal">
        <div class="savings-label">
          <span>Savings Goal</span>
          <span>{{ savingsGoalPercent() }}%</span>
        </div>
        <div class="savings-ring">
          <svg width="80" height="80" viewBox="0 0 80 80">
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="rgba(255,255,255,0.1)"
              stroke-width="4"
            />
            <circle
              cx="40" cy="40" r="32"
              fill="none"
              stroke="#10b981"
              stroke-width="4"
              stroke-dasharray="201"
              [attr.stroke-dashoffset]="savingsRingOffset()"
              transform="rotate(-90 40 40)"
            />
          </svg>
        </div>
      </div>

      <div class="quick-actions">
        <button mat-stroked-button (click)="onSend()">
          <mat-icon>send</mat-icon>
          Send
        </button>
        <button mat-stroked-button (click)="onRequest()">
          <mat-icon>call_received</mat-icon>
          Request
        </button>
        <button mat-stroked-button (click)="onTopUp()">
          <mat-icon>add_circle</mat-icon>
          Top Up
        </button>
      </div>
    </div>
  `,
  styles: [`
    .balance-widget {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      border-radius: 16px;
      padding: 24px;
      color: white;
      position: relative;
      overflow: hidden;
    }

    .balance-header h2 {
      margin: 0 0 8px 0;
      font-size: 14px;
      font-weight: 500;
      opacity: 0.9;
    }

    .balance-amount {
      display: flex;
      align-items: baseline;
      margin-bottom: 8px;
    }

    .currency {
      font-size: 24px;
      margin-right: 4px;
    }

    .amount {
      font-size: 32px;
      font-weight: 700;
    }

    .balance-change {
      display: flex;
      align-items: center;
      font-size: 14px;
      opacity: 0.9;
    }

    .balance-change.positive {
      color: #10b981;
    }

    .savings-goal {
      margin: 24px 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .savings-label {
      display: flex;
      flex-direction: column;
    }

    .savings-label span:first-child {
      font-size: 14px;
      opacity: 0.9;
    }

    .savings-label span:last-child {
      font-size: 18px;
      font-weight: 600;
    }

    .savings-ring {
      position: relative;
    }

    .quick-actions {
      display: flex;
      gap: 12px;
      margin-top: 24px;
    }

    .quick-actions button {
      flex: 1;
      color: white;
      border-color: rgba(255, 255, 255, 0.3);
    }
  `]
})
export class BalanceWidgetComponent {
  // Inputs
  balanceData = input<any>(null);
  savingsGoalPercent = input(0);

  // Computed properties
  totalBalance = computed(() => this.balanceData()?.totalBalance ?? 0);
  changePercentage = computed(() => this.balanceData()?.changePercentage ?? 0);

  savingsRingOffset = computed(() => {
    const c = 201;
    return c - (c * this.savingsGoalPercent() / 100);
  });

  // Event handlers
  onSend(): void {
    console.log('Send money feature');
  }

  onRequest(): void {
    console.log('Request money feature');
  }

  onTopUp(): void {
    console.log('Top-up feature');
  }
}