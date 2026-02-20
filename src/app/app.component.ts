import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import * as AuthActions from './store/auth/auth.actions';
import { selectIsAuthenticated } from './store/auth/auth.selectors';
import { HeaderComponent }       from './shared/components/header/header.component';
import { SidebarComponent }      from './shared/components/sidebar/sidebar.component';
import { FooterComponent }       from './shared/components/footer/footer.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { mapKeycloakProfileToUserProfile } from './core/models/user.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NotificationComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  title = 'banking-app';
  isAuthenticated$: Observable<boolean>;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private store: Store,
    private keycloakService: KeycloakService,
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  async ngOnInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {

      // 1. Theme restoration
      const stored = localStorage.getItem('rewa-theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = stored ? stored === 'dark' : prefersDark;
      document.documentElement.classList.toggle('dark',  isDark);
      document.documentElement.classList.toggle('light', !isDark);

      // 2. Keycloak auth sync
      try {
        const isLoggedIn = await this.keycloakService.isLoggedIn();
        if (isLoggedIn) {
          const keycProfile = await this.keycloakService.loadUserProfile();
          const mappedProfile = mapKeycloakProfileToUserProfile(keycProfile);
          this.store.dispatch(AuthActions.loginSuccess({ user: mappedProfile }));
          this.store.dispatch(AuthActions.setAuthenticated({ authenticated: true }));
        } else {
          this.store.dispatch(AuthActions.setAuthenticated({ authenticated: false }));
        }
      } catch (error) {
        console.error('Failed to sync auth state on app init', error);
      }

    }
  }

  onThemeToggled(isDark: boolean): void {
    // Header owns the toggle logic. Add analytics/API calls here if needed.
  }
}