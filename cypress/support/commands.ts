// Custom commands for testing

/**
 * Visit a protected route with the E2E auth bypass flag set before the app boots.
 * The flag is honoured by authGuard in non-production builds only. API calls are
 * stubbed with empty lists so pages render without a backend.
 * Usage: cy.visitAuthed('/accounts/account-management')
 */
Cypress.Commands.add('visitAuthed', (path: string) => {
  cy.intercept('GET', '**/api/v1/**', { statusCode: 200, body: [] });
  cy.visit(path, {
    onBeforeLoad(win) {
      win.localStorage.setItem('CYPRESS_E2E', 'true');
    },
  });
  cy.waitForAngular();
});

/**
 * Wait until the client-side Angular app has bootstrapped and is stable, so clicks
 * and typing are not lost on server-rendered markup that is not yet interactive.
 */
Cypress.Commands.add('waitForAngular', () => {
  cy.window({ log: false }).should((win) => {
    const testabilities = (win as unknown as { getAllAngularTestabilities?: () => { isStable(): boolean }[] })
      .getAllAngularTestabilities?.();
    expect(testabilities?.length, 'Angular bootstrapped').to.be.greaterThan(0);
    expect(testabilities?.every((t) => t.isStable()), 'Angular stable').to.equal(true);
    // Server-rendered markup keeps its ngh hydration markers until the client has taken over.
    expect(win.document.querySelector('[ngh]'), 'Hydration finished').to.equal(null);
  });
});

// Extend Cypress with custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      visitAuthed(path: string): Chainable<void>;
      waitForAngular(): Chainable<void>;
    }
  }
}

export {};
