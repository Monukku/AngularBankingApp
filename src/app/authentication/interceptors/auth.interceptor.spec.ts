import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS, HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { AuthInterceptor } from './auth.interceptor';

describe('AuthInterceptor', () => {
  const interceptor: HttpInterceptor = TestBed.inject(AuthInterceptor);

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(interceptor).toBeTruthy();
  });
});
