import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly THEME_KEY = 'rewa-theme';
  private platformId = inject(PLATFORM_ID);
  isDarkMode = false;

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return; // 👈 stop here on server

    const stored = localStorage.getItem(this.THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    this.isDarkMode = stored ? stored === 'dark' : prefersDark;
    this.apply();

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem(this.THEME_KEY)) {
        this.isDarkMode = e.matches;
        this.apply();
      }
    });
  }

  toggle(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.isDarkMode = !this.isDarkMode;
    this.apply();
    localStorage.setItem(this.THEME_KEY, this.isDarkMode ? 'dark' : 'light');
  }

  private apply(): void {
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    document.documentElement.classList.toggle('light', !this.isDarkMode);
  }
}