import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { AuthenticationRoutingModule } from './authentication-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
import { Store, StoreModule } from '@ngrx/store';
import { authReducer } from '../store/reducers/auth.reducer';
import { EffectsModule } from '@ngrx/effects';
import { AuthEffects } from '../store/effects/auth.effects';
@NgModule({
  declarations: [],
  imports: [
    HttpClientModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatCardModule,
    MatButtonModule,
    AuthenticationRoutingModule,
    KeycloakAngularModule,
    StoreModule.forRoot(authReducer),
    EffectsModule.forRoot([AuthEffects]),
  ],
  providers: [KeycloakService, Store],
})
export class AuthenticationModule {}
