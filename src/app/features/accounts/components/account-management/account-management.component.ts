import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AccountService } from '../../services/account.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../../../../shared/components/ConfirmationDialogComponent/confirmation-dialog.component';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule, MatLabel } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatOption, MatOptionModule } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';

@Component({
  selector: 'app-account-management',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatToolbarModule,
    CommonModule,
    MatIconModule,
    ReactiveFormsModule,
    MatDividerModule,
    MatOption,
    MatSelect,
    MatLabel,
  ],
  templateUrl: './account-management.component.html',
  styleUrls: ['./account-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccountManagementComponent implements OnInit {
  accountForm: FormGroup;
  checkAccountForm: FormGroup;
  account: any;
  showCreateAccountForm = false;
  showUpdateAccountForm = false;
  showCheckAccountForm = false;

  accountTypes: string[] = ['SAVINGS', 'CHECKING', 'BUSINESS']; // Available account types

  errorMessage: any; // For displaying errors
  constructor(
    private formBuilder: FormBuilder,
    private accountService: AccountService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.accountForm = this.formBuilder.group({
      name: [''],
      email: [''],
      accountType: [this.accountTypes[0], Validators.required], // Default to first type
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
      accountNumber: [''],
      branchAddress: [''],
      accountCategory: [''],
      accountStatus: [''],
    });

    this.checkAccountForm = this.formBuilder.group({
      mobileNumber: [
        '',
        [Validators.required, Validators.pattern(/^[0-9]{10}$/)],
      ],
    });
  }

  ngOnInit(): void {}

  showCreateForm(): void {
    this.showCreateAccountForm = true;
    this.showUpdateAccountForm = false;
    this.showCheckAccountForm = false;
  }

  showUpdateForm(): void {
    if (this.account) {
      this.accountForm.patchValue({
        name: this.account.name,
        email: this.account.email,
        mobileNumber: this.account.mobileNumber,
        accountNumber: this.account.accountsDto.accountNumber,
        branchAddress: this.account.accountsDto.branchAddress,
        accountType: this.account.accountsDto.accountType,
        accountCategory: this.account.accountsDto.accountCategory,
        accountStatus: this.account.accountsDto.accountStatus,
      });
      this.showUpdateAccountForm = true;
      this.showCreateAccountForm = false;
      this.showCheckAccountForm = false;
    }
  }

  showCheckForm(): void {
    this.showCheckAccountForm = true;
    this.showCreateAccountForm = false;
    this.showUpdateAccountForm = false;
  }

  createNewAccount(): void {
    if (this.accountForm.valid) {
      const accountData = this.accountForm.value;
      const selectedAccountType = accountData.accountType;
      this.accountService
        .createAccount(accountData, selectedAccountType)
        .subscribe(
          () => {
            this.handleSuccess('Account created successfully');
            this.showCreateAccountForm = false;
          },
          (error) => this.handleError(error)
        );
    }
  }

  updateAccount(): void {
    if (this.accountForm.valid && this.account) {
      const updatePayload = {
        name: this.accountForm.value.name,
        email: this.accountForm.value.email,
        mobileNumber: this.accountForm.value.mobileNumber,
        accountsDto: {
          accountNumber: this.accountForm.value.accountNumber,
          branchAddress: this.accountForm.value.branchAddress,
          accountType: this.accountForm.value.accountType,
          accountCategory: this.accountForm.value.accountCategory,
          accountStatus: this.accountForm.value.accountStatus,
        },
      };

      this.accountService
        .updateAccount(this.account.mobileNumber, updatePayload)
        .subscribe(
          () => {
            this.handleSuccess('Account updated successfully');
            this.showUpdateAccountForm = false;
            this.checkExistingAccount(); // Refresh account details
          },
          (error) => this.handleError(error)
        );
    }
  }

  checkExistingAccount(): void {
    if (this.checkAccountForm.valid) {
      const { mobileNumber } = this.checkAccountForm.value;
      this.accountService.fetchAccountDetails(mobileNumber).subscribe(
        (account) => {
          if (account) {
            this.account = account;
            this.showCheckAccountForm = false;
          } else {
            this.handleError(
              new Error('The account you are looking for does not exist')
            );
          }
        },
        (error) => this.handleError(error)
      );
    }
  }

  deleteAccount(): void {
    if (this.account) {
      const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
        width: '300px',
        data: { message: 'Are you sure you want to delete this account?' },
      });

      dialogRef.afterClosed().subscribe((result) => {
        if (result) {
          this.accountService
            .deleteAccount(this.account.mobileNumber)
            .subscribe(
              () => {
                this.handleSuccess('Account deleted successfully');
                this.account = null;
                this.showUpdateAccountForm = false;
                this.showCreateAccountForm = false;
              },
              (error) => this.handleError(error)
            );
        }
      });
    }
  }

  private handleSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar'],
    });
    this.errorMessage = null; // Clear any previous error messages
  }

  private handleError(error: any): void {
    console.error('Error details:', error);
    this.errorMessage = error?.message || 'An unknown error occurred'; // Set the error message to be displayed
    this.snackBar.open(this.errorMessage, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'],
    });
  }
}
