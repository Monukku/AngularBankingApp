import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs';
import { selectIsAuthenticated } from './store/auth/auth.selectors';
import { HeaderComponent }       from './shared/components/header/header.component';
import { SidebarComponent }      from './shared/components/sidebar/sidebar.component';
import { FooterComponent }       from './shared/components/footer/footer.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { ThemeService } from './core/services/theme.service';
import { AuthService } from './core/services/auth.service';

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
export class AppComponent {
  title = 'banking-app';


  private store = inject(Store);
  // Eagerly instantiate singletons so they initialize on app boot
  private themeService = inject(ThemeService);
  private authService = inject(AuthService);

  isAuthenticated$: Observable<boolean> = this.store.select(selectIsAuthenticated);
}