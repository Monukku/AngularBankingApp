describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.visit('http://localhost:4200');
  });

  it('should display login page', () => {
    cy.contains('Banking Login').should('be.visible');
  });

  it('should navigate to auth module when not logged in', () => {
    cy.visit('http://localhost:4200/dashboard');
    // Should redirect to login
    cy.url().should('include', '/auth');
  });

  it('should show error with empty credentials', () => {
    cy.visit('http://localhost:4200/auth/login');
    cy.get('button[aria-label="Login Button"]').click();
    cy.contains('Username is required').should('be.visible');
  });

  it('should validate email format', () => {
    cy.visit('http://localhost:4200/auth/login');
    // Login form uses username; validate username format by typing invalid username
    cy.get('input[name="username"]').type('inv');
    cy.get('button[aria-label="Login Button"]').click();
    cy.contains('Username must be at least 4 characters long').should('be.visible');
  });
});

describe('Protected Routes', () => {
  it('should redirect to login when accessing protected route without authentication', () => {
    cy.visit('http://localhost:4200/dashboard');
    cy.url().should('include', '/auth');
  });

  it('should allow access to protected routes when authenticated', () => {
    // This would require setting up authentication state
    // cy.login('testuser', 'password');
    // cy.visit('http://localhost:4200/dashboard');
    // cy.url().should('include', '/dashboard');
  });
});
