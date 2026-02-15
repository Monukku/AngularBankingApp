import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { authGuard } from '../../core/guards/auth.guard';

export const USER_PROFILE_ROUTES: Routes = [
  { path: 'user-profile', component: UserProfileComponent, canActivate: [authGuard] }
];