import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, HostListener, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { UserService } from '../../../../core/services/user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
  ],
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountManagementComponent implements OnInit {
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private snackBar = inject(MatSnackBar);
  private fb = inject(FormBuilder);
  private cdr = inject(ChangeDetectorRef);
  private route = inject(ActivatedRoute);
  protected authService = inject(AuthService);

  accountTypes = ['SAVINGS', 'CURRENT', 'BUSINESS'];
  minBalanceMap: Record<string, string> = {
    SAVINGS: '₹1,000',
    CURRENT: '₹10,000',
    BUSINESS: '₹10,000',
  };
  openDropdown: 'accountType' | null = null;

  openHoverDD(name: 'accountType') { this.openDropdown = name; this.cdr.markForCheck(); }
  closeHoverDD() { this.openDropdown = null; this.cdr.markForCheck(); }

  selectAccountType(type: string) {
    this.createForm.get('accountType')?.setValue(type);
    this.openDropdown = null;
    this.cdr.markForCheck();
  }

  createForm: FormGroup = this.fb.group({
    accountType: [this.accountTypes[0], Validators.required],
  });

  accounts: any[] = [];
  selectedAccount: any = null;
  showCreateForm = false;
  errorMessage: string | null = null;
  customerIdLoading = true;
  protected customerId: string | null = null;

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown = null; this.cdr.markForCheck(); }

  ngOnInit(): void {
    this.userService.getCustomerProfile().subscribe({
      next: (profile) => {
        this.customerId = profile?.id ?? profile?.customerId ?? null;
        this.customerIdLoading = false;
        if (!this.customerId) {
          this.errorMessage = 'Could not determine your customer ID. Please contact support.';
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.customerIdLoading = false;
        this.errorMessage = 'Could not load customer profile. Please refresh and try again.';
        this.cdr.markForCheck();
      },
    });
    this.loadAccounts();
  }

  loadAccounts(): void {
    const targetId = this.route.snapshot.queryParamMap.get('accountId');
    this.accountService.getMyAccounts().subscribe({
      next: (accounts) => {
        this.accounts = accounts;
        if (targetId) {
          this.selectedAccount = accounts.find((a: any) => a.id === targetId) ?? null;
        }
        this.cdr.markForCheck();
      },
      error: (err) => this.handleError(err),
    });
  }

  selectAccount(account: any): void {
    this.selectedAccount = account;
  }

  createNewAccount(): void {
    if (this.createForm.invalid) return;
    if (!this.customerId) {
      this.handleError({ message: 'Customer profile not loaded. Please refresh and try again.' });
      return;
    }
    const payload = { accountType: this.createForm.value.accountType, customerId: this.customerId };
    this.accountService.createAccount(payload).subscribe({
      next: () => {
        this.handleSuccess('Account created successfully');
        this.showCreateForm = false;
        this.loadAccounts();
      },
      error: (err) => this.handleError(err),
    });
  }

  activateAccount(): void {
    if (!this.selectedAccount) return;
    this.accountService.activateAccount(this.selectedAccount.id).subscribe({
      next: () => {
        this.handleSuccess('Account activated successfully');
        this.loadAccounts();
      },
      error: (err) => this.handleError(err),
    });
  }

  freezeReason = '';
  showFreezeInput = false;
  showCloseConfirm = false;

  freezeAccount(): void {
    if (!this.selectedAccount) return;
    const reason = this.freezeReason.trim() || 'Frozen by user';
    this.showFreezeInput = false;
    this.freezeReason = '';
    this.accountService.freezeAccount(this.selectedAccount.id, reason).subscribe({
      next: () => {
        this.handleSuccess('Account frozen');
        this.loadAccounts();
      },
      error: (err) => this.handleError(err),
    });
  }

  unfreezeAccount(): void {
    if (!this.selectedAccount) return;
    this.accountService.unfreezeAccount(this.selectedAccount.id).subscribe({
      next: () => {
        this.handleSuccess('Account unfrozen');
        this.loadAccounts();
      },
      error: (err) => this.handleError(err),
    });
  }

  closeAccount(): void {
    if (!this.selectedAccount) return;
    this.showCloseConfirm = false;
    this.accountService.closeAccount(this.selectedAccount.id).subscribe({
      next: () => {
        this.handleSuccess('Account closed');
        this.selectedAccount = null;
        this.loadAccounts();
      },
      error: (err) => this.handleError(err),
    });
  }

  private handleSuccess(message: string): void {
    this.errorMessage = null;
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message || 'An unknown error occurred';
    this.snackBar.open(this.errorMessage!, 'Close', { duration: 3000, panelClass: ['error-snackbar'] });
    this.cdr.markForCheck();
  }
}
