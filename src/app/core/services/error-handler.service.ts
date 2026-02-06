// error-handler.service.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlerService {
  constructor() {}

  handleError(error: any): void {
    // Implement error handling logic here
  }
}
