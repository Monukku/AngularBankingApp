import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { UserDetails } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'https://api.example.com/users'; // Replace with your API URL
  private http = inject(HttpClient);

  // Cache user details to prevent multiple HTTP requests
  private userDetailsCache$: Observable<UserDetails> | null = null;

  /**
   * Fetch user details with caching via shareReplay
   * Multiple subscribers will share the same request result
   */
  getUserDetails(): Observable<UserDetails> {
    if (!this.userDetailsCache$) {
      this.userDetailsCache$ = this.http.get<UserDetails>(`${this.apiUrl}/details`).pipe(
        shareReplay(1) // Share the same response among all subscribers, cache last value
      );
    }
    return this.userDetailsCache$;
  }

  /**
   * Clear the cache when user updates
   */
  invalidateUserCache(): void {
    this.userDetailsCache$ = null;
  }

  // Update user details
  updateUserDetails(user: UserDetails): Observable<UserDetails> {
    return this.http.put<UserDetails>(`${this.apiUrl}/details`, user);
  }
}
