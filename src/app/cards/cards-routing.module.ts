import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CardListComponent } from './components/card-list/card-list.component'; 
import { CardDetailComponent } from './components/card-detail/card-detail.component'; 
import { CardCreateComponent } from './components/card-create/card-create.component'; 
import { AuthGuard } from '../authentication/guards/auth.guard';
const routes: Routes = [
  { path: '', component: CardListComponent, canActivate: [AuthGuard] },
  { path: 'create', component: CardCreateComponent,canActivate: [AuthGuard] },
  { path: ':id', component: CardDetailComponent,canActivate: [AuthGuard] }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CardsRoutingModule { }
