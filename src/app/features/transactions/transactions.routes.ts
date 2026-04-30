import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransferFundsComponent } from './components/transfer-funds/transfer-funds.component';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { RecurringPaymentsComponent } from './components/recurring-payments/recurring-payments.component';
import { authGuard } from '../../core/guards/auth.guard';
import { roleGuard } from '../../core/guards/role.guard';

export const TRANSACTIONS_ROUTES: Routes = [
  { path: 'list', component: TransactionListComponent, canActivate: [authGuard]},
  { path: 'transfer-funds', component: TransferFundsComponent, canActivate: [authGuard]},
  { path: 'details/:id', component: TransactionDetailsComponent, canActivate: [authGuard]},
  { path: 'recurring', component: RecurringPaymentsComponent, canActivate: [authGuard]}
];
