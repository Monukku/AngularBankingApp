import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardListComponent } from './components/card-list/card-list.component'; 
import { CardDetailComponent } from './components/card-detail/card-detail.component'; 
import { CardCreateComponent } from './components/card-create/card-create.component'; 
import { CardsRoutingModule } from './cards-routing.module';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';

@NgModule({
  declarations: [
    
  ],
  imports: [
    CardListComponent,
    CardDetailComponent,
    CardCreateComponent,

    HttpClientModule,
    CommonModule,
    CardsRoutingModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers:[KeycloakService]
})
export class CardsModule { }
