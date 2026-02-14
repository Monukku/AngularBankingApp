import { Component, OnInit } from '@angular/core';
import { BeneficiaryService } from '../../services/beneficiary.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Beneficiary } from '../../../../shared/models/beneficiary.model';

@Component({
  selector: 'app-manage-beneficiaries',
  standalone: true,
  imports: [ 
    CommonModule,
    FormsModule  ,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './manage-beneficiaries.component.html',
  styleUrl: './manage-beneficiaries.component.scss'
})
export class ManageBeneficiariesComponent implements OnInit {
  beneficiaries: Beneficiary[] = [];
  newBeneficiary: Beneficiary = { name: '', accountNumber: '' }; // Initialize with empty strings

  constructor(private beneficiaryService: BeneficiaryService) { }

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
}
