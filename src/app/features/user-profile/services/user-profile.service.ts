import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from '../../../core/services/api.service';

@Injectable({
  providedIn: 'root',
})
export class UserProfileService {
  private api = inject(ApiService);

  getAuthProfile(): Observable<any> {
    return this.api.getProfile();
  }

  getCustomerProfile(): Observable<any> {
    return this.api.getMyCustomerProfile();
  }

  updateName(data: { firstName?: string; lastName?: string }): Observable<any> {
    return this.api.updateProfile(data);
  }

  updateAddress(data: { addressLine1?: string; addressLine2?: string; city?: string; state?: string; pincode?: string; country?: string }): Observable<any> {
    return this.api.updateCustomerAddress(data);
  }
}
