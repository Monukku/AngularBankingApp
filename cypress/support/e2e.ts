// Support file
import './commands';

beforeEach(() => {
  // Clear any existing session
  cy.clearCookies();
  cy.clearLocalStorage();
  // Cypress doesn't provide cy.clearSessionStorage(); clear via window
  cy.window().then((win) => {
    try {
      win.sessionStorage.clear();
    } catch (e) {
      // ignore if unavailable
    }
  });
  // Set E2E bypass flag so AuthGuard allows protected routes in tests
  cy.window().then((win) => {
    try {
      win.localStorage.setItem('CYPRESS_E2E', 'true');
    } catch (e) {
      // ignore
    }
  });
});

afterEach(() => {
  // Cleanup after each test
  cy.clearCookies();
});
