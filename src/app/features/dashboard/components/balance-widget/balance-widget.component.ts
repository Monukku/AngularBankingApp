import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-balance-widget',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  templateUrl: './balance-widget.component.html',
  styleUrls: ['./balance-widget.component.scss'],
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