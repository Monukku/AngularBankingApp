import { Component, OnInit, OnDestroy, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, HostBinding, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { signal } from '@angular/core';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectIsAuthenticated, selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { ThemeService } from '../../../core/services/theme.service';
import { AuthService } from '../../../core/services/auth.service';
import { BrandAnimationService } from '../../../core/services/brand-animation.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, MatListModule, MatIconModule, MatButtonModule, MatSnackBarModule],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent implements OnInit, OnDestroy {
  private store = inject(Store);
  private cdr = inject(ChangeDetectorRef);
  private brandAnim = inject(BrandAnimationService);
  private router = inject(Router);
  private snackBar = inject(MatSnackBar);
  public themeService = inject(ThemeService);
  public authService = inject(AuthService);

  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
  currentUser$: Observable<any> = this.store.select(selectCurrentUser);

  collapsed = signal(true);
  @Output() collapsedChange = new EventEmitter<boolean>();

  @HostBinding('class.sidebar-collapsed') get isCollapsed() { return this.collapsed(); }

  onMouseEnter(): void {
    this.collapsed.set(false);
    this.collapsedChange.emit(false);
    this.cdr.markForCheck();
  }

  onMouseLeave(): void {
    this.collapsed.set(true);
    this.collapsedChange.emit(true);
    this.cdr.markForCheck();
  }

  brandLetters:   { char: string; visible: boolean }[] = [];
  taglineLetters: { char: string; visible: boolean }[] = [];

  private readonly fullText    = 'REWA BANK';
  private readonly taglineText = 'PRIVATE BANKING';
  private timeouts: ReturnType<typeof setTimeout>[] = [];

  ngOnInit(): void {
    this.brandLetters   = this.brandAnim.buildLetters(this.fullText);
    this.taglineLetters = this.brandAnim.buildLetters(this.taglineText);
    this.brandAnim.startLoop(this.brandLetters, this.taglineLetters, this.timeouts, () => this.cdr.markForCheck());
  }

  ngOnDestroy(): void {
    this.brandAnim.clearTimeouts(this.timeouts);
  }

  getDisplayName(user: any): string {
    if (!user) return 'User Name';
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    if (user.firstName) return user.firstName;
    if (user.name) return user.name;
    if (user.preferredUsername) return user.preferredUsername;
    const u = user.username || '';
    return u.includes('@') ? u.split('@')[0] : (u || 'User Name');
  }

  getInitial(user: any): string {
    if (!user) return 'U';
    if (user.firstName) return user.firstName.charAt(0).toUpperCase();
    const u = user.preferredUsername || user.username || '';
    const base = u.includes('@') ? u.split('@')[0] : u;
    return base.charAt(0).toUpperCase() || 'U';
  }

  toggleTheme(): void { this.themeService.toggle(); }
  logout(): void { this.store.dispatch(AuthActions.logout()); }
  goToProfile(): void { this.router.navigate(['/profile']); }

  copyEmail(email: string): void {
    if (!email) return;
    navigator.clipboard.writeText(email).then(() => {
      this.snackBar.open('Email copied!', '', {
        duration: 1500,
        horizontalPosition: 'end',
        verticalPosition: 'top',
        panelClass: ['snackbar-copied'],
      });
    });
  }
}
