import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    FormsModule,
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  username: string = '';
  password: string = '';

  private tokenUrl =
    'http://localhost:7070/realms/rewabank-realm/protocol/openid-connect/token'; // Replace with your Keycloak token URL
  private clientId = 'angular-client'; // Replace with your Keycloak client ID

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    // Optional: Handle logic if needed when component initializes
  }

  login() {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('grant_type', 'password');
    body.set('username', this.username);
    body.set('password', this.password);

    this.http
      .post<any>(this.tokenUrl, body.toString(), { headers })
      .pipe(
        tap((response) => {
          // Save tokens to localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);

          // Redirect to home or previously stored URL
          const redirectUrl = this.getRedirectUrl();
          this.router.navigate([redirectUrl]);
        }),
        catchError(this.handleError)
      )
      .subscribe();
  }

  refreshToken(): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });

    const body = new URLSearchParams();
    body.set('client_id', this.clientId);
    body.set('grant_type', 'refresh_token');
    body.set('refresh_token', localStorage.getItem('refresh_token') || '');

    return this.http
      .post<any>(this.tokenUrl, body.toString(), { headers })
      .pipe(
        tap((response) => {
          // Save new tokens to localStorage
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('refresh_token', response.refresh_token);
        }),
        catchError(this.handleError)
      );
  }

  logout(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/auth/login']);
  }

  setRedirectUrl(url: string): void {
    localStorage.setItem('redirectUrl', url);
  }

  getRedirectUrl(): string {
    return localStorage.getItem('redirectUrl') || '/';
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private handleError(error: any): Observable<never> {
    console.error('An error occurred:', error);
    return throwError(error);
  }
}
