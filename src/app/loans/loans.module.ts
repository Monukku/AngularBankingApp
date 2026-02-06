import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LoanListComponent } from './components/loan-list/loan-list.component'; 
import { LoanDetailComponent } from './components/loan-detail/loan-detail.component'; 
import { LoanCreateComponent } from './components/loan-create/loan-create.component'; 
import { LoansRoutingModule } from './loans-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

@NgModule({
  declarations: [
    
  ],
  imports: [
    LoanListComponent,
    LoanDetailComponent,
    LoanCreateComponent,

    HttpClientModule,
    CommonModule,
    LoansRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers:[
   KeycloakService
  ]
})
export class LoansModule { }
