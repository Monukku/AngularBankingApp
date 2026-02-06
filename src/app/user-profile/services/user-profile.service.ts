import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {

  private apiUrl = 'https://api.example.com/user'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/details`);
  }

  updateUserDetails(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/details`, user);
  }

  changePassword(passwordData: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/change-password`, passwordData);
  }
}
