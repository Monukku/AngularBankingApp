import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Transaction } from '../../shared/models/transaction.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  // Dummy transactions
  transactions: Transaction[] = [
    { id: '1', amount: 100, date: '2024-06-01' },
    { id: '2', amount: 200, date: '2024-06-02' },
    { id: '3', amount: 300, date: '2024-06-03' }
  ];

  constructor(private http:HttpClient) { }

  getTransactions(): Observable<Transaction[]> {
    return of(this.transactions);
  }

  getTransactionById(id: string): Observable<Transaction | undefined> {
    return of(this.transactions.find(transaction => transaction.id === id));
  }
 
  getTransactionHistory(): Observable<any[]> {
    return this.http.get<any[]>('/api/transactions/history');
  }

  transferFunds(fromAccount: string, toAccount: string, amount: number): Observable<any> {
    const transferDetails = { fromAccount, toAccount, amount };
    return this.http.post('/api/transactions/transfer', transferDetails);
  }

}
