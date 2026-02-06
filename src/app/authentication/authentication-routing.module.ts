import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';
import { NoAuthGuard } from './guards/no-auth.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NoAuthGuard], // Only accessible if not logged in
  },
  {
    path: 'register',
    component: RegisterComponent,
    canActivate: [NoAuthGuard], // Only accessible if not logged in
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [NoAuthGuard], // Only accessible if not logged in
  },
  {
    path: 'change-password',
    component: ChangePasswordComponent,
    canActivate: [NoAuthGuard], // Only accessible if not logged in
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
