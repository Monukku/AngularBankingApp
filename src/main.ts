import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { KeycloakAngularModule } from 'keycloak-angular';
import { APP_INITIALIZER, importProvidersFrom, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from './app/authentication/services/auth.service';
import { appConfig } from './app/app.config';

// Function to initialize Keycloak
function initializeKeycloak(authService: AuthService) {
  return () => Promise.resolve();
}

// Bootstrap application with appConfig and providers
bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      KeycloakAngularModule,
      BrowserAnimationsModule
    ),
    {
      provide: APP_INITIALIZER,
      useFactory: initializeKeycloak,
      multi: true,
      deps: [AuthService],
    },
  ],
});
