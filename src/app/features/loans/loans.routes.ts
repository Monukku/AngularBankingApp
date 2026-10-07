import { Routes } from '@angular/router';
import { LoanListComponent } from './components/loan-list/loan-list.component';
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component';
import { LoanCreateComponent } from './components/loan-create/loan-create.component';
import { authGuard } from '../../core/guards/auth.guard';

export const LOANS_ROUTES: Routes = [
  { path: '', component: LoanListComponent, canActivate: [authGuard] },
  { path: 'create', component: LoanCreateComponent, canActivate: [authGuard] },
  { path: ':id', component: LoanDetailComponent, canActivate: [authGuard] }
];
