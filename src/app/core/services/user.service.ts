import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://api.example.com/users'; // Replace with your API URL

  constructor(private http: HttpClient) { }

  // Fetch user details
  getUserDetails(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/details`);
  }

  // Update user details
  updateUserDetails(user: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/details`, user);
  }
}
