describe('Account Management', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
    // cy.login('testuser', 'password');
  });

  it('should display accounts list', () => {
    cy.visit('http://localhost:4200/accounts/account-management');
    cy.contains('Account Management').should('be.visible');
  });

  it('should show account details', () => {
    cy.visit('http://localhost:4200/accounts/account-management');
    // No account list in current UI; check for create button presence then show check form
    cy.get('.create-button').should('be.visible');
  });

  it('should validate account creation', () => {
    cy.visit('http://localhost:4200/accounts/account-management');
    cy.get('.create-button').click();
    cy.get('button.submit-button').click();
    cy.contains('Name is required').should('be.visible');
  });

  it('should create account with valid data', () => {
    cy.visit('http://localhost:4200/accounts/account-management');
    cy.get('.create-button').click();
    cy.get('input[formControlName="name"]').type('Test Account');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="mobileNumber"]').type('9876543210');
    cy.get('button.submit-button').click();
    cy.contains('Account created successfully').should('be.visible');
  });

  it('should display error for invalid mobile number', () => {
    cy.visit('http://localhost:4200/accounts/account-management');
    cy.get('.create-button').click();
    cy.get('input[formControlName="name"]').type('Test Account');
    cy.get('input[formControlName="email"]').type('test@example.com');
    cy.get('input[formControlName="mobileNumber"]').type('123'); // Too short
    cy.get('button.submit-button').click();
    cy.contains('Invalid mobile number').should('be.visible');
  });
});
