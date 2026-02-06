// import { TestBed } from '@angular/core/testing';
// import { CanActivateFn } from '@angular/router';

// import { RoleGuard } from './role.guard';

// describe('roleGuard', () => {
//   const executeGuard: CanActivateFn = (...guardParameters) => 
//       TestBed.runInInjectionContext(() => RoleGuard(...guardParameters));

//   beforeEach(() => {
//     TestBed.configureTestingModule({});
//   });

//   it('should be created', () => {
//     expect(executeGuard).toBeTruthy();
//   });
// });



import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { RoleGuard } from './role.guard'; // Import the RoleGuard

describe('RoleGuard', () => {
  let guard: RoleGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [RoleGuard] // Include RoleGuard as a provider
    });
    guard = TestBed.inject(RoleGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
