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
  template: `
    <div class="transaction-widget">
      <div class="widget-header">
        <h3>Recent Transactions</h3>
        <div class="filters">
          <mat-form-field appearance="outline" class="search-field">
            <mat-label>Search transactions</mat-label>
            <input matInput
                   [value]="searchQuery()"
                   (input)="onSearchChange($event)"
                   placeholder="Search by name, category, or invoice...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <mat-form-field appearance="outline">
            <mat-label>Period</mat-label>
            <mat-select [value]="selectedPeriod()" (selectionChange)="onPeriodChange($event)">
              @for (option of periodOptions(); track option) {
                <mat-option [value]="option">{{ option }}</mat-option>
              }
            </mat-select>
          </mat-form-field>
        </div>
      </div>

      <div class="table-container">
        <table mat-table [dataSource]="filteredTransactions()" class="transaction-table">
          <ng-container matColumnDef="select">
            <th mat-header-cell *matHeaderCellDef>
              <mat-checkbox></mat-checkbox>
            </th>
            <td mat-cell *matCellDef="let transaction">
              <mat-checkbox></mat-checkbox>
            </td>
          </ng-container>

          <ng-container matColumnDef="invoice">
            <th mat-header-cell *matHeaderCellDef>Invoice</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.invoice }}</td>
          </ng-container>

          <ng-container matColumnDef="transaction">
            <th mat-header-cell *matHeaderCellDef>Transaction</th>
            <td mat-cell *matCellDef="let transaction">
              <div class="transaction-info">
                <div class="transaction-name">{{ transaction.name }}</div>
                <div class="transaction-category">{{ transaction.category }}</div>
              </div>
            </td>
          </ng-container>

          <ng-container matColumnDef="date">
            <th mat-header-cell *matHeaderCellDef>Date</th>
            <td mat-cell *matCellDef="let transaction">{{ transaction.date | date:'short' }}</td>
          </ng-container>

          <ng-container matColumnDef="amount">
            <th mat-header-cell *matHeaderCellDef>Amount</th>
            <td mat-cell *matCellDef="let transaction" [class]="transaction.type">
              <span class="amount">{{ transaction.amount | currency }}</span>
            </td>
          </ng-container>

          <ng-container matColumnDef="status">
            <th mat-header-cell *matHeaderCellDef>Status</th>
            <td mat-cell *matCellDef="let transaction">
              <span class="status" [class]="transaction.status.toLowerCase()">
                {{ transaction.status }}
              </span>
            </td>
          </ng-container>

          <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
          <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .transaction-widget {
      background: white;
      border-radius: 12px;
      padding: 24px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .widget-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }

    .widget-header h3 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
      color: #111827;
    }

    .filters {
      display: flex;
      gap: 16px;
      align-items: center;
    }

    .search-field {
      width: 300px;
    }

    .table-container {
      overflow-x: auto;
    }

    .transaction-table {
      width: 100%;
      border-collapse: collapse;
    }

    .transaction-info {
      display: flex;
      flex-direction: column;
    }

    .transaction-name {
      font-weight: 500;
      color: #111827;
    }

    .transaction-category {
      font-size: 12px;
      color: #6b7280;
    }

    .amount {
      font-weight: 600;
    }

    .amount.positive {
      color: #10b981;
    }

    .amount.negative {
      color: #ef4444;
    }

    .status {
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 12px;
      font-weight: 500;
      text-transform: uppercase;
    }

    .status.completed {
      background: rgba(16, 185, 129, 0.1);
      color: #10b981;
    }

    .status.pending {
      background: rgba(245, 158, 11, 0.1);
      color: #f59e0b;
    }

    .status.failed {
      background: rgba(239, 68, 68, 0.1);
      color: #ef4444;
    }

    ::ng-deep .mat-mdc-form-field {
      margin-bottom: 0;
    }

    ::ng-deep .mat-mdc-text-field-wrapper {
      background: #f9fafb;
    }
  `]
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