import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule, MatSnackBar } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';
import { LoggerService } from '../../../../core/services/logger.service';
import { trigger, state, style, transition, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatIconModule,
  ],
  animations: [
    trigger('slideDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-30px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggeredSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('0.6s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('countUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.8s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private logger = inject(LoggerService);
  private snackBar = inject(MatSnackBar);

  registerForm: FormGroup;
  isLoading = false;
  showPassword = false;
  showConfirmPassword = false;

  features = [
    {
      icon: 'security',
      title: 'Bank-Grade Security',
      description: 'Military-grade encryption protects your data 24/7'
    },
    {
      icon: 'speed',
      title: 'Lightning Fast',
      description: 'Instant transactions and real-time updates'
    },
    {
      icon: 'public',
      title: 'Global Access',
      description: 'Transfer money anywhere, anytime with ease'
    },
    {
      icon: 'support_agent',
      title: '24/7 Support',
      description: 'Expert support team always ready to help'
    },
    {
      icon: 'savings',
      title: 'Smart Savings',
      description: 'Tools to help you save and invest wisely'
    },
    {
      icon: 'trending_up',
      title: 'Investments',
      description: 'Grow your wealth with smart investment options'
    }
  ];

  stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '100%', label: 'Secure' },
    { number: '15+', label: 'Countries' }
  ];

  constructor() {
    this.registerForm = this.fb.group(
      {
        fullName: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        mobileNumber: [
          '',
          [
            Validators.required,
            Validators.pattern(/^\+?[0-9]{10,15}$/)
          ],
        ],
        password: [
          '',
          [
            Validators.required,
            Validators.minLength(8),
            Validators.pattern(
              /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
            ),
          ],
        ],
        confirmPassword: ['', [Validators.required]],
      },
      { validators: this.passwordMatchValidator }
    );
  }

  /**
   * Custom validator to check if passwords match
   */
  private passwordMatchValidator(form: FormGroup): { [key: string]: boolean } | null {
    const password = form.get('password');
    const confirmPassword = form.get('confirmPassword');

    if (password && confirmPassword && password.value !== confirmPassword.value) {
      confirmPassword.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }

    return null;
  }

  /**
   * Submit registration form
   */
  onRegister(): void {
    if (this.registerForm.invalid) {
      this.snackBar.open('Please fill all required fields correctly', 'Close', {
        duration: 3000,
        horizontalPosition: 'end',
        verticalPosition: 'top',
      });
      return;
    }

    this.isLoading = true;
    const registerData = {
      fullName: this.registerForm.value.fullName,
      email: this.registerForm.value.email,
      mobileNumber: this.registerForm.value.mobileNumber,
      password: this.registerForm.value.password,
    };

    this.authService.register(registerData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        this.logger.debug('Registration successful', response);
        this.snackBar.open(
          'Registration successful! Redirecting to login...',
          'Close',
          { duration: 3000 }
        );

        // After successful registration, login the user
        setTimeout(() => {
          this.authService.loginAfterRegistration();
        }, 2000);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.logger.error('Registration failed', error);
        const errorMessage = error.error?.message || 'Registration failed. Please try again.';
        this.snackBar.open(errorMessage, 'Close', {
          duration: 3000,
          horizontalPosition: 'end',
          verticalPosition: 'top',
          panelClass: ['error-snackbar'],
        });
      },
    });
  }

  /**
   * Navigate to login
   */
  goToLogin(): void {
    this.router.navigate(['/auth/login']);
  }

  /**
   * Get password validation errors
   */
  getPasswordErrors(): string[] {
    const control = this.registerForm.get('password');
    if (!control || !control.errors) return [];

    const errors: string[] = [];
    if (control.errors['required']) errors.push('Password is required');
    if (control.errors['minlength']) errors.push('Password must be at least 8 characters');
    if (control.errors['pattern'])
      errors.push('Password must contain uppercase, lowercase, number, and special character');

    return errors;
  }

  /**
   * Toggle password visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }
}
