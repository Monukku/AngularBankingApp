import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { ErrorInterceptor } from './error.interceptor'; // Ensure correct import

describe('ErrorInterceptor', () => {
  const interceptor: HttpInterceptor = TestBed.inject(ErrorInterceptor); // Ensure consistent usage

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
