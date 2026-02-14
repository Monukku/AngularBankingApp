import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private platformId = inject(PLATFORM_ID);

  /**
   * Set item in localStorage
   */
  setItem(key: string, value: any): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const serialized = JSON.stringify(value);
        localStorage.setItem(key, serialized);
      } catch (error) {
        console.error('Error saving to localStorage', error);
      }
    }
  }

  /**
   * Get item from localStorage
   */
  getItem<T>(key: string): T | null {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : null;
      } catch (error) {
        console.error('Error reading from localStorage', error);
        return null;
      }
    }
    return null;
  }

  /**
   * Remove item from localStorage
   */
  removeItem(key: string): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem(key);
    }
  }

  /**
   * Clear all localStorage
   */
  clear(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.clear();
    }
  }

  /**
   * Check if key exists
   */
  hasItem(key: string): boolean {
    if (isPlatformBrowser(this.platformId)) {
      return localStorage.getItem(key) !== null;
    }
    return false;
  }
}