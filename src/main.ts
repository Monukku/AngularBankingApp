// import { bootstrapApplication } from '@angular/platform-browser';
// import { AppComponent } from './app/app.component';
// import { KeycloakAngularModule, KeycloakService } from 'keycloak-angular';
// import { APP_INITIALIZER, importProvidersFrom } from '@angular/core';
// import { BrowserModule } from '@angular/platform-browser';
// import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
// import { HttpClientModule } from '@angular/common/http';

// import { appConfig } from './app/app.config';
// import { environment } from './environments/environment';

// // ✅ PROPER Keycloak initialization function
// function initializeKeycloak(keycloak: KeycloakService) {
//   return () =>
//     keycloak.init({
//       config: environment.keycloak,
//       initOptions: {
//         onLoad: 'check-sso',
//         checkLoginIframe: false,
//         silentCheckSsoRedirectUri:
//           window.location.origin + '/assets/silent-check-sso.html',
//       },
//       enableBearerInterceptor: true,
//       bearerExcludedUrls: ['/assets', '/clients/public'],
//     });
// }

// // Bootstrap application
// bootstrapApplication(AppComponent, {
//   providers: [
//     ...appConfig.providers,
//     importProvidersFrom(
//       BrowserModule,
//       HttpClientModule,
//       KeycloakAngularModule,
//       BrowserAnimationsModule
//     ),
//     {
//       provide: APP_INITIALIZER,
//       useFactory: initializeKeycloak,
//       multi: true,
//       deps: [KeycloakService], // ✅ Changed from AuthService to KeycloakService
//     },
//   ],
// });


import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { KeycloakAngularModule } from 'keycloak-angular';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule } from '@angular/common/http';

import { appConfig } from './app/app.config';

// ✅ Bootstrap with app.config providers (includes Keycloak initialization)
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
