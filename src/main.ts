import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { KeycloakAngularModule } from 'keycloak-angular';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { appConfig } from './app/app.config';

// Bootstrap with app.config providers (includes Keycloak initialization)
bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,
    importProvidersFrom(
      BrowserModule,
      HttpClientModule,
      KeycloakAngularModule,
      BrowserAnimationsModule
    ),
  ],
});
