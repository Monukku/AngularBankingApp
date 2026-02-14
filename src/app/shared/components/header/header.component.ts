import { Component, OnInit, Output, EventEmitter } from '@angular/core';
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
export class HeaderComponent implements OnInit {
  isAuthenticated$: Observable<boolean>;
  currentUser$: Observable<any>;

  @Output() sidebarToggle = new EventEmitter<void>();

  constructor(private store: Store) {
    this.isAuthenticated$ = this.store.select(selectIsAuthenticated);
    this.currentUser$ = this.store.select(selectCurrentUser);
  }

  ngOnInit(): void {}

  login(): void {
    this.store.dispatch(AuthActions.login());
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  toggleSidebar(): void {
    this.sidebarToggle.emit();
  }
}
