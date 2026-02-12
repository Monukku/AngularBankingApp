
// import { Component, OnInit } from '@angular/core';
// import { RouterOutlet } from '@angular/router';
// import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
// import { FooterComponent } from './shared/components/footer/footer.component';
// import { NotificationComponent } from './shared/components/notification/notification.component';
// import { CommonModule } from '@angular/common';
// import { SharedModule } from './shared/shared.module';
// import { HeaderComponent } from './shared/components/header/header.component';
// import { KeycloakService } from 'keycloak-angular';
// import { Store } from '@ngrx/store';
// import * as AuthActions from './store/actions/auth.actions';
// import { Observable } from 'rxjs';
// import { selectIsAuthenticated } from './store/selectors/auth.selectors';

// @Component({
//   selector: 'app-root',
//   standalone: true,
//   imports: [
//     CommonModule,
//     RouterOutlet,
//     HeaderComponent,
//     SidebarComponent,
//     FooterComponent,
//     NotificationComponent,
//     SharedModule,
//   ],
//   templateUrl: './app.component.html',
//   styleUrl: './app.component.scss',
// })
// export class AppComponent implements OnInit {
//   title = 'banking-app';

//    // ✅ Observable for authentication status
//   isAuthenticated$: Observable<boolean>;

//   constructor(
//     private keycloakService: KeycloakService,
//     private store: Store
//   ) {
//     this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
//   }

//   async ngOnInit() {
//     // ✅ Sync Keycloak authentication state with NgRx
//     try {
//       const isLoggedIn = await this.keycloakService.isLoggedIn();

//       if (isLoggedIn) {
//         const userProfile = await this.keycloakService.loadUserProfile();
//         this.store.dispatch(AuthActions.loginSuccess({ user: userProfile }));
//         this.store.dispatch(
//           AuthActions.setAuthenticated({ authenticated: true })
//         );
//       } else {
//         this.store.dispatch(
//           AuthActions.setAuthenticated({ authenticated: false })
//         );
//       }
//     } catch (error) {
//       console.error('Failed to sync auth state on app init', error);
//     }
//   }
// }

import { Component, OnInit, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { KeycloakService } from 'keycloak-angular';
import * as AuthActions from './store/actions/auth.actions';
import { selectIsAuthenticated } from './store/selectors/auth.selectors';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './shared/components/header/header.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NotificationComponent,
    SharedModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'banking-app';
  isAuthenticated$: Observable<boolean>;
  private platformId = inject(PLATFORM_ID);

  constructor(
    private keycloakService: KeycloakService,
    private store: Store
  ) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
  }

  async ngOnInit() {
    // Only sync auth state in browser
    if (isPlatformBrowser(this.platformId)) {
      try {
        const isLoggedIn = await this.keycloakService.isLoggedIn();

        if (isLoggedIn) {
          const userProfile = await this.keycloakService.loadUserProfile();
          this.store.dispatch(AuthActions.loginSuccess({ user: userProfile }));
          this.store.dispatch(AuthActions.setAuthenticated({ authenticated: true }));
        } else {
          this.store.dispatch(AuthActions.setAuthenticated({ authenticated: false }));
        }
      } catch (error) {
        console.error('Failed to sync auth state on app init', error);
      }
    }
  }
}