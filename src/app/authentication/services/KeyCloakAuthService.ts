import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { KeycloakService } from 'keycloak-angular';
import * as AuthActions from '../../store/actions/auth.actions';
import { keycloakConfig } from '../../../environments/keycloakConfig';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class KeycloakAuthService {
  constructor(private keycloakService: KeycloakService, private store: Store) {}

  async init(): Promise<void> {
    await this.keycloakService.init({
      config: keycloakConfig,
      initOptions: {
        onLoad: 'check-sso',
        checkLoginIframe: false,
      },
      enableBearerInterceptor: true,
      bearerExcludedUrls: ['/assets', '/clients/public'], // Adjust to your needs
    });

    this.store.dispatch(
      AuthActions.setAuthenticated({
        authenticated: this.keycloakService.isLoggedIn(),
      })
    );
  }

  public getToken(): Promise<string> {
    return this.keycloakService
      .updateToken(5)
      .then(() => {
        return this.keycloakService.getToken() || '';
      })
      .catch((err) => {
        console.error('Failed to refresh token', err);
        return '';
      });
  }

  public getAuthHeaders(): HttpHeaders {
    const token = this.getToken();
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });
  }

  login() {
    return this.keycloakService.login().then(() => {
      this.store.dispatch(
        AuthActions.setAuthenticated({ authenticated: true })
      );
    });
  }

  logout() {
    return this.keycloakService.logout().then(() => {
      this.store.dispatch(
        AuthActions.setAuthenticated({ authenticated: false })
      );
    });
  }
}
