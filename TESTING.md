# Testing Guide

## Table of Contents
1. [Unit Testing](#unit-testing)
2. [E2E Testing](#e2e-testing)
3. [Test Coverage](#test-coverage)
4. [Best Practices](#best-practices)
5. [Troubleshooting](#troubleshooting)

---

## Unit Testing

### Overview

Unit tests are written using **Jasmine** test framework and run with **Karma** test runner.

### Running Unit Tests

```bash
# Run tests once
npm test -- --watch=false

# Run tests with code coverage
npm test -- --watch=false --code-coverage

# Run tests in watch mode (auto-rerun on changes)
npm test

# Run specific test file
npm test -- --include='**/account.service.spec.ts'
```

### Test Structure

Tests follow the AAA pattern (Arrange, Act, Assert):

```typescript
describe('AccountService', () => {
  let service: AccountService;
  let httpClient: HttpClient;
  let logger: LoggerService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AccountService,
        { provide: HttpClient, useValue: jasmine.createSpyObj('HttpClient', ['get', 'post']) },
        { provide: LoggerService, useValue: jasmine.createSpyObj('LoggerService', ['error']) }
      ]
    });
    service = TestBed.inject(AccountService);
    httpClient = TestBed.inject(HttpClient);
    logger = TestBed.inject(LoggerService);
  });

  it('should validate mobile number format', () => {
    // Arrange
    const validNumber = '9876543210';
    const invalidNumber = '123';

    // Act & Assert
    expect(service.validateMobileNumber(validNumber)).toBe(true);
    expect(service.validateMobileNumber(invalidNumber)).toBe(false);
  });
});
```

### Testing Services

#### Service Unit Test Example

```typescript
describe('AccountService', () => {
  let service: AccountService;
  let httpClient: jasmine.SpyObj<HttpClient>;
  let logger: jasmine.SpyObj<LoggerService>;

  beforeEach(() => {
    const httpSpy = jasmine.createSpyObj('HttpClient', ['get', 'post', 'put', 'delete']);
    const loggerSpy = jasmine.createSpyObj('LoggerService', ['debug', 'error']);

    TestBed.configureTestingModule({
      providers: [
        AccountService,
        { provide: HttpClient, useValue: httpSpy },
        { provide: LoggerService, useValue: loggerSpy }
      ]
    });

    service = TestBed.inject(AccountService);
    httpClient = TestBed.inject(HttpClient) as jasmine.SpyObj<HttpClient>;
    logger = TestBed.inject(LoggerService) as jasmine.SpyObj<LoggerService>;
  });

  describe('createAccount', () => {
    it('should create account with valid data', (done) => {
      // Arrange
      const account = {
        accountName: 'Test Account',
        accountType: 'savings',
        currency: 'USD',
        mobileNumber: '9876543210'
      };
      const mockResponse = { id: '1', accountNumber: 'ACC123' };
      httpClient.post.and.returnValue(of(mockResponse));

      // Act
      service.createAccount(account).subscribe((result) => {
        // Assert
        expect(result.id).toBe('1');
        expect(httpClient.post).toHaveBeenCalled();
        done();
      });
    });

    it('should throw validation error for invalid mobile number', (done) => {
      // Arrange
      const account = {
        accountName: 'Test Account',
        accountType: 'savings',
        currency: 'USD',
        mobileNumber: '123' // Invalid
      };

      // Act & Assert
      service.createAccount(account).subscribe({
        error: (error) => {
          expect(error.message).toContain('Mobile number');
          done();
        }
      });
    });

    it('should handle HTTP 400 error', (done) => {
      // Arrange
      const account = {
        accountName: 'Test Account',
        accountType: 'savings',
        currency: 'USD',
        mobileNumber: '9876543210'
      };
      const error = new HttpErrorResponse({ status: 400 });
      httpClient.post.and.returnValue(throwError(() => error));

      // Act
      service.createAccount(account).subscribe({
        error: (err) => {
          // Assert
          expect(logger.error).toHaveBeenCalled();
          done();
        }
      });
    });
  });

  describe('Validation', () => {
    it('should validate mobile number format', () => {
      expect(service.validateMobileNumber('9876543210')).toBe(true);
      expect(service.validateMobileNumber('12345')).toBe(false);
      expect(service.validateMobileNumber('abcd567890')).toBe(false);
    });

    it('should validate account name', () => {
      expect(service.validateAccountName('My Account')).toBe(true);
      expect(service.validateAccountName('')).toBe(false);
    });
  });
});
```

### Testing Components

#### Component Unit Test Example

```typescript
describe('AccountListComponent', () => {
  let component: AccountListComponent;
  let fixture: ComponentFixture<AccountListComponent>;
  let accountService: jasmine.SpyObj<AccountService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('AccountService', ['listAccounts']);

    await TestBed.configureTestingModule({
      imports: [AccountListComponent],
      providers: [{ provide: AccountService, useValue: spy }]
    }).compileComponents();

    accountService = TestBed.inject(AccountService) as jasmine.SpyObj<AccountService>;
    fixture = TestBed.createComponent(AccountListComponent);
    component = fixture.componentInstance;
  });

  it('should load accounts on init', () => {
    // Arrange
    const mockAccounts = [
      { id: '1', accountName: 'Account 1', balance: 1000 },
      { id: '2', accountName: 'Account 2', balance: 2000 }
    ];
    accountService.listAccounts.and.returnValue(of(mockAccounts));

    // Act
    fixture.detectChanges();

    // Assert
    expect(accountService.listAccounts).toHaveBeenCalled();
    expect(component.accounts.length).toBe(2);
  });

  it('should display error message on load failure', () => {
    // Arrange
    const error = new Error('Load failed');
    accountService.listAccounts.and.returnValue(throwError(() => error));

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.error).toBe('Load failed');
  });
});
```

### Testing Pipes

```typescript
describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DateFormatPipe, DatePipe]
    });
    pipe = TestBed.inject(DateFormatPipe);
  });

  it('should format date correctly', () => {
    const date = new Date('2024-02-07');
    const formatted = pipe.transform(date, 'dd/MM/yyyy');
    expect(formatted).toBe('07/02/2024');
  });

  it('should handle null input', () => {
    const result = pipe.transform(null, 'dd/MM/yyyy');
    expect(result).toBe('');
  });
});
```

### Testing Directives

```typescript
describe('HighlightDirective', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  @Component({
    template: '<div appHighlight [highlightColor]="\'yellow\'">Test</div>'
  })
  class TestComponent {}

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HighlightDirective, TestComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
  });

  it('should highlight element with specified color', () => {
    fixture.detectChanges();
    const element = fixture.debugElement.query(By.directive(HighlightDirective));
    expect(element.nativeElement.style.backgroundColor).toBe('yellow');
  });
});
```

### Testing with async/fakeAsync

```typescript
describe('Async Operations', () => {
  it('should handle async operation', fakeAsync(() => {
    // Arrange
    let result: string = '';
    const observable = of('value').pipe(delay(1000));

    // Act
    observable.subscribe((value) => {
      result = value;
    });

    tick(1000);

    // Assert
    expect(result).toBe('value');
  }));
});
```

---

## E2E Testing

### Overview

E2E tests are written using **Cypress** and test complete user workflows.

### Installation

```bash
# Install Cypress (already done in project)
npm install cypress --save-dev

# Initialize Cypress
npx cypress init
```

### Running E2E Tests

```bash
# Open Cypress Test Runner (interactive)
npm run e2e

# Run all E2E tests headless
npm run e2e:headless

# Run specific test file
npm run e2e -- --spec cypress/e2e/auth.cy.ts

# Run tests with specific browser
npm run e2e -- --browser chrome
npm run e2e -- --browser firefox
```

### E2E Test Structure

```typescript
describe('Authentication', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200/login');
  });

  it('should login with valid credentials', () => {
    // Arrange
    const email = 'user@example.com';
    const password = 'password123';

    // Act
    cy.get('input[name="email"]').type(email);
    cy.get('input[name="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Assert
    cy.url().should('include', '/dashboard');
    cy.get('[data-test="welcome-message"]').should('contain', 'Welcome');
  });

  it('should show error for invalid credentials', () => {
    // Act
    cy.get('input[name="email"]').type('invalid@example.com');
    cy.get('input[name="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();

    // Assert
    cy.get('[role="alert"]').should('contain', 'Invalid credentials');
  });
});
```

### Available Test Files

#### 1. Authentication Tests (`cypress/e2e/auth.cy.ts`)

Tests authentication flows:
- Valid login
- Invalid login
- Email validation
- Protected route access
- Logout functionality

```typescript
describe('Login Page', () => {
  beforeEach(() => {
    cy.visit('/login');
  });

  it('should validate email format', () => {
    cy.get('input[name="email"]').type('invalid-email');
    cy.get('button[type="submit"]').click();
    cy.checkErrorMessage('Please enter a valid email');
  });
});
```

#### 2. Accounts Tests (`cypress/e2e/accounts.cy.ts`)

Tests account management:
- List accounts
- Create account
- Update account
- Delete account
- Input validation

```typescript
describe('Accounts', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
    cy.visit('/accounts');
  });

  it('should create account with valid data', () => {
    cy.get('button[data-test="create-account"]').click();
    cy.get('input[name="accountName"]').type('My Savings');
    cy.get('input[name="mobileNumber"]').type('9876543210');
    cy.get('select[name="accountType"]').select('savings');
    cy.get('button[type="submit"]').click();
    cy.checkSuccessMessage('Account created successfully');
  });
});
```

#### 3. Transactions Tests (`cypress/e2e/transactions.cy.ts`)

Tests transaction flows:
- Transfer funds
- Validate transfer amount
- Prevent same-account transfer
- Transaction history

```typescript
describe('Transfers', () => {
  beforeEach(() => {
    cy.login('user@example.com', 'password123');
    cy.visit('/transactions/transfer');
  });

  it('should validate transfer amount', () => {
    cy.get('input[name="fromAccount"]').select('ACC123');
    cy.get('input[name="toAccount"]').type('ACC456');
    cy.get('input[name="amount"]').type('0');
    cy.get('button[type="submit"]').click();
    cy.checkErrorMessage('Amount must be greater than 0');
  });
});
```

### Custom Commands

Available custom commands in `cypress/support/commands.ts`:

#### `cy.login(email, password)`
Logs in with provided credentials.

```typescript
cy.login('user@example.com', 'password123');
cy.url().should('include', '/dashboard');
```

#### `cy.logout()`
Logs out current user.

```typescript
cy.logout();
cy.url().should('include', '/login');
```

#### `cy.checkErrorMessage(message)`
Checks for error message display.

```typescript
cy.checkErrorMessage('Invalid credentials');
```

#### `cy.checkSuccessMessage(message)`
Checks for success message display.

```typescript
cy.checkSuccessMessage('Account created successfully');
```

### Best Practices for E2E Tests

1. **Use data-test attributes for selectors**:
```typescript
// Good
cy.get('[data-test="create-button"]').click();

// Avoid
cy.get('button.btn-primary').click();
```

2. **Wait for elements to appear**:
```typescript
cy.get('[data-test="loader"]').should('not.exist');
cy.get('[data-test="content"]').should('be.visible');
```

3. **Use meaningful test names**:
```typescript
// Good
it('should display error when transfer amount exceeds balance', () => {});

// Avoid
it('should work', () => {});
```

4. **Clear data between tests**:
```typescript
afterEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();
});
```

5. **Test user workflows, not implementation details**:
```typescript
// Good - tests user workflow
cy.get('button').contains('Create Account').click();

// Avoid - tests implementation
cy.get('.account-form__submit-button').click();
```

---

## Test Coverage

### Coverage Report

Run tests with coverage:

```bash
npm test -- --watch=false --code-coverage
```

Coverage report will be generated in `coverage/` directory.

### Coverage Goals

- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

### View Coverage Report

```bash
# Open coverage report in browser
open coverage/index.html
```

---

## Best Practices

### Unit Testing Best Practices

1. **Test one thing per test**
```typescript
// Good
it('should validate mobile number format', () => {
  expect(service.validateMobileNumber('9876543210')).toBe(true);
});

// Avoid
it('should validate mobile number and email', () => {
  expect(service.validateMobileNumber('9876543210')).toBe(true);
  expect(service.validateEmail('user@example.com')).toBe(true);
});
```

2. **Use meaningful test names**
```typescript
// Good
it('should throw ValidationError when mobile number has less than 10 digits', () => {});

// Avoid
it('should throw error', () => {});
```

3. **Follow AAA pattern**
```typescript
it('should create account', () => {
  // Arrange
  const data = { accountName: 'Test', mobileNumber: '9876543210' };

  // Act
  const result = service.createAccount(data);

  // Assert
  expect(result).toBeDefined();
});
```

4. **Mock external dependencies**
```typescript
const httpSpy = jasmine.createSpyObj('HttpClient', ['post']);
httpSpy.post.and.returnValue(of(mockData));
```

### E2E Testing Best Practices

1. **Start with user actions**
```typescript
// Good
cy.visit('/login');
cy.get('input[name="email"]').type('user@example.com');
cy.get('button[type="submit"]').click();

// Avoid
cy.request('POST', '/api/auth/login', {...});
```

2. **Verify user-visible outcomes**
```typescript
// Good
cy.url().should('include', '/dashboard');
cy.get('h1').should('contain', 'Welcome');

// Avoid
cy.window().then((win) => {
  expect(win.appState.isAuthenticated).toBe(true);
});
```

3. **Use explicit waits**
```typescript
// Good
cy.get('[data-test="content"]').should('be.visible');
cy.get('[data-test="loader"]').should('not.exist');

// Avoid - implicit waits
cy.wait(5000);
```

---

## Troubleshooting

### Common Test Issues

#### Test Timeout

```typescript
// Increase timeout for slow operations
it('should load large dataset', () => {
  cy.get('[data-test="load"]').click();
  cy.get('[data-test="data-table"]', { timeout: 10000 }).should('exist');
}, 15000);
```

#### Flaky Tests

```typescript
// Use cy.intercept for API mocking
beforeEach(() => {
  cy.intercept('GET', '/api/accounts', { fixture: 'accounts.json' });
});
```

#### Service Not Injected

```typescript
// Ensure service is provided in TestBed
beforeEach(() => {
  TestBed.configureTestingModule({
    providers: [AccountService, HttpClient, LoggerService]
  });
});
```

#### Component Not Detecting Changes

```typescript
// Call detectChanges after setting properties
component.property = 'value';
fixture.detectChanges();
```

### Debugging Tests

```bash
# Run with debug output
npm test -- --browsers Chrome --watch

# Open DevTools in test browser to debug
```

### Running Specific Tests

```bash
# Run specific describe block
npm test -- --include='**/account.service.spec.ts'

# Run tests matching pattern
npm test -- --include='**/*.service.spec.ts'
```

---

## Continuous Integration

### Pre-commit Testing

Run tests before committing:

```bash
# In .husky/pre-commit
npm test -- --watch=false
npm run e2e:headless
```

### CI/CD Pipeline

Example GitHub Actions workflow:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: npm install
      - run: npm test -- --watch=false --code-coverage
      - run: npm run e2e:headless
```

---

**Last Updated**: February 7, 2026
**Version**: 1.0.0
