import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';  // Import Router for navigation
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;

  constructor(private fb: FormBuilder, private router: Router) {  // Inject Router
    this.registerForm = this.fb.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required, this.matchingPasswords('password')]]
    });

    // Manually trigger value change detection for custom validation
    this.registerForm.valueChanges.subscribe(() => {
      this.registerForm.get('confirmPassword')?.updateValueAndValidity({ onlySelf: true });
    });
  }

  // Custom validator for matching passwords directly in confirmPassword field
  matchingPasswords(passwordField: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.root.get(passwordField);
      const confirmPassword = control;

      if (password && confirmPassword && password.value !== confirmPassword.value) {
        return { noMatch: true };
      }
      return null;
    };
  }

  onSubmit() {
    if (this.registerForm.valid) {
      console.log(this.registerForm.value);
    } else {
      console.error('Form is invalid');
    }
  }

  backToLogin() {
    this.router.navigate(['/auth/login']);  // Navigate to the login page
  }
}
