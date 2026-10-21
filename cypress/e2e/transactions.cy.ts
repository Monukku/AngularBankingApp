describe('Transaction Management', () => {
  it('displays the transactions list page', () => {
    cy.visitAuthed('/transactions/list');
    cy.url().should('include', '/transactions/list');
    cy.contains('Transactions').should('be.visible');
  });

  it('displays the transfer wizard', () => {
    cy.visitAuthed('/transactions/transfer-funds');
    cy.contains('.tf-title', 'Transfer money').should('be.visible');
    cy.get('.tw-item').should('have.length.greaterThan', 1);
  });
});
