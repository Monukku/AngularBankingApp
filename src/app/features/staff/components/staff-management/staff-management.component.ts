import {
  Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef, inject, signal, HostListener
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ApiService } from '../../../../core/services/api.service';

const ALL_ROLES = ['TELLER', 'RELATIONSHIP_MANAGER', 'CREDIT_OFFICER', 'BRANCH_MANAGER', 'AUDITOR', 'SUPER_ADMIN'];

@Component({
  selector: 'app-staff-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './staff-management.component.html',
  styleUrls: ['./staff-management.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StaffManagementComponent implements OnInit {
  private api      = inject(ApiService);
  private snackBar = inject(MatSnackBar);
  private cdr      = inject(ChangeDetectorRef);

  staffList    = signal<any[]>([]);
  loading      = signal(true);
  actionId     = signal<string | null>(null);

  // Filter
  filterRole   = '';
  filterQuery  = '';

  // Custom dropdown open state
  openDropdown: 'filter' | 'create' | 'roleModal' | null = null;

  @HostListener('document:click')
  closeDropdowns() { this.openDropdown = null; this.cdr.markForCheck(); }

  openHoverDD(name: 'filter' | 'create' | 'roleModal') { this.openDropdown = name; this.cdr.markForCheck(); }
  closeHoverDD() { this.openDropdown = null; this.cdr.markForCheck(); }

  selectFilterRole(role: string) {
    this.filterRole  = role;
    this.openDropdown = null;
    this.cdr.markForCheck();
  }

  selectCreateRole(role: string) {
    this.createForm.role = role;
    this.openDropdown    = null;
    this.cdr.markForCheck();
  }

  selectNewRole(role: string) {
    this.newRole      = role;
    this.openDropdown = null;
    this.cdr.markForCheck();
  }

  // Create modal
  showCreate   = false;
  createForm   = { fullName: '', email: '', role: '', password: '' };
  createLoading = false;
  createError  = '';

  // Role change modal
  roleModal: any = null;
  newRole = '';

  readonly allRoles = ALL_ROLES;

  ngOnInit(): void { this.load(); }

  load(): void {
    this.loading.set(true);
    this.api.getStaffList().subscribe({
      next: (data: any[]) => {
        this.staffList.set(data ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  get filtered(): any[] {
    return this.staffList().filter(s => {
      const roles: string[] = s.roles ?? [];
      const matchRole  = !this.filterRole || roles.includes(this.filterRole);
      const matchQuery = !this.filterQuery ||
        s.fullName?.toLowerCase().includes(this.filterQuery.toLowerCase()) ||
        s.email?.toLowerCase().includes(this.filterQuery.toLowerCase());
      return matchRole && matchQuery;
    });
  }

  openCreate(): void {
    this.createForm = { fullName: '', email: '', role: '', password: '' };
    this.createError = '';
    this.showCreate = true;
  }

  submitCreate(): void {
    if (!this.createForm.fullName || !this.createForm.email || !this.createForm.role || !this.createForm.password) {
      this.createError = 'All fields are required.'; return;
    }
    this.createLoading = true;
    this.createError   = '';
    this.api.createStaff(this.createForm).subscribe({
      next: () => {
        this.snackBar.open(`Staff account created for ${this.createForm.email}`, 'Close',
          { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.showCreate   = false;
        this.createLoading = false;
        this.load();
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        this.createError   = err?.error?.message ?? 'Failed to create staff account.';
        this.createLoading = false;
        this.cdr.markForCheck();
      },
    });
  }

  openRoleModal(staff: any): void {
    this.roleModal = staff;
    this.newRole   = staff.roles?.[0] ?? '';
  }

  confirmRoleChange(): void {
    if (!this.newRole || !this.roleModal) return;
    this.actionId.set(this.roleModal.keycloakUserId);
    this.api.assignStaffRole(this.roleModal.keycloakUserId, this.newRole).subscribe({
      next: () => {
        this.snackBar.open(`Role updated to ${this.newRole}`, 'Close',
          { duration: 3000, panelClass: ['success-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.roleModal = null;
        this.actionId.set(null);
        this.load();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Role update failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.roleModal = null;
        this.actionId.set(null);
      },
    });
  }

  toggleStatus(staff: any): void {
    const enable = !staff.enabled;
    this.actionId.set(staff.keycloakUserId);
    this.api.setStaffStatus(staff.keycloakUserId, enable).subscribe({
      next: () => {
        this.snackBar.open(`Account ${enable ? 'enabled' : 'disabled'}`, 'Close',
          { duration: 3000, panelClass: [enable ? 'success-snackbar' : 'error-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.actionId.set(null);
        this.load();
      },
      error: (err: any) => {
        this.snackBar.open(err?.error?.message ?? 'Status update failed', 'Close',
          { duration: 3500, panelClass: ['error-snackbar'], horizontalPosition: 'end', verticalPosition: 'top' });
        this.actionId.set(null);
      },
    });
  }

  roleBadgeClass(role: string): string {
    const map: Record<string, string> = {
      SUPER_ADMIN: 'super-admin', BRANCH_MANAGER: 'branch-manager',
      TELLER: 'teller', CREDIT_OFFICER: 'credit', RELATIONSHIP_MANAGER: 'rm', AUDITOR: 'auditor',
    };
    return map[role] ?? 'default';
  }
}
