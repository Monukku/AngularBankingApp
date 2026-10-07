import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';

// NOTE: There is no beneficiaries microservice in the backend.
// Beneficiaries are managed client-side (localStorage) until a backend service is added.
@Injectable({
  providedIn: 'root',
})
export class BeneficiaryService {
  private storageKey = 'rewabank_beneficiaries';

  getBeneficiaries(): Observable<any[]> {
    const stored = localStorage.getItem(this.storageKey);
    return new Observable((observer) => {
      observer.next(stored ? JSON.parse(stored) : []);
      observer.complete();
    });
  }

  addBeneficiary(beneficiary: any): Observable<any> {
    if (!beneficiary?.name || !beneficiary?.accountNumber) {
      return throwError(() => new Error('Name and account number are required'));
    }
    const list: any[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const entry = { ...beneficiary, id: crypto.randomUUID() };
    list.push(entry);
    localStorage.setItem(this.storageKey, JSON.stringify(list));
    return new Observable((observer) => {
      observer.next(entry);
      observer.complete();
    });
  }

  deleteBeneficiary(beneficiaryId: string): Observable<any> {
    const list: any[] = JSON.parse(localStorage.getItem(this.storageKey) || '[]');
    const updated = list.filter((b) => b.id !== beneficiaryId);
    localStorage.setItem(this.storageKey, JSON.stringify(updated));
    return new Observable((observer) => {
      observer.next(null);
      observer.complete();
    });
  }
}
