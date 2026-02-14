// import { Routes } from '@angular/router';
// import { AuthGuard } from './authentication/guards/auth.guard';
// import { NoAuthGuard } from './authentication/guards/no-auth.guard';
// import { NotFoundComponent } from './shared/components/not-found/not-found.component';
// import { HomeComponent } from './home/components/home/home.component';

// export const routes: Routes = [

//   {
//   path: '',
//   redirectTo: 'home',
//   pathMatch: 'full'
// },
// {
//   path: 'home',
//   component: HomeComponent,
//   canActivate: [AuthGuard]
// },
//   {
//     path: 'auth',
//     canActivate: [NoAuthGuard],
//     loadChildren: () =>import('./authentication/authentication.routes').then((m) => m.AUTHENTICATION_ROUTES),
//   },
//   {
//     path: 'dashboard',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
//   },
//   {
//     path: 'profile',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./user-profile/user-profile.routes').then((m) => m.USER_PROFILE_ROUTES),
//   },
//   {
//     path: 'transactions',
//     canActivate: [AuthGuard],
//     loadChildren: () => import('./transactions/transactions.routes').then((m) => m.TRANSACTIONS_ROUTES),
//   },
//   {
//     path: 'accounts',
//     canActivate: [AuthGuard],
//     data: { roles: ['ACCOUNTS'] },
//     loadChildren: () => import('./accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
//   },
//   {
//     path: 'loans',
//     canActivate: [AuthGuard],
//     data: { roles: ['LOANS'] },
//     loadChildren: () =>import('./loans/loans.routes').then((m) => m.LOANS_ROUTES),
//   },
//   {
//     path: 'cards',
//     canActivate: [AuthGuard],
//     data: { roles: ['CARDS'] },
//     loadChildren: () => import('./cards/cards.routes').then((m) => m.CARDS_ROUTES),
//   },

//   // ⭐ Always last
//   // Wildcard route MUST ALWAYS be LAST
//   {
//     path: '404',
//     component: NotFoundComponent
//   },

//   {
//     path: '**',
//     redirectTo: '404'
//   }
// ];


import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { HomeComponent } from './features/home/components/home/home.component';

export const routes: Routes = [
  
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full',
  },
  {
    path: 'home',
    component: HomeComponent,
    canActivate: [AuthGuard],
  },
  
  {
    path: 'dashboard',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/dashboard/dashboard.routes').then((m) => m.DASHBOARD_ROUTES),
  },
  {
    path: 'profile',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/user-profile/user-profile.routes').then(
        (m) => m.USER_PROFILE_ROUTES
      ),
  },
  {
    path: 'transactions',
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./features/transactions/transactions.routes').then(
        (m) => m.TRANSACTIONS_ROUTES
      ),
  },
  {
    path: 'accounts',
    canActivate: [AuthGuard],
    data: { roles: ['ACCOUNTS'] },
    loadChildren: () =>
      import('./features/accounts/accounts.routes').then((m) => m.ACCOUNTS_ROUTES),
  },
  {
    path: 'loans',
    canActivate: [AuthGuard],
    data: { roles: ['LOANS'] },
    loadChildren: () =>
      import('./features/loans/loans.routes').then((m) => m.LOANS_ROUTES),
  },
  {
    path: 'cards',
    canActivate: [AuthGuard],
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
