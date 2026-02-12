// import { Component } from '@angular/core';
// import { CommonModule } from '@angular/common';
// import { Observable } from 'rxjs';
// import { Store } from '@ngrx/store';
// import { AuthState } from '../../../store/reducers/auth.reducer';
// import * as AuthActions from '../../../store/actions/auth.actions';
// import { MatMenuModule } from '@angular/material/menu';
// @Component({
//   selector: 'app-header',
//   standalone: true,
//   imports: [CommonModule, MatMenuModule],
//   templateUrl: './header.component.html',
//   styleUrls: ['./header.component.scss'],
// })
// export class HeaderComponent {
//   authenticated$: Observable<boolean>;

//   constructor(private store: Store<{ auth: AuthState }>) {
//     this.authenticated$ = this.store.select((state) => {
//       return state.auth?.authenticated;
//     });
//   }

//   onLogin() {
//     this.store.dispatch(AuthActions.login());
//   }

//   onLogout() {
//     this.store.dispatch(AuthActions.logout());
//   }
// }


import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../store/actions/auth.actions';
import { selectIsAuthenticated, selectCurrentUser } from '../../../store/selectors/auth.selectors';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatToolbarModule,
    MatDividerModule,
    MatMenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  // ✅ Observable for authentication status
  isAuthenticated$: Observable<boolean>;
  
  // ✅ Observable for current user
  currentUser$: Observable<any>;

  constructor(private store: Store) {
    // ✅ Subscribe to auth state from NgRx
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {
    // Component initialization
  }

  // ✅ Dispatch login action (triggers Keycloak login)
  login(): void {
    this.store.dispatch(AuthActions.login());
  }

  // ✅ Dispatch logout action (triggers Keycloak logout)
  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}
