import { Injectable, inject } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export enum NotificationType {
  SUCCESS = 'success',
  ERROR = 'error',
  WARNING = 'warning',
  INFO = 'info',
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private readonly defaultDuration = 3000;
  private snackBar = inject(MatSnackBar);

  success(message: string, duration?: number): void {
    this.show(message, NotificationType.SUCCESS, duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, NotificationType.ERROR, duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, NotificationType.WARNING, duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, NotificationType.INFO, duration);
  }

  private show(
    message: string,
    type: NotificationType,
    duration?: number
  ): void {
    const config: MatSnackBarConfig = {
      duration: duration || this.defaultDuration,
      horizontalPosition: 'end',
      verticalPosition: 'top',
      panelClass: [`notification-${type}`],
    };

    this.snackBar.open(message, '✕', config);
  }
}