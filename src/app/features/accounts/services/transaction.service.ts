import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private api = inject(ApiService);

  // GET /api/v1/transactions  (paginated)
  getTransactionHistory(params?: { page?: number; size?: number }): Observable<any> {
    return this.api.getMyTransactions(params);
  }

  // POST /api/v1/transactions/transfer  (X-Idempotency-Key auto-generated)
  transferFunds(data: {
    fromAccountId: string;
    toAccountNumber: string;
    amount: number;
    description?: string;
  }): Observable<any> {
    return this.api.transfer(data, crypto.randomUUID());
  }

  // GET /api/v1/transactions/:id
  getTransaction(transactionId: string): Observable<any> {
    return this.api.getTransaction(transactionId);
  }
}
