import { Injectable, inject } from '@angular/core';
import { Observable, shareReplay } from 'rxjs';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);

  // Cache to avoid repeated calls on the same session
  private authProfile$: Observable<any> | null = null;
  private customerProfile$: Observable<any> | null = null;

  // GET /api/v1/auth/me — Keycloak-backed banking profile (roles, email, userId)
  getAuthProfile(): Observable<any> {
    if (!this.authProfile$) {
      this.authProfile$ = this.api.getProfile().pipe(shareReplay(1));
    }
    return this.authProfile$;
  }

  // GET /api/v1/customers/me — customer record (KYC status, contact details)
  getCustomerProfile(): Observable<any> {
    if (!this.customerProfile$) {
      this.customerProfile$ = this.api.getMyCustomerProfile().pipe(shareReplay(1));
    }
    return this.customerProfile$;
  }

  invalidateCache(): void {
    this.authProfile$ = null;
    this.customerProfile$ = null;
  }
}
