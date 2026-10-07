import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, DestroyRef } from '@angular/core';
import { UserProfileService } from '../../services/user-profile.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { KeycloakService } from 'keycloak-angular';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { catchError, of } from 'rxjs';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule],
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfileComponent implements OnInit {
  private userProfileService = inject(UserProfileService);
  private keycloak = inject(KeycloakService);
  private destroyRef = inject(DestroyRef);
  private cdr = inject(ChangeDetectorRef);
  private snackBar = inject(MatSnackBar);

  authProfile: any = null;
  customerProfile: any = null;
  roles: string[] = [];

  // Inline edit state — which field is being edited
  editing: string | null = null;
  editValue = '';
  saving = false;

  // Address edit — all fields together in one panel
  editingAddress = false;
  addressForm = { addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', country: 'India' };
  addressSaving = false;

  get isSuperAdmin(): boolean { return this.roles.includes('SUPER_ADMIN'); }
  get isStaff(): boolean      { return this.roles.some(r => ['STAFF','TELLER','MANAGER','SUPER_ADMIN','RELATIONSHIP_MANAGER','BRANCH_MANAGER','CREDIT_OFFICER','AUDITOR'].includes(r)); }

  get avatarInitial(): string {
    return (this.authProfile?.firstName?.charAt(0) || this.authProfile?.email?.charAt(0) || 'U').toUpperCase();
  }

  get displayName(): string {
    const f = this.authProfile?.firstName || '';
    const l = this.authProfile?.lastName  || '';
    return (f + ' ' + l).trim() || this.authProfile?.email?.split('@')[0] || '—';
  }

  ngOnInit(): void {
    const kc = this.keycloak.getKeycloakInstance();
    const token = kc.tokenParsed as any;
    if (token) {
      this.authProfile = {
        username:  token.preferred_username ?? token.sub,
        email:     token.email ?? '',
        firstName: token.given_name ?? '',
        lastName:  token.family_name ?? '',
      };
      this.roles = kc.realmAccess?.roles ?? [];
      this.cdr.markForCheck();
    }

    this.userProfileService.getAuthProfile()
      .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        if (profile) {
          // Backend now returns firstName/lastName directly from Keycloak — use them if present
          // Fall back to splitting fullName only if the new fields are absent (older deployments)
          if (!profile.firstName && profile.fullName) {
            const parts = profile.fullName.trim().split(/\s+/);
            profile.firstName = parts[0] ?? '';
            profile.lastName  = parts.length > 1 ? parts[parts.length - 1] : '';
          }
          this.authProfile = {
            ...this.authProfile,
            ...profile,
          };
          this.cdr.markForCheck();
        }
      });

    this.userProfileService.getCustomerProfile()
      .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe((profile) => {
        this.customerProfile = profile;
        this.cdr.markForCheck();
      });
  }

  // ── Inline name edit ──────────────────────────────────────────────────────

  startEdit(field: string, current: string): void {
    this.editing   = field;
    this.editValue = current || '';
    this.cdr.markForCheck();
  }

  cancelEdit(): void {
    this.editing   = null;
    this.editValue = '';
    this.cdr.markForCheck();
  }

  saveField(field: 'firstName' | 'lastName'): void {
    const val = this.editValue.trim();
    if (!val) return;
    this.saving = true;
    this.userProfileService.updateName({ [field]: val }).subscribe({
      next: (res: any) => {
        this.authProfile = { ...this.authProfile, [field]: val };
        this.editing = null;
        this.saving  = false;
        this.snackBar.open('Profile updated', 'Close',
          { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.cdr.markForCheck();
      },
      error: () => {
        this.saving = false;
        this.snackBar.open('Update failed', 'Close',
          { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.cdr.markForCheck();
      },
    });
  }

  // ── Address edit ──────────────────────────────────────────────────────────

  startAddressEdit(): void {
    const a = this.customerProfile?.address;
    this.addressForm = {
      addressLine1: a?.addressLine1 || '',
      addressLine2: a?.addressLine2 || '',
      city:         a?.city         || '',
      state:        a?.state        || '',
      pincode:      a?.pincode      || '',
      country:      a?.country      || 'India',
    };
    this.editingAddress = true;
    this.cdr.markForCheck();
  }

  cancelAddressEdit(): void {
    this.editingAddress = false;
    this.cdr.markForCheck();
  }

  saveAddress(): void {
    if (!this.addressForm.addressLine1 || !this.addressForm.city || !this.addressForm.state || !this.addressForm.pincode) {
      this.snackBar.open('Address line 1, city, state and pincode are required', 'Close',
        { duration: 3500, panelClass: ['error-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
      return;
    }
    this.addressSaving = true;
    this.userProfileService.updateAddress(this.addressForm).subscribe({
      next: (res: any) => {
        if (this.customerProfile) {
          this.customerProfile = { ...this.customerProfile, address: res.address ?? this.addressForm };
        }
        this.editingAddress  = false;
        this.addressSaving   = false;
        this.snackBar.open('Address updated', 'Close',
          { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.cdr.markForCheck();
      },
      error: () => {
        this.addressSaving = false;
        this.snackBar.open('Address update failed', 'Close',
          { duration: 3000, panelClass: ['error-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.cdr.markForCheck();
      },
    });
  }

  changePassword(): void {
    this.keycloak.getKeycloakInstance().accountManagement();
  }
}
