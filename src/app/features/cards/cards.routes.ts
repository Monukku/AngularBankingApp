
import {Routes } from '@angular/router';
import { CardListComponent } from './components/card-list/card-list.component'; 
import { CardDetailComponent } from './components/card-detail/card-detail.component'; 
import { CardCreateComponent } from './components/card-create/card-create.component'; 
import { authGuard } from '../../core/guards/auth.guard';

export const CARDS_ROUTES: Routes = [
  { path: '', component: CardListComponent, canActivate: [authGuard] },
  { path: 'create', component: CardCreateComponent,canActivate: [authGuard] },
  { path: ':id', component: CardDetailComponent,canActivate: [authGuard] }
];