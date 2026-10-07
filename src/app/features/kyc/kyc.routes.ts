import { Routes } from '@angular/router';

export const KYC_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/kyc-submission/kyc-submission.component').then(
        (m) => m.KycSubmissionComponent
      ),
  },
];
