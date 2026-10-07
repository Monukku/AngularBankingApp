import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { KeycloakService } from 'keycloak-angular';

// Password management is handled by Keycloak account console.
// There is no change-password endpoint on the backend.
@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule],
  template: `
    <mat-card>
      <mat-card-header>
        <mat-card-title>Change Password</mat-card-title>
      </mat-card-header>
      <mat-card-content>
        <p>Password management is handled securely through your account portal.</p>
      </mat-card-content>
      <mat-card-actions>
        <button mat-raised-button color="primary" (click)="openAccountConsole()">
          Manage Password
        </button>
      </mat-card-actions>
    </mat-card>
  `,
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent {
  private keycloak = inject(KeycloakService);

  openAccountConsole(): void {
    this.keycloak.getKeycloakInstance().accountManagement();
  }
}
