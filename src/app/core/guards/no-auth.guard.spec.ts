import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { NoAuthGuard } from './no-auth.guard'; // Import the NoAuthGuard

describe('NoAuthGuard', () => {
  let guard: NoAuthGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [NoAuthGuard] // Include NoAuthGuard as a provider
    });
    guard = TestBed.inject(NoAuthGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
