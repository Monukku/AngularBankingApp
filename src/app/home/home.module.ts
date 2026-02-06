import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './components/summary/summary.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';
import { CustomerFeedbackComponent } from './components/customer-feedback/customer-feedback.component';
import { HomeRoutingModule } from './home-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { KeycloakAuthService } from '../authentication/services/KeyCloakAuthService';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HomeRoutingModule,
    KeycloakAngularModule,
    HttpClientModule,
    BrowserAnimationsModule,
    SummaryComponent,
    PerformanceComponent,
    RecentTransactionsComponent,
    CustomerFeedbackComponent,
  ],
  providers: [KeycloakService, KeycloakAuthService],
})
export class HomeModule {}
