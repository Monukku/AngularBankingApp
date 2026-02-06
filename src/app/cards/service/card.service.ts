import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; 

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private apiUrl = `${environment.apiBaseUrl}/cards`;

  constructor(private http: HttpClient) { }

  getCards(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getCard(id: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCard(card: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, card);
  }

  updateCard(id: string, card: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, card);
  }

  deleteCard(id: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
