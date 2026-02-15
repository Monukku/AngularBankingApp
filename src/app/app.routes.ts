import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';


export const routes: Routes = [
  

  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => 
      import('./features/dashboard/components/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },  
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
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
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ACCOUNTS'] },
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
  },
  {
    path: 'loans',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['LOANS'] },
    loadChildren: () =>
      import('./features/loans/loans.routes').then((m) => m.LOANS_ROUTES),
  },
  {
    path: 'cards',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['CARDS'] },
    loadChildren: () =>
      import('./features/cards/cards.routes').then((m) => m.CARDS_ROUTES),
  },
  // ✅ Add unauthorized route
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
