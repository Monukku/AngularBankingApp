import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  constructor(private http: HttpClient) { }

  getTransactionHistory(): Observable<any[]> {
    return this.http.get<any[]>('/api/transactions/history');
  }

  transferFunds(fromAccount: string, toAccount: string, amount: number): Observable<any> {
    const transferDetails = { fromAccount, toAccount, amount };
    return this.http.post('/api/transactions/transfer', transferDetails);
  }
}
