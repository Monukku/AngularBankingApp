import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent,
    data: { title: 'Welcome - RewaBank' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    data: { title: 'Register - RewaBank' },
  },
  {
    path: 'login',
    redirectTo: '/auth/login-redirect',
    pathMatch: 'full',
  },
  {
    path: 'login-redirect',
    component: LandingComponent,
    data: { title: 'Login - RewaBank' },
  },
];
