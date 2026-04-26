import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { Transaction } from '../../models/dashboard.model';

@Component({
  selector: 'app-transaction-list-widget',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    MatSelectModule,
    MatFormFieldModule
  ],
   templateUrl: './transaction-list-widget.component.html',
  styleUrls: ['./transaction-list-widget.component.scss']
})
export class TransactionListWidgetComponent {
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

  // Event handlers
  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchChange.emit(value);
  }

  onPeriodChange(event: any): void {
    this.periodChange.emit(event.value);
  }
}