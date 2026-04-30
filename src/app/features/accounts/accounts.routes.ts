import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AccountManagementComponent } from './components/account-management/account-management.component';
import { TransferFundsComponent } from './components/transfer/transfer.component';
import { ManageBeneficiariesComponent } from './components/manage-beneficiaries/manage-beneficiaries.component';
import { authGuard } from '../../core/guards/auth.guard'; 
import { AccountSummaryComponent } from './components/account-summary/account-summary.component';
import { TransactionHistoryComponent } from '../transactions/components/transaction-history/transaction-history.component'; 

export const ACCOUNTS_ROUTES: Routes = [
  {
    path: '',
    canActivate: [authGuard],
    children: [
  {path: 'account-management',component: AccountManagementComponent},
  {path: 'account-summary',component: AccountSummaryComponent},
  {path: 'transaction-history',component: TransactionHistoryComponent},
  {path: 'transfer-funds',component: TransferFundsComponent},
  {path: 'manage-beneficiaries',component: ManageBeneficiariesComponent},
  
]
}
];

