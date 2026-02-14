import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

@Injectable({
  providedIn: 'root',
})
export class LoggerService {
  private readonly level = environment.logging.level;
  private readonly enableConsole = environment.logging.enableConsole;

  debug(message: string, ...args: any[]): void {
    this.log(LogLevel.DEBUG, message, args);
  }

  info(message: string, ...args: any[]): void {
    this.log(LogLevel.INFO, message, args);
  }

  warn(message: string, ...args: any[]): void {
    this.log(LogLevel.WARN, message, args);
  }

  error(message: string, ...args: any[]): void {
    this.log(LogLevel.ERROR, message, args);
  }

  private log(level: LogLevel, message: string, args: any[]): void {
    if (!this.shouldLog(level)) return;

    if (!this.enableConsole && !environment.production) return;

    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

    switch (level) {
      case LogLevel.DEBUG:
        console.log(prefix, message, ...args);
        break;
      case LogLevel.INFO:
        console.info(prefix, message, ...args);
        break;
      case LogLevel.WARN:
        console.warn(prefix, message, ...args);
        break;
      case LogLevel.ERROR:
        console.error(prefix, message, ...args);
        break;
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.level as LogLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex >= currentLevelIndex;
  }
}