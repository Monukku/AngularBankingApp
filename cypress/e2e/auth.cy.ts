describe('Landing page', () => {
  beforeEach(() => {
    cy.visit('/');
    cy.waitForAngular();
  });

  it('shows the RewaBank landing page', () => {
    cy.contains('.hero__title', 'banking experience').should('be.visible');
    cy.contains('.nav__name', 'RewaBank').should('be.visible');
  });

  it('shows login and register actions', () => {
    cy.contains('.btn-nav-ghost', 'Login').should('be.visible');
    cy.contains('.btn-nav-primary', 'Register').should('be.visible');
  });

  it('navigates to the registration page', () => {
    cy.contains('.btn-nav-primary', 'Register').click();
    cy.location('pathname', { timeout: 10000 }).should('eq', '/auth/register');
    cy.contains('Create your account').should('be.visible');
  });
});

describe('Registration form', () => {
  beforeEach(() => {
    cy.visit('/auth/register');
    cy.waitForAngular();
  });

  it('disables submit while the form is empty', () => {
    cy.get('button[type="submit"]').should('be.disabled');
  });

  it('requires a first name once the field is touched', () => {
    cy.get('input[formControlName="firstName"]').click().blur();
    cy.contains('First name is required').should('be.visible');
  });

  it('keeps submit disabled for an invalid email', () => {
    cy.get('input[formControlName="firstName"]').type('John');
    cy.get('input[formControlName="lastName"]').type('Doe');
    cy.get('input[formControlName="email"]').type('not-an-email');
    cy.get('input[formControlName="mobileNumber"]').type('9876543210');
    cy.get('input[formControlName="password"]').type('Password@123');
    cy.get('input[formControlName="confirmPassword"]').type('Password@123');
    cy.get('button[type="submit"]').should('be.disabled');
  });
});

describe('Protected routes', () => {
  it('sends unauthenticated users to Keycloak instead of the dashboard', () => {
    // authGuard calls keycloak.login(), which navigates to the Keycloak auth endpoint.
    cy.intercept('GET', '**/realms/rewabank/protocol/openid-connect/auth*', {
      statusCode: 200,
      body: '<html><body>keycloak login</body></html>',
    }).as('keycloakLogin');
    cy.visit('/dashboard', { failOnStatusCode: false });
    cy.wait('@keycloakLogin');
  });

  it('allows access to protected routes when the E2E bypass flag is set', () => {
    cy.visitAuthed('/dashboard');
    cy.url().should('include', '/dashboard');
  });
});
