// Custom commands for testing

/**
 * Login command for E2E tests
 * Usage: cy.login('username', 'password')
 */
Cypress.Commands.add('login', (username: string, password: string) => {
  cy.visit('/auth/login');
  cy.get('[data-testid="username-input"]').type(username);
  cy.get('[data-testid="password-input"]').type(password);
  cy.get('[data-testid="submit-button"]').click();
  cy.url().should('include', '/dashboard');
});

/**
 * Logout command
 */
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/auth');
});

/**
 * Check for error message
 */
Cypress.Commands.add('checkErrorMessage', (message: string) => {
  cy.contains(message).should('be.visible');
});

/**
 * Check for success message
 */
Cypress.Commands.add('checkSuccessMessage', (message: string) => {
  cy.get('[data-testid="success-toast"]').should('contain', message);
});

// Extend Cypress with custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(username: string, password: string): Chainable<void>;
      logout(): Chainable<void>;
      checkErrorMessage(message: string): Chainable<void>;
      checkSuccessMessage(message: string): Chainable<void>;
    }
  }
}

export {};
