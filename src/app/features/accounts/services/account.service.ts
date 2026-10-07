import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService, BalanceResponse, FixedDepositResponse, RecurringDepositResponse } from '../../../core/services/api.service';
import { Account } from '../models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private api = inject(ApiService);

  getMyAccounts(): Observable<Account[]> { return this.api.getMyAccounts(); }
  getAccount(accountId: string): Observable<Account> { return this.api.getAccount(accountId); }
  getBalance(accountNumber: string): Observable<BalanceResponse> { return this.api.getBalance(accountNumber); }
  createAccount(data: { accountType: string; customerId: string }): Observable<Account> { return this.api.createAccount(data); }
  activateAccount(accountId: string): Observable<Account> { return this.api.activateAccount(accountId); }
  rejectAccount(accountId: string, reason: string): Observable<Account> { return this.api.rejectAccount(accountId, reason); }
  freezeAccount(accountId: string, reason = 'Frozen by user'): Observable<Account> { return this.api.freezeAccount(accountId, reason); }
  unfreezeAccount(accountId: string): Observable<Account> { return this.api.unfreezeAccount(accountId); }
  closeAccount(accountId: string): Observable<Account> { return this.api.closeAccount(accountId); }
  getAccountsByStatus(status: string): Observable<Account[]> { return this.api.getAccountsByStatus(status); }
  openFixedDeposit(data: { sourceAccountId: string; depositAmount: number; tenureMonths: number }, customerId: string): Observable<FixedDepositResponse> { return this.api.openFixedDeposit(data, customerId); }
  getMyFixedDeposits(): Observable<FixedDepositResponse[]> { return this.api.getMyFixedDeposits(); }
  openRecurringDeposit(data: { sourceAccountId: string; installmentAmount: number; tenureMonths: number }, customerId: string): Observable<RecurringDepositResponse> { return this.api.openRecurringDeposit(data, customerId); }
  getMyRecurringDeposits(): Observable<RecurringDepositResponse[]> { return this.api.getMyRecurringDeposits(); }
}
