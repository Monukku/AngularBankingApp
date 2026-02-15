// transaction-list.component.ts
import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model'; 
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule], // Include CommonModule here
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent implements OnInit {
  private transactionService = inject(TransactionService);
  private destroyRef = inject(DestroyRef);

  transactions: Transaction[] = []; // Initialize the property here

  constructor() { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  /**
   * TrackBy function for transaction list iteration
   * Improves performance by tracking by transaction ID instead of object reference
   */
  trackByTransactionId = (index: number, transaction: Transaction) => transaction.id;

  loadTransactions(): void {
    this.transactionService.getTransactions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(transactions => {
        this.transactions = transactions;
      });
  }
}
