import { SummaryComponent } from './components/summary/summary.component';
import { authGuard } from '../../core/guards/auth.guard';
import { HomeComponent } from './components/home/home.component';
import { Routes } from '@angular/router';

export const HOME_ROUTES: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'home-page', component: HomeComponent, canActivate: [authGuard] },
  { path: 'summary', component: SummaryComponent, canActivate: [authGuard] },
];

