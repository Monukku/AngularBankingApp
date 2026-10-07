import { Component, input, output, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Transaction } from '../../models/dashboard.model';

@Component({
  selector: 'app-transaction-list-widget',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatCheckboxModule,
  ],
   templateUrl: './transaction-list-widget.component.html',
  styleUrls: ['./transaction-list-widget.component.scss']
})
export class TransactionListWidgetComponent implements OnInit {
  // Inputs
  transactions = input<Transaction[]>([]);
  filteredTransactions = input<Transaction[]>([]);
  searchQuery = input('');
  selectedPeriod = input('Last 30 days');
  periodOptions = input<string[]>([]);
  displayedColumns = input<string[]>(['select', 'invoice', 'transaction', 'date', 'amount', 'status']);

  // Outputs
  searchChange = output<string>();
  periodChange = output<string>();

  openDropdown = false;

  ngOnInit(): void {}

  openHoverDD() { this.openDropdown = true; }
  closeHoverDD() { this.openDropdown = false; }

  selectPeriod(value: string) {
    this.openDropdown = false;
    this.periodChange.emit(value);
  }

  // Event handlers
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  onPeriodChange(event: Event): void {
    this.periodChange.emit((event.target as HTMLSelectElement).value);
  }
}