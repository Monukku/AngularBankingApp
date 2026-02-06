import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { AppRoutingModule } from './app/app-routing.module';
import { KeycloakAngularModule } from 'keycloak-angular';
import { APP_INITIALIZER, importProvidersFrom, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { provideStore } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { provideStoreDevtools } from '@ngrx/store-devtools';
import { KeycloakAuthService } from './app/authentication/services/KeyCloakAuthService';
import { AuthEffects } from './app/store/effects/auth.effects';
import { authReducer } from './app/store/reducers/auth.reducer';
import { environment } from './environments/environment';

// Function to initialize Keycloak
function initializeKeycloak(keycloak: KeycloakAuthService) {
  return () => keycloak.init();
}

// Bootstrap application with providers and NgRx configurations
bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(
      BrowserModule,
      AppRoutingModule,
      HttpClientModule,
      KeycloakAngularModule,
      BrowserAnimationsModule
    ),
    provideStore({
      auth: authReducer, // Ensure you add your reducers here
    }),
    provideEffects([AuthEffects]), // Ensure you add your effects here
    !environment.production
      ? provideStoreDevtools({
          maxAge: 25,
          trace: false,
          traceLimit: 75,
          autoPause: true,
          logOnly: !isDevMode,
          connectInZone: true,
        })
      : [],
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [KeycloakAuthService],
    },
  ],
});
