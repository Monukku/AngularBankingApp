import { Component, OnInit, HostListener, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { KycService } from '../../services/kyc.service';
import { DocumentType } from '../../models/kyc.model';
import { NotificationService } from '../../../../core/services/notification.service';
import { UserService } from '../../../../core/services/user.service';

type WizardStep = 'personal' | 'identity' | 'address' | 'review' | 'done';
type KycStatus = 'NOT_SUBMITTED' | 'SUBMITTED' | 'UNDER_REVIEW' | 'VERIFIED' | 'REJECTED';

interface UploadedDoc {
  documentType: DocumentType;
  fileName: string;
  status: string;
}

const STATES = [
  'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
  'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
  'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
  'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
  'Uttarakhand','West Bengal','Delhi','Chandigarh','Puducherry',
];

const ID_TYPES = [
  { value: 'AADHAAR', label: 'Aadhaar Card' },
  { value: 'PAN', label: 'PAN Card' },
  { value: 'PASSPORT', label: 'Passport' },
  { value: 'VOTER_ID', label: 'Voter ID' },
  { value: 'DRIVING_LICENSE', label: "Driver's License" },
];

@Component({
  selector: 'app-kyc-submission',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule, FormsModule],
  templateUrl: './kyc-submission.component.html',
  styleUrl: './kyc-submission.component.scss',
})
export class KycSubmissionComponent implements OnInit {
  private fb = inject(FormBuilder);
  private kycService = inject(KycService);
  private notifications = inject(NotificationService);
  private userService = inject(UserService);

  readonly STATES = STATES;
  readonly ID_TYPES = ID_TYPES;

  step = signal<WizardStep>('personal');
  existingKycStatus = signal<KycStatus | null>(null);
  statusLoading = signal(true);
  readonly todayDate = new Date().toISOString().split('T')[0];
  submitting = signal(false);
  uploadingDoc = signal(false);
  uploadedDocs = signal<UploadedDoc[]>([]);
  consentChecked = false;

  readonly UPLOAD_SLOTS: { type: DocumentType; label: string; icon: string }[] = [
    { type: 'AADHAAR_FRONT', label: 'ID front',  icon: 'id' },
    { type: 'AADHAAR_BACK',  label: 'ID back',   icon: 'id' },
    { type: 'SELFIE',        label: 'Selfie',     icon: 'selfie' },
  ];

  readonly REQUIRED_DOCS: { type: DocumentType; label: string }[] = [
    { type: 'AADHAAR_FRONT', label: 'Aadhaar Front' },
    { type: 'AADHAAR_BACK',  label: 'Aadhaar Back' },
    { type: 'PAN_CARD',      label: 'PAN Card' },
    { type: 'SELFIE',        label: 'Selfie / Live Photo' },
  ];

  // Step 1 — Personal
  personalForm: FormGroup = this.fb.group({
    fullName:    ['', Validators.required],
    dateOfBirth: ['', Validators.required],
    gender:      ['', Validators.required],
    nationality: ['India', Validators.required],
  });

  // Step 2 — Identity
  identityForm: FormGroup = this.fb.group({
    aadhaarNumber: ['', [Validators.required, Validators.pattern(/^[2-9]{1}[0-9]{11}$/)]],
    panNumber:     ['', [Validators.required, Validators.pattern(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)]],
  });

  // Step 3 — Address
  addressForm: FormGroup = this.fb.group({
    addressLine1: ['', Validators.required],
    addressLine2: [''],
    city:         ['', Validators.required],
    state:        ['', Validators.required],
    pincode:      ['', [Validators.required, Validators.pattern(/^[1-9][0-9]{5}$/)]],
  });

  readonly stepIndex = computed(() => {
    const map: Record<WizardStep, number> = { personal: 0, identity: 1, address: 2, review: 3, done: 4 };
    return map[this.step()];
  });

  readonly steps = ['Personal', 'Identity', 'Address', 'Review'];

  readonly genderOptions = [
    { value: 'MALE', label: 'Male' },
    { value: 'FEMALE', label: 'Female' },
    { value: 'OTHER', label: 'Other' },
    { value: 'PREFER_NOT_TO_SAY', label: 'Prefer not to say' },
  ];
  readonly nationalityOptions = ['India', 'Other'];

