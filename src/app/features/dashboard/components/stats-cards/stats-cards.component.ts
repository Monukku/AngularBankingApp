import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

interface StatCard {
  label: string;
  icon: string;
  color: string;
  value: number;
  changeLabel: string;
  isPositive: boolean;
  isPercent: boolean;
}

@Component({
  selector: 'app-stats-cards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="stats-grid">
      @for (card of statCards(); track card.label) {
        <div class="stat-card" [class]="card.color">
          <div class="stat-icon">
            <span>{{ card.icon }}</span>
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ card.label }}</div>
            <div class="stat-value">
              @if (card.isPercent) {
                {{ card.value }}%
              } @else {
                \${{ card.value | number:'1.0-0' }}
              }
            </div>
            <div class="stat-change" [class]="card.isPositive ? 'positive' : 'negative'">
              {{ card.changeLabel }}
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.05);
      border-radius: 12px;
      padding: 20px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      backdrop-filter: blur(10px);
    }

    .stat-card.violet { border-color: #7c3aed; }
    .stat-card.cyan { border-color: #06b6d4; }
    .stat-card.emerald { border-color: #10b981; }
    .stat-card.rose { border-color: #f43f5e; }

    .stat-icon {
      font-size: 24px;
      margin-bottom: 12px;
    }

    .stat-label {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin-bottom: 4px;
    }

    .stat-value {
      font-size: 28px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .stat-change {
      font-size: 12px;
    }

    .stat-change.positive { color: #10b981; }
    .stat-change.negative { color: #f43f5e; }
  `]
})
export class StatsCardsComponent {
  statCards = input<StatCard[]>([]);
}