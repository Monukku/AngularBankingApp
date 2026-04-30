import { LoanListComponent } from './components/loan-list/loan-list.component';
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component';
import { LoanCreateComponent } from './components/loan-create/loan-create.component';
import { Routes } from '@angular/router';

export const LOANS_ROUTES: Routes = [
  { path: '', component: LoanListComponent },
  { path: 'create', component: LoanCreateComponent },
  { path: ':id', component: LoanDetailComponent }
];
