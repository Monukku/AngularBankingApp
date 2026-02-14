// sidebar.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import * as AuthActions from '../../../store/auth/auth.actions';
import { selectIsAuthenticated, selectCurrentUser } from '../../../store/auth/auth.selectors';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
})
export class SidebarComponent {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;

  constructor(private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }
}