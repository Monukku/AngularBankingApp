import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountManagementComponent } from './components/account-management/account-management.component';
import { TransferFundsComponent } from './components/transfer/transfer.component';
import { ManageBeneficiariesComponent } from './components/manage-beneficiaries/manage-beneficiaries.component';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { AccountSummaryComponent } from './components/account-summary/account-summary.component';
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component';

const routes: Routes = [
  {
    path: 'account-management',
    component: AccountManagementComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'account-summary',
    component: AccountSummaryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transaction-history',
    component: TransactionHistoryComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'transfer-funds',
    component: TransferFundsComponent,
    canActivate: [AuthGuard],
  },
  {
    path: 'manage-beneficiaries',
    component: ManageBeneficiariesComponent,
    canActivate: [AuthGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AccountRoutingModule {}
