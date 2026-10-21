describe('Account Management', () => {
  beforeEach(() => {
    cy.visitAuthed('/accounts/account-management');
  });

  it('displays the page heading', () => {
    cy.contains('.page-title', 'Account Management').should('be.visible');
  });

  it('shows the empty state when there are no accounts', () => {
    cy.contains('No accounts yet').should('be.visible');
  });

  it('opens and closes the new account form', () => {
    cy.contains('.btn-primary', 'Open New Account').click();
    cy.contains('Open a New Account').should('be.visible');
    cy.contains('.btn-primary', 'Cancel').click();
    cy.contains('Open a New Account').should('not.exist');
  });

  it('keeps Create Account disabled until an account type is chosen', () => {
    cy.contains('.btn-primary', 'Open New Account').click();
    cy.get('button.btn-submit').should('be.disabled');
  });
});
