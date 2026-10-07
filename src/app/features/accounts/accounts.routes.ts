import { Routes } from '@angular/router';
import { AccountManagementComponent } from './components/account-management/account-management.component';
import { TransferFundsComponent } from './components/transfer/transfer.component';
import { ManageBeneficiariesComponent } from './components/manage-beneficiaries/manage-beneficiaries.component';
import { authGuard } from '../../core/guards/auth.guard';
import { AccountSummaryComponent } from './components/account-summary/account-summary.component';
import { TransactionListComponent } from '../transactions/components/transaction-list/transaction-list.component';
import { FixedDepositComponent } from './components/fixed-deposit/fixed-deposit.component';
import { RecurringDepositComponent } from './components/recurring-deposit/recurring-deposit.component';

export const ACCOUNTS_ROUTES: Routes = [
  { path: '', component: AccountSummaryComponent, canActivate: [authGuard] },
  { path: 'account-summary', component: AccountSummaryComponent, canActivate: [authGuard] },
  { path: 'account-management', component: AccountManagementComponent, canActivate: [authGuard] },
  { path: 'transaction-history', component: TransactionListComponent, canActivate: [authGuard] },
  { path: 'transfer-funds', component: TransferFundsComponent, canActivate: [authGuard] },
  { path: 'manage-beneficiaries', component: ManageBeneficiariesComponent, canActivate: [authGuard] },
  { path: 'fixed-deposits', component: FixedDepositComponent, canActivate: [authGuard] },
  { path: 'recurring-deposits', component: RecurringDepositComponent, canActivate: [authGuard] },
];

