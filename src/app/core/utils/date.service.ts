// date.util.ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DateUtil {
  constructor() {}

  formatDate(date: Date): string {
    // Implement date formatting logic here
    const formattedDate = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
    return formattedDate; // Return the formatted date
  }
}

