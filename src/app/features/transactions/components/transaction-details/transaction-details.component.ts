import { Component, OnInit, ChangeDetectionStrategy, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { LoaderComponent } from '../../../../shared/components/loader/loader.component';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule, RouterLink, LoaderComponent],
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private transactionService = inject(TransactionService);

  transaction = signal<any>(null);
  loading = signal(true);
  error = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.transactionService.getTransactionById(id).subscribe({
        next: (t) => { this.transaction.set(t); this.loading.set(false); },
        error: () => { this.error.set('Transaction not found.'); this.loading.set(false); },
      });
    }
  }
}
