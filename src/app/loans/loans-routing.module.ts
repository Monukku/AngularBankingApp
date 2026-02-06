import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoanListComponent } from './components/loan-list/loan-list.component'; 
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component'; 
import { LoanCreateComponent } from './components/loan-create/loan-create.component';

const routes: Routes = [
  { path: '', component: LoanListComponent },
  { path: 'create', component: LoanCreateComponent },
  { path: ':id', component: LoanDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoansRoutingModule { }
