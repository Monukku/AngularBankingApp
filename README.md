# AngularBankingApp

A modular Angular banking application built with Angular 18, NgRx state management, Keycloak authentication, and a modern enterprise UI. The app is structured around reusable core services, feature modules, and role-based navigation.

## Overview

This project is designed as a banking dashboard and customer portal with support for:

- Authentication and protected routes
- Dashboard overview
- Accounts management
- Transactions and transfers
- Cards and financial products
- Loan information and workflows
- KYC onboarding flows
- Staff/admin views with role-based access
- User profile management

## Tech Stack

- Angular 18
- TypeScript
- RxJS
- NgRx Store + Effects + Router Store
- Keycloak for authentication
- Angular Material
- ECharts for analytics visualizations
- SSR support with Angular Universal
- Cypress for end-to-end testing

## Application Architecture

The app follows a layered and modular structure:

- Core: shared services, guards, interceptors, and global handlers
- Features: domain-specific modules such as auth, dashboard, accounts, cards, loans, staff, and KYC
- Shared: reusable UI components and common presentation logic
- Store: NgRx state slices and effects for application state management

## Project Structure

```text
AngularBankingApp/
├── src/
│   ├── app/
│   │   ├── core/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── services/
│   │   │   └── handlers/
│   │   ├── features/
│   │   │   ├── auth/
│   │   │   ├── accounts/
│   │   │   ├── cards/
│   │   │   ├── dashboard/
│   │   │   ├── kyc/
│   │   │   ├── loans/
│   │   │   ├── staff/
│   │   │   ├── transactions/
│   │   │   └── user-profile/
│   │   ├── shared/
│   │   ├── store/
│   │   ├── app.component.*
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   └── ...
│   ├── assets/
│   ├── environments/
│   ├── index.html
│   ├── main.ts
│   ├── main.server.ts
│   ├── proxy.config.json
│   └── styles.scss
├── API.md
├── QUICK_START.md
├── TESTING.md
├── angular.json
├── cypress.config.ts
├── package.json
├── tsconfig.json
├── eslint.config.js
├── server.ts
├── vercel.json
├── .editorconfig
├── .gitignore
└── README.md
```

## Key Features

### Authentication

- Keycloak-based login flow
- Protected routes via guards
- Role-aware user access
- Automatic bearer token handling through HTTP interceptors

### Banking Dashboard

- Overview of account balances and financial activity
- Financial analytics and charts
- Responsive layout for customer-facing screens

### Business Modules

- Accounts: banking account summaries and details
- Transactions: transfer history and operations
- Cards: credit/debit card management
- Loans: loan products and application workflows
- KYC: onboarding and verification screens
- Staff: internal banking operations and permissions
- User profile: customer account settings and preferences

## Routing

The app uses lazy-loaded feature routes and route guards for access control. Public auth routes and authenticated banking views are separated to keep the navigation model clear and secure.

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Angular CLI (optional, but recommended)

### Install dependencies

```bash
npm install
```

### Start the development server

```bash
npm start
```

The application will run at:

```text
http://localhost:4200
```

## Available Scripts

```bash
npm start
npm run build
npm run build:prod
npm run watch
npm test
npm run lint
npm run clean
npm run clean-build
```

## Environment Configuration

Environment files are stored under `src/environments/` and are used for API URLs, Keycloak settings, and environment-specific values.

## Testing

The project includes:

- Unit tests with Jasmine/Karma
- End-to-end tests with Cypress

For more details, see:

- `TESTING.md`
- `QUICK_START.md`

## Documentation

- `API.md` — API/service documentation
- `QUICK_START.md` — setup and common commands
- `TESTING.md` — testing setup and guidance

## Notes

This repository combines a banking front-end experience with enterprise-style Angular patterns such as modular feature organization, NgRx state management, SSR readiness, and security-aware routing structure.

## License

This project does not currently declare a license in the repository root.

## Contributing

Contributions are welcome. Please keep the project structure consistent and ensure changes are validated with the appropriate build and test commands.
