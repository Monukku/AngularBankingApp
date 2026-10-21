import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, PagedResponse, TransferRequest } from '../../../core/services/api.service';
import { Transaction } from '../models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private api = inject(ApiService);

  getTransactions(params?: { page?: number; size?: number }): Observable<PagedResponse<Transaction>> {
    return this.api.getMyTransactions(params);
  }

  getTransactionHistory(params?: { page?: number; size?: number }): Observable<PagedResponse<Transaction>> {
    return this.api.getMyTransactions(params);
  }

  getTransactionById(id: string): Observable<Transaction> {
    return this.api.getTransaction(id);
  }

  transferFunds(data: TransferRequest): Observable<Transaction> {
    return this.api.transfer(data, crypto.randomUUID());
  }
}
