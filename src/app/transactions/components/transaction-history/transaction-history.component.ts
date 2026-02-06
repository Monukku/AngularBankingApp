import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../../accounts/services/transaction.service';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';

@Component({
  selector: 'app-transaction-history',
  standalone: true,
  imports: [MatTableModule, CommonModule],
  templateUrl: './transaction-history.component.html',
  styleUrls: ['./transaction-history.component.scss'],
})
export class TransactionHistoryComponent implements OnInit {
  transactionHistory: any[] = [];

  constructor(private transactionService: TransactionService) {}

  ngOnInit(): void {
    this.loadTransactionHistory();
  }

  loadTransactionHistory(): void {
    this.transactionService.getTransactionHistory().subscribe((history) => {
      this.transactionHistory = history;
    });
  }
}
