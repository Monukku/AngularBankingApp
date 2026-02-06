import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class LoanService {
  private apiUrl = `${environment.apiBaseUrl}/loans`;

  constructor(private http: HttpClient) { }

  getLoans(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getLoan(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createLoan(loan: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, loan);
  }

  updateLoan(id: string, loan: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, loan);
  }

  deleteLoan(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
