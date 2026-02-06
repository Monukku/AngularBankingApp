import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/guards/auth.guard';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { HomeComponent } from './home/components/home/home.component';

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () =>
      import('./authentication/authentication.module').then(
        (m) => m.AuthenticationModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'dashboard',
    loadChildren: () =>
      import('./dashboard/dashboard.module').then((m) => m.DashboardModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
    canActivate: [AuthGuard],
  },
  {
    path: 'profile',
    loadChildren: () =>
      import('./user-profile/user-profile.module').then(
        (m) => m.UserProfileModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'transactions',
    loadChildren: () =>
      import('./transactions/transactions.module').then(
        (m) => m.TransactionsModule
      ),
    canActivate: [AuthGuard],
  },
  {
    path: 'accounts',
    loadChildren: () =>
      import('./accounts/accounts.module').then((m) => m.AccountsModule),
    canActivate: [AuthGuard],
    data: { roles: ['ACCOUNTS'] },
  },
  {
    path: 'loans',
    loadChildren: () =>
      import('./loans/loans.module').then((m) => m.LoansModule),
    canActivate: [AuthGuard],
    data: { roles: ['LOANS'] },
  },
  {
    path: 'cards',
    loadChildren: () =>
      import('./cards/cards.module').then((m) => m.CardsModule),
    canActivate: [AuthGuard],
    data: { roles: ['CARDS'] },
  },
  { path: '', component: HomeComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
