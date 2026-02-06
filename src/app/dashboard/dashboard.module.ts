import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SummaryComponent } from './components/summary/summary.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';
import { CustomerFeedbackComponent } from './components/customer-feedback/customer-feedback.component';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { KeycloakService } from 'keycloak-angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    DashboardRoutingModule,

    HttpClientModule,
    SummaryComponent,
    PerformanceComponent,
    RecentTransactionsComponent,
    CustomerFeedbackComponent
  ],
  providers:[KeycloakService]

})
export class DashboardModule { }
