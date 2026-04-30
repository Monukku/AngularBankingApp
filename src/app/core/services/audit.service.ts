// audit.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AuditService {
  constructor() {}

  logAction(action: string): void {
    console.debug('[AuditService] action:', action);
  }
}
