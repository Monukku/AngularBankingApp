// transactions.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransferFundsComponent } from './components/transfer-funds/transfer-funds.component';
import { TransactionDetailsComponent } from './components/transaction-details/transaction-details.component';
import { RecurringPaymentsComponent } from './components/recurring-payments/recurring-payments.component';
import { TransactionService } from './services/transaction.service';
import { PaymentService } from './services/payment.service';
import { RecurringPaymentService } from './services/recurring-payment.service';
import { TransactionsRoutingModule } from './transactions-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { AuthGuard } from '../authentication/guards/auth.guard';
import { KeycloakService } from 'keycloak-angular';

@NgModule({
  declarations: [
  ],
  imports: [
    CommonModule,
    FormsModule,
    TransactionsRoutingModule,
   
    HttpClientModule,
    TransactionListComponent,
    TransferFundsComponent,
    TransactionDetailsComponent,
    RecurringPaymentsComponent,
  ],
  providers: [
    TransactionService,
    PaymentService,
    KeycloakService,
    RecurringPaymentService
  ]
})
export class TransactionsModule { }
