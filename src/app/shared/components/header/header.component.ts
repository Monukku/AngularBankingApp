import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectIsAuthenticated, selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatMenuModule,
    MatDividerModule,
    MatBadgeModule,
    MatTooltipModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;
  notificationCount = 3;
  isDarkMode = false;

  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() themeToggled  = new EventEmitter<boolean>();

  private readonly THEME_KEY = 'rewa-theme';
  private mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  private mediaQueryListener = (e: MediaQueryListEvent) => this.onSystemThemeChange(e);

  constructor(private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$     = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    this.initTheme();
    this.mediaQuery.addEventListener('change', this.mediaQueryListener);
  }

  ngOnDestroy(): void {
    this.mediaQuery.removeEventListener('change', this.mediaQueryListener);
  }

  login(): void {
    this.store.dispatch(AuthActions.login());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }

  toggleTheme(): void {
    this.isDarkMode = !this.isDarkMode;
    this.applyTheme();
    localStorage.setItem(this.THEME_KEY, this.isDarkMode ? 'dark' : 'light');
    this.themeToggled.emit(this.isDarkMode);
  }

  private initTheme(): void {
    const stored = localStorage.getItem(this.THEME_KEY);
    // Stored preference wins; fall back to OS preference
    this.isDarkMode = stored ? stored === 'dark' : this.mediaQuery.matches;
    this.applyTheme();
  }

  private applyTheme(): void {
    // Toggle .dark on <html> — this is the single source of truth
    // All CSS variables in styles.scss react to :root.dark
    document.documentElement.classList.toggle('dark', this.isDarkMode);
    // Also stamp .light so the OS @media block stays suppressed
    document.documentElement.classList.toggle('light', !this.isDarkMode);
  }

  private onSystemThemeChange(e: MediaQueryListEvent): void {
    // Only follow OS change if user hasn't set a manual preference
    if (!localStorage.getItem(this.THEME_KEY)) {
      this.isDarkMode = e.matches;
      this.applyTheme();
    }
  }
}