// number.util.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NumberUtil {
  constructor() {}

  formatCurrency(amount: number): string {
    // Implement currency formatting logic here
    const formattedAmount = `$${amount.toFixed(2)}`; // Format amount to 2 decimal places and prepend with '$'
    return formattedAmount; // Return the formatted currency string
  }
}

