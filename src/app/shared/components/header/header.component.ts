import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, inject } from '@angular/core';
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
import { BrandAnimationService } from '../../../core/services/brand-animation.service';
import { ThemeService } from '../../../core/services/theme.service';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private brandAnim = inject(BrandAnimationService);
  public themeService = inject(ThemeService);

  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  currentUser$: Observable<any> = this.store.select(selectCurrentUser);

  get isDarkMode(): boolean { return this.themeService.isDarkMode; }

  brandLetters:   { char: string; visible: boolean }[] = [];
  taglineLetters: { char: string; visible: boolean }[] = [];

  private readonly brandText   = 'REWA BANK';
  private readonly taglineText = 'PRIVATE BANKING';
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  @Output() sidebarToggle = new EventEmitter<void>();
  @Output() themeToggled  = new EventEmitter<boolean>();

  ngOnInit(): void {
    this.brandLetters   = this.brandAnim.buildLetters(this.brandText);
    this.taglineLetters = this.brandAnim.buildLetters(this.taglineText);
    this.brandAnim.startLoop(this.brandLetters, this.taglineLetters, this.timeouts, () => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.brandAnim.clearTimeouts(this.timeouts);
  }

  login(): void  { this.store.dispatch(AuthActions.login()); }
  logout(): void { this.store.dispatch(AuthActions.logout()); }
  toggleSidebar(): void { this.sidebarToggle.emit(); }

  toggleTheme(): void {
    this.themeService.toggle();
    this.themeToggled.emit(this.themeService.isDarkMode);
    this.cdr.markForCheck();
  }
}
