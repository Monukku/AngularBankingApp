import { Routes } from '@angular/router';
import { authGuard } from '../../core/guards/auth.guard';

export const STAFF_ROUTES: Routes = [
  {
    path: 'pending-accounts',
    canActivate: [authGuard],
    data: { roles: ['TELLER', 'BRANCH_MANAGER', 'SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/pending-accounts/pending-accounts.component').then(
        (m) => m.PendingAccountsComponent
      ),
  },
  {
    path: 'kyc-approvals',
    canActivate: [authGuard],
    data: { roles: ['RELATIONSHIP_MANAGER', 'BRANCH_MANAGER', 'SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/kyc-approvals/kyc-approvals.component').then(
        (m) => m.KycApprovalsComponent
      ),
  },
  {
    path: 'fraud-alerts',
    canActivate: [authGuard],
    data: { roles: ['BRANCH_MANAGER', 'SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/fraud-alerts/fraud-alerts.component').then(
        (m) => m.FraudAlertsComponent
      ),
  },
  {
    path: 'audit-logs',
    canActivate: [authGuard],
    data: { roles: ['AUDITOR', 'SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/audit-logs/audit-logs.component').then(
        (m) => m.AuditLogsComponent
      ),
  },
  {
    path: 'card-management',
    canActivate: [authGuard],
    data: { roles: ['TELLER', 'BRANCH_MANAGER', 'SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/card-management/card-management.component').then(
        (m) => m.CardManagementComponent
      ),
  },
  {
    path: 'loan-management',
    canActivate: [authGuard],
    data: { roles: ['CREDIT_OFFICER', 'BRANCH_MANAGER', 'SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/loan-management/loan-management.component').then(
        (m) => m.LoanManagementComponent
      ),
  },
  {
    path: 'staff-management',
    canActivate: [authGuard],
    data: { roles: ['SUPER_ADMIN'] },
    loadComponent: () =>
      import('./components/staff-management/staff-management.component').then(
        (m) => m.StaffManagementComponent
      ),
  },
  { path: '', redirectTo: 'pending-accounts', pathMatch: 'full' },
];
