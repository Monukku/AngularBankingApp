import { Routes } from '@angular/router';
import { RegisterComponent } from './components/register/register.component';
import { LandingComponent } from './components/landing/landing.component';
import { noAuthGuard } from '../../core/guards/no-auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: LandingComponent,
    canActivate: [noAuthGuard],
    data: { title: 'Welcome - RewaBank' },
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [noAuthGuard],
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
