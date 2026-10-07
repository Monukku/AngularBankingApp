import { Component, OnInit, ChangeDetectionStrategy, inject } from '@angular/core';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Beneficiary } from '../../models/beneficiary.model';

@Component({
  selector: 'app-manage-beneficiaries',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
  ],
  templateUrl: './manage-beneficiaries.component.html',
  styleUrl: './manage-beneficiaries.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ManageBeneficiariesComponent implements OnInit {
  private beneficiaryService = inject(BeneficiaryService);
  private router = inject(Router);

  beneficiaries: Beneficiary[] = [];
  newBeneficiary: Beneficiary = {
    beneficiaryId: '',
    name: '',
    accountNumber: '',
    accountHolderName: '',
    beneficiaryType: 'EXTERNAL',
    verificationStatus: 'PENDING',
    createdAt: new Date()
  };

  constructor() { }

  ngOnInit(): void {
    this.loadBeneficiaries();
  }

  loadBeneficiaries(): void {
    this.beneficiaryService.getBeneficiaries().subscribe((beneficiaries: Beneficiary[]) => {
      this.beneficiaries = beneficiaries;
    });
  }

  addBeneficiary(beneficiary: Beneficiary): void {
    this.beneficiaryService.addBeneficiary(beneficiary).subscribe((newBeneficiary: Beneficiary) => {
      this.beneficiaries.push(newBeneficiary);
    });
  }

  sendMoney(b: Beneficiary): void {
    this.router.navigate(['/transactions/transfer-funds'], {
      queryParams: { toAccount: b.accountNumber, toName: b.name },
    });
  }
}