  openDropdown: 'gender' | 'nationality' | 'state' | null = null;

  @HostListener('document:click')
  onDocumentClick(): void { this.openDropdown = null; }

  openHoverDD(name: 'gender' | 'nationality' | 'state') { this.openDropdown = name; }
  closeHoverDD() { this.openDropdown = null; }

  selectGender(v: string) { this.personalForm.get('gender')?.setValue(v); this.openDropdown = null; }
  selectNationality(v: string) { this.personalForm.get('nationality')?.setValue(v); this.openDropdown = null; }
  selectState(v: string) { this.addressForm.get('state')?.setValue(v); this.openDropdown = null; }

  get genderLabel(): string {
    const v = this.personalForm.get('gender')?.value;
    return this.genderOptions.find(o => o.value === v)?.label ?? 'Select…';
  }

  ngOnInit(): void {
    this.userService.getCustomerProfile().subscribe({
      next: (profile) => {
        const status = profile?.kycStatus as KycStatus ?? null;
        this.existingKycStatus.set(status);
        this.statusLoading.set(false);
        if (status === 'SUBMITTED' || status === 'UNDER_REVIEW' || status === 'VERIFIED') {
          this.step.set('done');
        }
      },
      error: () => this.statusLoading.set(false),
    });
  }

  goBack(): void {
    const prev: Record<string, WizardStep> = {
      identity: 'personal', address: 'identity', review: 'address',
    };
    const cur = this.step();
    if (prev[cur]) this.step.set(prev[cur]);
  }

  continuePersonal(): void {
    if (this.personalForm.invalid) { this.personalForm.markAllAsTouched(); return; }
    this.step.set('identity');
  }

  continueIdentity(): void {
    if (this.identityForm.invalid) { this.identityForm.markAllAsTouched(); return; }
    this.step.set('address');
  }

  continueAddress(): void {
    if (this.addressForm.invalid) { this.addressForm.markAllAsTouched(); return; }
    this.step.set('review');
  }

  submitAll(): void {
    const p = this.personalForm.value;
    const id = this.identityForm.value;
    const a = this.addressForm.value;

    // Map to the backend payload shape
    const payload: any = {
      aadhaarNumber: id.aadhaarNumber,
      panNumber:     id.panNumber.toUpperCase(),
      dateOfBirth:   p.dateOfBirth,
      address: {
        addressLine1: a.addressLine1,
        addressLine2: a.addressLine2 || undefined,
        city: a.city,
        state: a.state,
        pincode: a.pincode,
      },
    };

    this.submitting.set(true);
    this.kycService.submitKyc(payload).subscribe({
      next: (res) => {
        this.submitting.set(false);
        this.userService.invalidateCache();
        this.notifications.success(res.message ?? 'KYC submitted successfully.');
        this.step.set('done');
        this.existingKycStatus.set('SUBMITTED');
      },
      error: (err) => {
        this.submitting.set(false);
        this.notifications.error(err?.message ?? 'Failed to submit KYC.');
      },
    });
  }

  onFileSelected(event: Event, documentType: DocumentType): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      this.notifications.error('File must be under 5 MB.');
      input.value = '';
      return;
    }
    this.uploadingDoc.set(true);
    this.kycService.uploadDocument(documentType, file).subscribe({
      next: (res) => {
        this.uploadingDoc.set(false);
        this.uploadedDocs.update((docs) => {
          const filtered = docs.filter((d) => d.documentType !== documentType);
          return [...filtered, { documentType, fileName: file.name, status: res.status }];
        });
        this.notifications.success(`${documentType.replace(/_/g, ' ')} uploaded.`);
        input.value = '';
      },
      error: (err) => {
        this.uploadingDoc.set(false);
        this.notifications.error(err?.message ?? 'Upload failed.');
        input.value = '';
      },
    });
  }

  isDocUploaded(type: DocumentType): boolean {
    return this.uploadedDocs().some((d) => d.documentType === type);
  }

  allRequiredUploaded(): boolean {
    return this.REQUIRED_DOCS.every((d) => this.isDocUploaded(d.type));
  }

  hasError(form: FormGroup, field: string, error: string): boolean {
    const ctrl = form.get(field);
    return !!(ctrl?.touched && ctrl.hasError(error));
  }

  idTypeLabel(): string { return ''; }
}
