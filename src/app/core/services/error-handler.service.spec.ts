import { TestBed } from '@angular/core/testing';
import { ErrorHandlerService } from './error-handler.service';
import { LoggerService } from './logger.service';
import {
  HttpError,
  ValidationError,
  AuthenticationError,
  AppError,
} from '../models/error.model';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';

describe('ErrorHandlerService', () => {
  let service: ErrorHandlerService;
  let loggerService: LoggerService;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ErrorHandlerService,
        LoggerService,
        {
          provide: Router,
          useValue: { navigate: jasmine.createSpy('navigate') },
        },
      ],
    });
    service = TestBed.inject(ErrorHandlerService);
    loggerService = TestBed.inject(LoggerService);
    router = TestBed.inject(Router);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('handleHttpError', () => {
    it('should handle 401 Unauthorized error', () => {
      const httpError = new HttpErrorResponse({
        error: 'Unauthorized',
        status: 401,
        statusText: 'Unauthorized',
      });

      const result = service.handleHttpError(httpError);

      expect(result instanceof AuthenticationError).toBeTruthy();
      expect(result.statusCode).toBe(401);
    });

    it('should handle 404 Not Found error', () => {
      const httpError = new HttpErrorResponse({
        error: 'Not Found',
        status: 404,
        statusText: 'Not Found',
      });

      const result = service.handleHttpError(httpError);

      expect(result.code).toBe('NOT_FOUND');
      expect(result.statusCode).toBe(404);
    });

    it('should handle 400 Bad Request with validation errors', () => {
      const httpError = new HttpErrorResponse({
        error: {
          errors: {
            email: ['Invalid email format'],
            password: ['Password too short'],
          },
        },
        status: 400,
        statusText: 'Bad Request',
      });

      const result = service.handleHttpError(httpError);

      expect(result instanceof ValidationError).toBeTruthy();
    });

    it('should handle network error (status 0)', () => {
      const httpError = new HttpErrorResponse({
        error: 'Network error',
        status: 0,
        statusText: 'Unknown Error',
      });

      const result = service.handleHttpError(httpError);

      expect(result.code).toBe('NETWORK_ERROR');
    });

    it('should handle 500 Server error', () => {
      const httpError = new HttpErrorResponse({
        error: 'Internal Server Error',
        status: 500,
        statusText: 'Internal Server Error',
      });

      const result = service.handleHttpError(httpError);

      expect(result.code).toBe('SERVER_ERROR');
      expect(result.statusCode).toBe(500);
    });
  });

  describe('handleClientError', () => {
    it('should handle Error objects', () => {
      const error = new Error('Test error');

      const result = service.handleClientError(error);

      expect(result instanceof AppError).toBeTruthy();
      expect(result.message).toBe('Test error');
    });

    it('should handle AppError objects', () => {
      const appError = new AppError('Custom error', 'CUSTOM');

      const result = service.handleClientError(appError);

      expect(result).toBe(appError);
    });
  });

  describe('getUserMessage', () => {
    it('should return user-friendly message for auth error', () => {
      const error = new AuthenticationError();

      const message = service.getUserMessage(error);

      expect(message).toBeTruthy();
      expect(message.length > 0).toBeTruthy();
    });

    it('should return user-friendly message for validation error', () => {
      const error = new ValidationError('Validation failed');

      const message = service.getUserMessage(error);

      expect(message).toContain('Validation failed');
    });
  });

  describe('isRecoverable', () => {
    it('should return false for auth errors', () => {
      const error = new AuthenticationError();

      const recoverable = service.isRecoverable(error);

      expect(recoverable).toBeFalsy();
    });

    it('should return true for network errors', () => {
      const error = new HttpError('Network error', 0, 'NETWORK_ERROR');

      const recoverable = service.isRecoverable(error);

      expect(recoverable).toBeTruthy();
    });
  });

  describe('error history', () => {
    it('should maintain error history', () => {
      const error1 = new AppError('Error 1', 'ERR1');
      const error2 = new AppError('Error 2', 'ERR2');

      service.handleClientError(error1);
      service.handleClientError(error2);

      const history = service.getErrorHistory();

      expect(history.length).toBeGreaterThanOrEqual(2);
    });

    it('should clear error history', () => {
      const error = new AppError('Error', 'ERR');

      service.handleClientError(error);
      service.clearErrorHistory();

      const history = service.getErrorHistory();

      expect(history.length).toBe(0);
    });
  });
});
