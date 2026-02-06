import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { Store } from '@ngrx/store';
import { AuthState } from '../../../store/reducers/auth.reducer';
import * as AuthActions from '../../../store/actions/auth.actions';
import { MatMenuModule } from '@angular/material/menu';
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatMenuModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent {
  authenticated$: Observable<boolean>;

  constructor(private store: Store<{ auth: AuthState }>) {
    this.authenticated$ = this.store.select((state) => {
      return state.auth?.authenticated;
    });
  }

  onLogin() {
    this.store.dispatch(AuthActions.login());
  }

  onLogout() {
    this.store.dispatch(AuthActions.logout());
  }
}
