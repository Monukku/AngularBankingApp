// src/app/authentication/components/forgot-password/forgot-password.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
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

  constructor(private authService: AuthService) { }

  sendResetLink() {
    if (!this.email) {
      this.message = 'Please enter your email address';
      return;
    }

    this.authService.sendResetLink(this.email).subscribe(
      () => {
        this.message = 'Password reset link sent to your email';
      },
      error => {
        this.message = 'Failed to send reset link';
      }
    );
  }
}


