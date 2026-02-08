describe('Transaction Management', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
    // cy.login('testuser', 'password');
  });

  it('should display transactions list', () => {
    cy.visit('http://localhost:4200/transactions/list');
    cy.contains('Transactions').should('be.visible');
  });

  it('should validate transfer form', () => {
    cy.visit('http://localhost:4200/transactions/transfer-funds');
    cy.get('button[type="submit"]').click();
    cy.contains('From Account is required').should('be.visible');
  });

  it('should prevent transfer to same account', () => {
    cy.visit('http://localhost:4200/transactions/transfer-funds');
    cy.get('#fromAccount').type('ACC123456');
    cy.get('#toAccount').type('ACC123456');
    cy.get('#amount').type('1000');
    cy.get('button[type="submit"]').click();
    cy.contains('Source and destination accounts must be different').should('be.visible');
  });

  it('should prevent transfer with invalid amount', () => {
    cy.visit('http://localhost:4200/transactions/transfer-funds');
    cy.get('#fromAccount').type('ACC123456');
    cy.get('#toAccount').type('ACC789012');
    cy.get('#amount').type('-1000');
    cy.get('button[type="submit"]').click();
    cy.contains('Amount must be greater than zero').should('be.visible');
  });

  it('should successfully transfer funds', () => {
    cy.visit('http://localhost:4200/transactions/transfer-funds');
    cy.get('#fromAccount').type('ACC123456');
    cy.get('#toAccount').type('ACC789012');
    cy.get('#amount').type('1000');
    cy.get('button[type="submit"]').click();
    cy.contains('Transfer successful').should('be.visible');
  });
});
