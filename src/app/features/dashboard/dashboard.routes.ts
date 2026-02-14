import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SummaryComponent } from './components/summary/summary.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';
import { CustomerFeedbackComponent } from './components/customer-feedback/customer-feedback.component';
import { AuthGuard } from '../../core/guards/auth.guard';
import { RoleGuard } from '../../core/guards/role.guard';
import { DashboardComponent } from './components/dashboard/dashboard.component';

export const DASHBOARD_ROUTES: Routes = [
      { path: '', redirectTo: 'user-dashboard', pathMatch: 'full' },
      { path: 'user-dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
      { path: 'summary', component: SummaryComponent, canActivate: [AuthGuard] },
      { path: 'performance', component: PerformanceComponent, canActivate: [AuthGuard] },
      { path: 'recent-transactions',  component: RecentTransactionsComponent, canActivate: [AuthGuard] },
      { path: 'customer-feedback', component: CustomerFeedbackComponent, canActivate: [AuthGuard] }

];
