import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FooterComponent } from './components/footer/footer.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { NotificationComponent } from './components/notification/notification.component';
import { HighlightDirective } from './directives/highlight.directive';
import { TooltipDirective } from './directives/tooltip.directive';
import { CurrencyPipe } from './pipes/currency.pipe';
import { DateFormatPipe } from './pipes/date-format.pipe';
import { FilterPipe } from './pipes/filter.pipe';
import { UiKitModule } from './modules/ui-kit/ui-kit.module';
import { ThemeModule } from './modules/theme/theme.module';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../authentication/services/auth.service';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';

@NgModule({
  declarations: [
    HighlightDirective,
    CurrencyPipe,
    DateFormatPipe,
    FilterPipe,
    TooltipDirective,
  ],
  imports: [
    NotificationComponent,
    SidebarComponent,
    FooterComponent,
    CommonModule,
    UiKitModule,
    ThemeModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatListModule,
    MatSnackBarModule,
  ],
  exports: [
    FooterComponent,
    SidebarComponent,
    NotificationComponent,
    HighlightDirective,
    TooltipDirective,
    CurrencyPipe,
    DateFormatPipe,
    FilterPipe,
    UiKitModule,
    KeycloakAngularModule,
    ThemeModule,
  ],
  providers: [AuthService, KeycloakService],
})
export class SharedModule {}
