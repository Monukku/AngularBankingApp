import { Component, OnInit, ChangeDetectionStrategy, inject, DestroyRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserProfileService } from '../../services/user-profile.service';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userProfileService = inject(UserProfileService);
  private destroyRef = inject(DestroyRef);

  userDetailsForm: FormGroup;
  passwordForm: FormGroup;

  constructor() {
    this.userDetailsForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      address: ['', Validators.required],
      accountNumber: ['', Validators.required],
      profilePicture: [null, Validators.required]
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', Validators.required],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadUserDetails();
  }

  loadUserDetails(): void {
    this.userProfileService.getUserDetails()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(details => {
        this.userDetailsForm.patchValue(details);
      });
  }

  saveUserDetails(): void {
    if (this.userDetailsForm.valid) {
      this.userProfileService.updateUserDetails(this.userDetailsForm.value)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe();
    }
  }

  changePassword(): void {
    if (this.passwordForm.valid) {
      const passwordData = this.passwordForm.value;
      if (passwordData.newPassword === passwordData.confirmPassword) {
        this.userProfileService.changePassword(passwordData)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe();
      } else {
        alert('New password and confirm password do not match');
      }
    }
  }

  onFileSelected(event: any) {
    const file: File = event.target.files[0];
    // You can handle the selected file here
  }
}
