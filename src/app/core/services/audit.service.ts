// audit.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor() {}

  logAction(_action: string): void {
    // Implement audit logging logic here
  }
}
