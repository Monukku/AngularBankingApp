import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


export const routes: Routes = [

  // Auth Routes (public - no guard needed)
  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  {
    path: '',
    redirectTo: '/auth',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/user-profile/user-profile.routes').then(
        (m) => m.USER_PROFILE_ROUTES
      ),
  },
  {
    path: 'transactions',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/transactions/transactions.routes').then(
        (m) => m.TRANSACTIONS_ROUTES
      ),
  },
  {
    path: 'accounts',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
  },
  {
    path: 'loans',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/loans/loans.routes').then((m) => m.LOANS_ROUTES),
  },
  {
    path: 'cards',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/cards/cards.routes').then((m) => m.CARDS_ROUTES),
  },
  {
    path: 'kyc',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/kyc/kyc.routes').then((m) => m.KYC_ROUTES),
  },
  {
    path: 'staff',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['TELLER', 'RELATIONSHIP_MANAGER', 'BRANCH_MANAGER', 'CREDIT_OFFICER', 'AUDITOR', 'SUPER_ADMIN'] },
    loadChildren: () =>
      import('./features/staff/staff.routes').then((m) => m.STAFF_ROUTES),
  },
  // Add unauthorized route
  {
    path: 'unauthorized',
    component: NotFoundComponent, // Or create UnauthorizedComponent
  },
  {
    path: '404',
    component: NotFoundComponent,
  },

  {
    path: '**',
    redirectTo: '404',
  },
];
