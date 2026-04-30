// transaction-list.component.ts
import { Component, ChangeDetectionStrategy, inject, DestroyRef, signal } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../models/transaction.model';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule], // Include CommonModule here
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionListComponent {
  private transactionService = inject(TransactionService);
  private destroyRef = inject(DestroyRef);

  // Signal for transactions - automatically handles data fetching
  transactions = toSignal(this.transactionService.getTransactions(), { initialValue: [] });

  /**
   * TrackBy function for transaction list iteration
   * Improves performance by tracking by transaction ID instead of object reference
   */
  trackByTransactionId = (index: number, transaction: Transaction) => transaction.id;
}
