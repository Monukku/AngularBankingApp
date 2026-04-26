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
  imports: [CommonModule, MatIconModule],
templateUrl: './stats-cards.component.html',
  styleUrls: ['./stats-cards.component.scss']
})

export class StatsCardsComponent {
  statCards = input<StatCard[]>([]);
}