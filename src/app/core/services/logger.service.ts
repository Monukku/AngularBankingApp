import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

@Injectable({
  providedIn: 'root'
})
export class LoggerService {
  private logLevel: LogLevel = environment.production ? LogLevel.WARN : LogLevel.DEBUG;

  constructor() {}

  /**
   * Log debug messages
   */
  debug(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      console.debug(`[DEBUG] ${message}`, data);
    }
  }

  /**
   * Log info messages
   */
  info(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.INFO) {
      console.info(`[INFO] ${message}`, data);
    }
  }

  /**
   * Log warning messages
   */
  warn(message: string, data?: any): void {
    if (this.logLevel <= LogLevel.WARN) {
      console.warn(`[WARN] ${message}`, data);
    }
  }

  /**
   * Log error messages
   */
  error(message: string, error?: any): void {
    if (this.logLevel <= LogLevel.ERROR) {
      console.error(`[ERROR] ${message}`, error);
    }
    // In production, you might want to send errors to a logging service
    if (environment.production) {
      this.reportErrorToServer(message, error);
    }
  }

  /**
   * Report error to server (for production monitoring)
   */
  private reportErrorToServer(message: string, error: any): void {
    // TODO: Implement sending errors to a logging service like Sentry, LogRocket, etc.
    // This would be implemented when you have a logging backend
  }
}
