# Banking App - API Documentation

## Table of Contents
1. [Authentication Service](#authentication-service)
2. [Account Service](#account-service)
3. [Beneficiary Service](#beneficiary-service)
4. [Card Service](#card-service)
5. [Loan Service](#loan-service)
6. [Transaction Service](#transaction-service)
7. [Logger Service](#logger-service)
8. [Error Handler Service](#error-handler-service)

---

## Authentication Service

**File**: `src/app/authentication/services/auth.service.ts`

**Purpose**: Handles user authentication, token management, and role-based access control.

### Methods

#### `login(username: string, password: string): Observable<void>`
Authenticates user with provided credentials via Keycloak.

**Parameters**:
- `username`: User's email or username
- `password`: User's password

**Returns**: `Observable<void>`

**Error Handling**:
- Throws `AuthenticationError` on invalid credentials
- Throws `ServerError` on Keycloak communication failure

**Example**:
```typescript
this.authService.login('user@example.com', 'password123')
  .subscribe({
    next: () => console.log('Logged in'),
    error: (error) => console.error('Login failed', error)
  });
```

---

#### `logout(): Observable<void>`
Logs out the current user and clears authentication tokens.

**Returns**: `Observable<void>`

**Example**:
```typescript
this.authService.logout().subscribe(() => {
  // User is logged out, redirect to login page
});
```

---

#### `getToken(): string | null`
Retrieves the current authentication token synchronously.

**Returns**: `string | null` - JWT token or null if not authenticated

**Example**:
```typescript
const token = this.authService.getToken();
if (token) {
  // Use token for API requests
}
```

---

#### `loadUserProfile(): Observable<UserProfile>`
Fetches the authenticated user's profile information.

**Returns**: `Observable<UserProfile>`

**UserProfile Model**:
```typescript
interface UserProfile {
  id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  roles: string[];
  attributes?: Record<string, any>;
}
```

**Error Handling**:
- Throws `AuthenticationError` if user not authenticated
- Throws `ServerError` on profile fetch failure

**Example**:
```typescript
this.authService.loadUserProfile()
  .subscribe(profile => {
    console.log('User:', profile.firstName, profile.lastName);
  });
```

---

#### `hasRole(role: string): boolean`
Checks if the current user has a specific role.

**Parameters**:
- `role`: Role name to check

**Returns**: `boolean` - True if user has the role

**Example**:
```typescript
if (this.authService.hasRole('ADMIN')) {
  // Show admin features
}
```

---

#### `register(userData: RegisterRequest): Observable<void>`
Registers a new user account.

**Parameters**:
```typescript
interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}
```

**Returns**: `Observable<void>`

**Validation Rules**:
- Username: Required, alphanumeric (3-50 chars)
- Email: Valid email format
- Password: Min 8 chars, must contain uppercase, lowercase, number, special char
- Names: Required, max 50 chars each

**Error Handling**:
- `ValidationError` for invalid input
- `ConflictError` if username/email already exists
- `ServerError` for registration failure

**Example**:
```typescript
this.authService.register({
  username: 'john_doe',
  email: 'john@example.com',
  password: 'SecurePass123!',
  firstName: 'John',
  lastName: 'Doe'
}).subscribe({
  next: () => console.log('Registration successful'),
  error: (error) => console.error('Registration failed', error)
});
```

---

#### `sendResetLink(email: string): Observable<void>`
Sends a password reset email.

**Parameters**:
- `email`: User's email address

**Returns**: `Observable<void>`

**Validation Rules**:
- Email must be valid and registered

**Example**:
```typescript
this.authService.sendResetLink('user@example.com')
  .subscribe(() => console.log('Reset link sent'));
```

---

#### `changePassword(oldPassword: string, newPassword: string): Observable<void>`
Changes the authenticated user's password.

**Parameters**:
- `oldPassword`: Current password
- `newPassword`: New password

**Returns**: `Observable<void>`

**Validation Rules**:
- New password must meet complexity requirements
- Old password must be correct

**Error Handling**:
- `ValidationError` for weak password
- `AuthenticationError` if old password incorrect

**Example**:
```typescript
this.authService.changePassword('OldPass123!', 'NewPass456!')
  .subscribe({
    next: () => console.log('Password changed'),
    error: (error) => console.error('Change failed', error)
  });
```

---

## Account Service

**File**: `src/app/accounts/services/account.service.ts`

**Purpose**: Manages user bank accounts (CRUD operations).

### Methods

#### `createAccount(account: CreateAccountRequest): Observable<Account>`
Creates a new bank account.

**Parameters**:
```typescript
interface CreateAccountRequest {
  accountName: string;
  accountType: 'savings' | 'checking' | 'business';
  currency: string;
  mobileNumber: string;
}
```

**Validation Rules**:
- `accountName`: Required, max 50 chars
- `mobileNumber`: 10-digit format (matches regex: `^\d{10}$`)
- `accountType`: Must be one of allowed types
- `currency`: Must be valid currency code (e.g., 'USD', 'INR')

**Returns**: `Observable<Account>`

```typescript
interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  accountType: string;
  balance: number;
  currency: string;
  createdDate: string;
}
```

**Error Handling**:
- `ValidationError` for invalid input
- `ServerError` (500, 503) for account creation failure

**Example**:
```typescript
this.accountService.createAccount({
  accountName: 'My Savings Account',
  accountType: 'savings',
  currency: 'USD',
  mobileNumber: '9876543210'
}).subscribe(account => {
  console.log('Account created:', account.accountNumber);
});
```

---

#### `fetchAccountDetails(accountId: string): Observable<Account>`
Retrieves details for a specific account.

**Parameters**:
- `accountId`: Account ID to fetch

**Returns**: `Observable<Account>`

**Validation Rules**:
- `accountId`: Required, non-empty string

**Error Handling**:
- `ValidationError` if account ID invalid
- `NotFoundError` (404) if account doesn't exist
- `ServerError` for fetch failure

**Example**:
```typescript
this.accountService.fetchAccountDetails('ACC12345')
  .subscribe(account => {
    console.log('Balance:', account.balance);
  });
```

---

#### `updateAccount(accountId: string, updates: UpdateAccountRequest): Observable<Account>`
Updates an existing account.

**Parameters**:
```typescript
interface UpdateAccountRequest {
  accountName?: string;
  mobileNumber?: string;
  // Other updatable fields
}
```

**Returns**: `Observable<Account>`

**Validation Rules**:
- Same as `createAccount` for applicable fields
- At least one field must be provided for update

**Error Handling**:
- `ValidationError` for invalid input
- `NotFoundError` (404) if account not found
- `ConflictError` (409) if update conflicts with existing data
- `ServerError` for update failure

**Example**:
```typescript
this.accountService.updateAccount('ACC12345', {
  accountName: 'Updated Name',
  mobileNumber: '9876543210'
}).subscribe(account => {
  console.log('Account updated:', account);
});
```

---

#### `deleteAccount(accountId: string): Observable<void>`
Deletes an account (if balance is zero and no pending transactions).

**Parameters**:
- `accountId`: Account ID to delete

**Returns**: `Observable<void>`

**Error Handling**:
- `ValidationError` if account has balance or pending transactions
- `NotFoundError` (404) if account not found
- `ServerError` for deletion failure

**Example**:
```typescript
this.accountService.deleteAccount('ACC12345')
  .subscribe(() => console.log('Account deleted'));
```

---

#### `listAccounts(): Observable<Account[]>`
Retrieves all accounts for the authenticated user.

**Returns**: `Observable<Account[]>`

**Example**:
```typescript
this.accountService.listAccounts()
  .subscribe(accounts => {
    console.log('Total accounts:', accounts.length);
  });
```

---

## Beneficiary Service

**File**: `src/app/accounts/services/beneficiary.service.ts`

**Purpose**: Manages beneficiaries for fund transfers.

### Methods

#### `getBeneficiaries(): Observable<Beneficiary[]>`
Retrieves all beneficiaries for the user.

**Returns**: `Observable<Beneficiary[]>`

```typescript
interface Beneficiary {
  id: string;
  name: string;
  accountNumber: string;
  bankCode: string;
  nickname?: string;
  createdDate: string;
}
```

**Example**:
```typescript
this.beneficiaryService.getBeneficiaries()
  .subscribe(beneficiaries => {
    console.log('Beneficiaries:', beneficiaries);
  });
```

---

#### `addBeneficiary(beneficiary: CreateBeneficiaryRequest): Observable<Beneficiary>`
Adds a new beneficiary.

**Parameters**:
```typescript
interface CreateBeneficiaryRequest {
  name: string;
  accountNumber: string;
  bankCode: string;
  nickname?: string;
}
```

**Validation Rules**:
- `name`: Required, 2-100 chars
- `accountNumber`: 8-20 alphanumeric characters
- `bankCode`: Required, valid bank code format
- `nickname`: Optional, max 50 chars

**Returns**: `Observable<Beneficiary>`

**Error Handling**:
- `ValidationError` for invalid input
- `ConflictError` (409) if beneficiary already exists
- `ServerError` for addition failure

**Example**:
```typescript
this.beneficiaryService.addBeneficiary({
  name: 'John Smith',
  accountNumber: '12345678',
  bankCode: 'AXIS',
  nickname: 'John'
}).subscribe(beneficiary => {
  console.log('Beneficiary added:', beneficiary.id);
});
```

---

#### `deleteBeneficiary(beneficiaryId: string): Observable<void>`
Deletes a beneficiary.

**Parameters**:
- `beneficiaryId`: Beneficiary ID to delete

**Returns**: `Observable<void>`

**Error Handling**:
- `NotFoundError` (404) if beneficiary not found
- `ServerError` for deletion failure

**Example**:
```typescript
this.beneficiaryService.deleteBeneficiary('BEN123')
  .subscribe(() => console.log('Beneficiary deleted'));
```

---

## Card Service

**File**: `src/app/cards/service/card.service.ts`

**Purpose**: Manages debit/credit cards.

### Methods

#### `getCards(): Observable<Card[]>`
Retrieves all cards for the user.

**Returns**: `Observable<Card[]>`

```typescript
interface Card {
  id: string;
  cardNumber: string; // Masked: **** **** **** 1234
  cardType: 'debit' | 'credit';
  cardholderName: string;
  expiryDate: string; // MM/YY format
  cvv?: string; // Only in specific responses
  issuer: string;
  status: 'active' | 'inactive' | 'blocked';
}
```

**Example**:
```typescript
this.cardService.getCards()
  .subscribe(cards => {
    cards.forEach(card => {
      console.log('Card:', card.cardholderName, card.cardNumber);
    });
  });
```

---

#### `getCard(cardId: string): Observable<Card>`
Retrieves details for a specific card.

**Parameters**:
- `cardId`: Card ID

**Returns**: `Observable<Card>`

**Error Handling**:
- `NotFoundError` (404) if card not found
- `ServerError` for fetch failure

---

#### `createCard(card: CreateCardRequest): Observable<Card>`
Creates a new card.

**Parameters**:
```typescript
interface CreateCardRequest {
  cardType: 'debit' | 'credit';
  cardholderName: string;
  linkedAccountId: string;
}
```

**Validation Rules**:
- `cardholderName`: Required, max 50 chars
- `cardType`: Must be 'debit' or 'credit'
- `linkedAccountId`: Must be valid account

**Returns**: `Observable<Card>`

**Error Handling**:
- `ValidationError` for invalid input
- `ServerError` for card creation failure

**Example**:
```typescript
this.cardService.createCard({
  cardType: 'debit',
  cardholderName: 'John Doe',
  linkedAccountId: 'ACC12345'
}).subscribe(card => {
  console.log('Card created:', card.cardNumber);
});
```

---

#### `updateCard(cardId: string, updates: UpdateCardRequest): Observable<Card>`
Updates card details.

**Parameters**:
```typescript
interface UpdateCardRequest {
  cardholderName?: string;
  status?: 'active' | 'inactive' | 'blocked';
  // Other fields
}
```

**Returns**: `Observable<Card>`

---

#### `deleteCard(cardId: string): Observable<void>`
Deletes a card.

**Parameters**:
- `cardId`: Card ID to delete

**Returns**: `Observable<void>`

---

### Card Validation Rules

| Field | Rules |
|-------|-------|
| Card Number | 13-19 digits |
| CVV | 3-4 digits |
| Expiry Date | MM/YY format, not expired |
| Cardholder Name | Max 50 characters |

---

## Loan Service

**File**: `src/app/loans/service/loan.service.ts`

**Purpose**: Manages loan applications and details.

### Methods

#### `getLoans(): Observable<Loan[]>`
Retrieves all loans for the user.

**Returns**: `Observable<Loan[]>`

```typescript
interface Loan {
  id: string;
  loanType: 'home' | 'auto' | 'personal' | 'education' | 'business';
  principal: number;
  tenure: number; // In months
  interestRate: number; // Percentage
  monthlyEMI: number;
  status: 'active' | 'closed' | 'default';
  disbursedDate: string;
  maturityDate: string;
}
```

---

#### `getLoan(loanId: string): Observable<Loan>`
Retrieves details for a specific loan.

**Parameters**:
- `loanId`: Loan ID

**Returns**: `Observable<Loan>`

---

#### `createLoan(loan: CreateLoanRequest): Observable<Loan>`
Creates a new loan application.

**Parameters**:
```typescript
interface CreateLoanRequest {
  loanType: 'home' | 'auto' | 'personal' | 'education' | 'business';
  principal: number;
  tenure: number;
  interestRate: number;
  purpose: string;
}
```

**Validation Rules**:
- `loanType`: Required, must be one of allowed types
- `principal`: > 0 and < 10,000,000
- `tenure`: Between 1-360 months
- `interestRate`: 0-50%
- `purpose`: Required, max 200 chars

**Returns**: `Observable<Loan>`

**Error Handling**:
- `ValidationError` for invalid input
- `ServerError` for loan creation failure

**Example**:
```typescript
this.loanService.createLoan({
  loanType: 'home',
  principal: 5000000,
  tenure: 240,
  interestRate: 7.5,
  purpose: 'Home purchase'
}).subscribe(loan => {
  console.log('Loan created:', loan.id);
  console.log('Monthly EMI:', loan.monthlyEMI);
});
```

---

#### `updateLoan(loanId: string, updates: UpdateLoanRequest): Observable<Loan>`
Updates loan details.

**Parameters**:
```typescript
interface UpdateLoanRequest {
  status?: string;
  interestRate?: number;
  // Other fields
}
```

**Returns**: `Observable<Loan>`

---

#### `deleteLoan(loanId: string): Observable<void>`
Closes/deletes a loan (only if no outstanding amount).

**Parameters**:
- `loanId`: Loan ID to delete

**Returns**: `Observable<void>`

---

### Loan Validation Rules

| Field | Rules |
|-------|-------|
| Loan Type | home, auto, personal, education, business |
| Principal | > 0 and < 10,000,000 |
| Tenure | 1-360 months |
| Interest Rate | 0-50% |
| Purpose | Required, max 200 chars |

---

## Transaction Service

**File**: `src/app/accounts/services/transaction.service.ts`

**Purpose**: Handles fund transfers and transaction history.

### Methods

#### `getTransactionHistory(accountId: string, filters?: TransactionFilters): Observable<Transaction[]>`
Retrieves transaction history for an account.

**Parameters**:
```typescript
interface TransactionFilters {
  startDate?: string;
  endDate?: string;
  type?: 'credit' | 'debit';
  limit?: number;
  offset?: number;
}
```

**Returns**: `Observable<Transaction[]>`

```typescript
interface Transaction {
  id: string;
  fromAccount: string;
  toAccount: string;
  amount: number;
  currency: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  reference: string;
  description: string;
}
```

**Example**:
```typescript
this.transactionService.getTransactionHistory('ACC12345', {
  startDate: '2024-01-01',
  endDate: '2024-12-31',
  type: 'debit'
}).subscribe(transactions => {
  console.log('Transactions:', transactions);
});
```

---

#### `transferFunds(transfer: TransferRequest): Observable<TransferResponse>`
Transfers funds between accounts.

**Parameters**:
```typescript
interface TransferRequest {
  fromAccount: string;
  toAccount: string;
  amount: number;
  beneficiaryId?: string;
  description?: string;
  transferType: 'own' | 'beneficiary' | 'external';
}
```

**Validation Rules**:
- `fromAccount`: Valid account format (8-20 alphanumeric)
- `toAccount`: Valid account format, different from source
- `amount`: > 0
- Source and destination cannot be the same
- Amount cannot exceed account balance

**Returns**: `Observable<TransferResponse>`

```typescript
interface TransferResponse {
  transactionId: string;
  status: 'completed' | 'pending';
  amount: number;
  timestamp: string;
  reference: string;
}
```

**Error Handling**:
- `ValidationError` for invalid input
- `InsufficientFundsError` if balance insufficient
- `ServerError` for transfer failure

**Example**:
```typescript
this.transactionService.transferFunds({
  fromAccount: 'ACC12345',
  toAccount: 'ACC67890',
  amount: 5000,
  description: 'Transfer to friend',
  transferType: 'beneficiary'
}).subscribe(response => {
  console.log('Transfer successful:', response.transactionId);
});
```

---

## Logger Service

**File**: `src/app/core/services/logger.service.ts`

**Purpose**: Centralized logging with environment-aware levels.

### Methods

#### `debug(message: string, data?: any): void`
Logs debug-level message (development only).

**Parameters**:
- `message`: Log message
- `data`: Optional data object

**Example**:
```typescript
this.logger.debug('Fetching user data', { userId: 123 });
```

---

#### `info(message: string, data?: any): void`
Logs info-level message.

**Parameters**:
- `message`: Log message
- `data`: Optional data object

**Example**:
```typescript
this.logger.info('User logged in successfully');
```

---

#### `warn(message: string, data?: any): void`
Logs warning-level message.

**Parameters**:
- `message`: Log message
- `data`: Optional data object

**Example**:
```typescript
this.logger.warn('API response slow', { duration: 5000 });
```

---

#### `error(message: string, error?: any, context?: any): void`
Logs error-level message.

**Parameters**:
- `message`: Error message
- `error`: Error object
- `context`: Additional context

**Example**:
```typescript
this.logger.error('Account fetch failed', error, { accountId: '123' });
```

---

## Error Handler Service

**File**: `src/app/core/handlers/error.handler.ts`

**Purpose**: Global error handler for uncaught errors.

### Handled Errors

- **HttpError**: HTTP request/response errors
- **ValidationError**: Input validation errors
- **AuthenticationError**: Auth failures
- **AuthorizationError**: Permission denied
- **ServerError**: Server errors (5xx)
- **NetworkError**: Network connectivity errors
- **TimeoutError**: Request timeouts

### Error Handling in Services

```typescript
private handleError(error: HttpErrorResponse): Observable<never> {
  switch (error.status) {
    case 0:
      return throwError(() => new NetworkError('Network error'));
    case 400:
      return throwError(() => new ValidationError('Invalid request'));
    case 401:
      return throwError(() => new AuthenticationError('Unauthorized'));
    case 403:
      return throwError(() => new AuthorizationError('Forbidden'));
    case 404:
      return throwError(() => new NotFoundError('Not found'));
    case 409:
      return throwError(() => new ConflictError('Resource already exists'));
    case 500:
    case 503:
      return throwError(() => new ServerError('Server error'));
    default:
      return throwError(() => new Error('Unknown error'));
  }
}
```

---

## Interceptor Chain

All HTTP requests pass through three interceptors in order:

1. **LoggingInterceptor**: Logs request/response with unique ID
2. **AuthInterceptor**: Adds Bearer token to Authorization header
3. **ErrorInterceptor**: Handles errors and retries

---

## Common Usage Patterns

### Handling Observables

```typescript
this.accountService.createAccount(data)
  .pipe(
    tap((account) => {
      this.logger.info('Account created', { id: account.id });
    }),
    catchError((error) => {
      this.logger.error('Account creation failed', error);
      return throwError(() => error);
    })
  )
  .subscribe({
    next: (account) => {
      // Success handling
    },
    error: (error) => {
      // Error handling
    },
    complete: () => {
      // Completion handling
    }
  });
```

### Combining Multiple Observables

```typescript
forkJoin([
  this.accountService.listAccounts(),
  this.cardService.getCards(),
  this.loanService.getLoans()
]).subscribe(([accounts, cards, loans]) => {
  console.log('All data loaded');
});
```

---

**Last Updated**: February 7, 2026
**Version**: 1.0.0
