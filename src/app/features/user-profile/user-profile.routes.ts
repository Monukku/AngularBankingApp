import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { authGuard } from '../../core/guards/auth.guard';
import { Routes } from '@angular/router';

export const USER_PROFILE_ROUTES: Routes = [
  { path: '', component: UserProfileComponent, canActivate: [authGuard] },
  { path: 'user-profile', component: UserProfileComponent, canActivate: [authGuard] },
];