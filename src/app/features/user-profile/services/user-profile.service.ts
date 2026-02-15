import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserDetails } from '../../../core/models/user.model';

interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface PasswordChangeResponse {
  success: boolean;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = 'https://api.example.com/user'; // Replace with your API URL
  private http = inject(HttpClient);

  getUserDetails(): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/details`);
  }

  updateUserDetails(user: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.apiUrl}/details`, user);
  }

  changePassword(passwordData: PasswordChangeRequest): Observable<PasswordChangeResponse> {
    return this.http.post<PasswordChangeResponse>(`${this.apiUrl}/change-password`, passwordData);
  }
}
