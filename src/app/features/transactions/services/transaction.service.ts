import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Transaction, TransactionDetails, TransactionListResponse, CreateTransactionRequest } from '../models/transaction.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private http = inject(HttpClient);
  
  // Dummy transactions
  transactions: Transaction[] = [
    { id: '1', accountNumber: '1001', amount: 100, transactionType: 'DEBIT', transactionStatus: 'COMPLETED', date: '2024-06-01' },
    { id: '2', accountNumber: '1001', amount: 200, transactionType: 'CREDIT', transactionStatus: 'COMPLETED', date: '2024-06-02' },
    { id: '3', accountNumber: '1001', amount: 300, transactionType: 'TRANSFER', transactionStatus: 'COMPLETED', date: '2024-06-03' }
  ];

  getTransactions(): Observable<Transaction[]> {
    return of(this.transactions);
  }

  getTransactionById(id: string): Observable<Transaction | undefined> {
    return of(this.transactions.find(transaction => transaction.id === id));
  }
 
  getTransactionHistory(): Observable<TransactionListResponse> {
    return this.http.get<TransactionListResponse>('/api/transactions/history');
  }

  transferFunds(fromAccount: string, toAccount: string, amount: number): Observable<TransactionDetails> {
    const transferDetails: CreateTransactionRequest = { 
      toAccountNumber: toAccount, 
      amount, 
      transactionType: 'TRANSFER',
      counterpartyName: 'Bank Transfer'
    };
    return this.http.post<TransactionDetails>('/api/transactions/transfer', transferDetails);
  }
}
