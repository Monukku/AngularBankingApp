import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface Notification {
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private readonly DEFAULT_DURATION = 5000; // 5 seconds
  private readonly ERROR_DURATION = 7000; // 7 seconds for errors
  private readonly SUCCESS_DURATION = 3000; // 3 seconds for success

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success notification
   */
  success(message: string, duration?: number): void {
    this.show(message, 'success', duration || this.SUCCESS_DURATION);
  }

  /**
   * Show error notification
   */
  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || this.ERROR_DURATION);
  }

  /**
   * Show warning notification
   */
  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration || this.DEFAULT_DURATION);
  }

  /**
   * Show info notification
   */
  info(message: string, duration?: number): void {
    this.show(message, 'info', duration || this.DEFAULT_DURATION);
  }

  /**
   * Show generic notification
   */
  private show(
    message: string,
    type: 'success' | 'error' | 'warning' | 'info',
    duration: number
  ): void {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: [`notification-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    };

    this.snackBar.open(message, 'Close', config);
  }

  /**
   * Show notification with action button
   */
  showWithAction(
    message: string,
    action: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    duration: number = this.DEFAULT_DURATION
  ): any {
    const config: MatSnackBarConfig = {
      duration,
      panelClass: [`notification-${type}`],
      horizontalPosition: 'end',
      verticalPosition: 'bottom',
    };

    return this.snackBar.open(message, action, config);
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.snackBar.dismiss();
  }
}
