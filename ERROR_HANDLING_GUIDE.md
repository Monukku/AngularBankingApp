/**
 * ERROR HANDLING GUIDE FOR ANGULAR BANKING APP
 * 
 * This document shows you how to use the new error handling system
 */

// ============================================================================
// 1. IN YOUR SERVICES
// ============================================================================

/*
// Example: account.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ErrorHandlerService } from '../../core/services/error-handler.service';
import { NotificationService } from '../../core/services/notification.service';
import { LoggerService } from '../../core/services/logger.service';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private apiUrl = 'https://api.example.com/accounts';

  constructor(
    private http: HttpClient,
    private errorHandlerService: ErrorHandlerService,
    private notificationService: NotificationService,
    private loggerService: LoggerService
  ) {}

  fetchAccounts(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      tap(() => {
        this.loggerService.debug('Accounts fetched successfully');
      }),
      catchError((error) => {
        // Error interceptor will handle HTTP errors
        // If you need custom handling, do it here
        const appError = this.errorHandlerService.handleHttpError(error);
        
        // Show user-friendly notification
        const userMessage = this.errorHandlerService.getUserMessage(appError);
        this.notificationService.error(userMessage);
        
        return throwError(() => appError);
      })
    );
  }

  createAccount(accountData: any): Observable<any> {
    // Validate input
    if (!accountData.name) {
      const error = new ValidationError('Account name is required');
      this.notificationService.error('Please provide account name');
      return throwError(() => error);
    }

    return this.http.post<any>(this.apiUrl, accountData).pipe(
      tap((response) => {
        this.loggerService.info('Account created successfully', response);
        this.notificationService.success('Account created successfully');
      }),
      catchError((error) => {
        const appError = this.errorHandlerService.handleHttpError(error);
        const userMessage = this.errorHandlerService.getUserMessage(appError);
        this.notificationService.error(userMessage);
        return throwError(() => appError);
      })
    );
  }
}
*/

// ============================================================================
// 2. IN YOUR COMPONENTS
// ============================================================================

/*
// Example: account-list.component.ts

import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AccountService } from '../../services/account.service';
import { NotificationService } from '../../../core/services/notification.service';
import { AppError } from '../../../core/models/error.model';

@Component({
  selector: 'app-account-list',
  templateUrl: './account-list.component.html',
})
export class AccountListComponent implements OnInit, OnDestroy {
  accounts: any[] = [];
  loading = false;
  error: AppError | null = null;
  private destroy$ = new Subject<void>();

  constructor(
    private accountService: AccountService,
    private notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadAccounts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAccounts(): void {
    this.loading = true;
    this.error = null;

    this.accountService
      .fetchAccounts()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (accounts) => {
          this.accounts = accounts;
          this.loading = false;
        },
        error: (error: AppError) => {
          this.error = error;
          this.loading = false;
          // Service already shows notification, so component doesn't need to
        },
      });
  }

  createAccount(formData: any): void {
    this.loading = true;

    this.accountService
      .createAccount(formData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (newAccount) => {
          this.accounts.push(newAccount);
          this.loading = false;
        },
        error: (error: AppError) => {
          this.error = error;
          this.loading = false;
        },
      });
  }

  retryOperation(): void {
    this.loadAccounts();
  }
}
*/

// ============================================================================
// 3. ERROR TYPES AVAILABLE
// ============================================================================

/*
import {
  AppError,           // Base error class
  HttpError,          // HTTP/API errors
  ValidationError,    // Form validation errors
  AuthenticationError, // Login/auth errors
  AuthorizationError,  // Permission errors
  NotFoundError,      // 404 errors
  ServerError,        // 5xx errors
  NetworkError,       // Network connectivity errors
  TimeoutError,       // Request timeout errors
} from '../core/models/error.model';

// Usage examples:
const appError = new AppError('Something went wrong', 'CUSTOM_ERROR');
const validationError = new ValidationError('Validation failed', { email: ['Invalid email'] });
const authError = new AuthenticationError('Login required');
const networkError = new NetworkError('No internet connection');
*/

// ============================================================================
// 4. USING ERROR HANDLER SERVICE DIRECTLY
// ============================================================================

/*
import { ErrorHandlerService } from '../core/services/error-handler.service';

@Injectable()
export class MyService {
  constructor(
    private errorHandler: ErrorHandlerService,
    private logger: LoggerService
  ) {}

  doSomething() {
    try {
      // ... your code
    } catch (error) {
      // Handle errors
      const appError = this.errorHandler.handleClientError(error);
      
      // Get user-friendly message
      const userMessage = this.errorHandler.getUserMessage(appError);
      
      // Check if error is recoverable
      if (this.errorHandler.isRecoverable(appError)) {
        console.log('Can retry:', this.errorHandler.getSuggestedAction(appError));
      }
      
      // Get error history for debugging
      const history = this.errorHandler.getErrorHistory();
      this.logger.debug('Error history', history);
    }
  }
}
*/

// ============================================================================
// 5. NOTIFICATION SERVICE
// ============================================================================

/*
import { NotificationService } from '../core/services/notification.service';

@Component({...})
export class MyComponent {
  constructor(private notification: NotificationService) {}

  doSomething() {
    // Show different types of notifications
    this.notification.success('Operation completed successfully');
    this.notification.error('An error occurred');
    this.notification.warning('Please review this carefully');
    this.notification.info('Here is some information');

    // Show notification with action button
    const snackbarRef = this.notification.showWithAction(
      'Item deleted',
      'Undo',
      'warning'
    );

    snackbarRef.onAction().subscribe(() => {
      console.log('User clicked Undo');
    });
  }
}
*/

// ============================================================================
// 6. LOGGER SERVICE
// ============================================================================

/*
import { LoggerService } from '../core/services/logger.service';

@Injectable()
export class MyService {
  constructor(private logger: LoggerService) {}

  doSomething() {
    this.logger.debug('Debug message', { data: 'value' });
    this.logger.info('Info message', { data: 'value' });
    this.logger.warn('Warning message', { data: 'value' });
    this.logger.error('Error message', error);
  }
}
*/

// ============================================================================
// 7. ERROR HANDLING IN FORMS
// ============================================================================

/*
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ValidationError } from '../core/models/error.model';
import { NotificationService } from '../core/services/notification.service';

@Component({...})
export class LoginComponent {
  form: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private notification: NotificationService,
    private errorHandler: ErrorHandlerService
  ) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  onSubmit() {
    if (!this.form.valid) {
      // Handle validation error
      const error = new ValidationError('Please fill all required fields');
      const message = this.errorHandler.getUserMessage(error);
      this.notification.error(message);
      return;
    }

    this.authService.login(this.form.value).subscribe({
      next: (result) => {
        this.notification.success('Login successful');
      },
      error: (error) => {
        // Error is already handled by service and error interceptor
      },
    });
  }

  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    if (!field || !field.errors) return null;

    if (field.errors['required']) {
      return \`\${fieldName} is required\`;
    }
    if (field.errors['email']) {
      return 'Invalid email format';
    }
    if (field.errors['minlength']) {
      return \`Minimum length is \${field.errors['minlength'].requiredLength}\`;
    }
    return 'Invalid input';
  }
}
*/

export const ErrorHandlingGuide = {
  description: 'Complete error handling guide for Angular Banking App',
  version: '1.0.0',
};
