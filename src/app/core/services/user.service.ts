import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDetails } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://api.example.com/users'; // Replace with your API URL
  private http = inject(HttpClient);

  // Fetch user details
  getUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/details`);
  }

  // Update user details
  updateUserDetails(user: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.apiUrl}/details`, user);
  }
}
