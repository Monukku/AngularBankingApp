import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // <-- Import FormsModule
import { MatInputModule } from '@angular/material/input'; // <-- Import MatInputModule
import { MatFormFieldModule } from '@angular/material/form-field'; // <-- Import MatFormFieldModule
import { MatButtonModule } from '@angular/material/button'; // <-- Import MatButtonModule
import { MatCardModule } from '@angular/material/card'; // <-- Import MatCardModule
import { MatTableModule } from '@angular/material/table';
import { AccountRoutingModule } from './accounts-routing.module';
import { AccountService } from './services/account.service';
import { KeycloakService } from 'keycloak-angular';
import { HttpClient, HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AccountRoutingModule,
    HttpClientModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatButtonModule,
    MatCardModule,
  ],
  providers: [KeycloakService, AccountService, HttpClient],
})
export class AccountsModule {}
