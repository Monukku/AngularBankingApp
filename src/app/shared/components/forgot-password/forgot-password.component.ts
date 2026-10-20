// src/app/authentication/components/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent {
  email: string = '';
  message: string = '';

  sendResetLink() {
    if (!this.email) {
      this.message = 'Please enter your email address';
      return;
    }

    // Passwords are managed by Keycloak and the backend has no reset endpoint,
    // so point the user at the "Forgot password" link on the Keycloak sign-in page.
    this.message = 'Use "Forgot password" on the sign-in page to reset your password';
  }
}


