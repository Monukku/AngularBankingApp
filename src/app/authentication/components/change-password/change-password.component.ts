// src/app/authentication/components/change-password/change-password.component.ts
import { Component } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-change-password',
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
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss']
})
export class ChangePasswordComponent {
  token: string = '';
  newPassword: string = '';
  confirmPassword: string = '';
  message: string = '';

  constructor(private authService: AuthService, private route: ActivatedRoute) {
    this.token = this.route.snapshot.queryParams['token'];
  }

  changePassword() {
    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Passwords do not match';
      return;
    }
    this.authService.changePassword(this.token, this.newPassword).subscribe(
      () => {
        this.message = 'Password changed successfully';
      },
      error => {
        this.message = 'Failed to change password';
      }
    );
  }
}
