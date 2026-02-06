import { Component, OnInit } from '@angular/core';
import { LoanService } from '../../service/loan.service'; 
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loan-list',
  standalone: true,
  imports:[
    CommonModule,
    MatCardModule
  ],
  templateUrl: './loan-list.component.html',
  styleUrls: ['./loan-list.component.scss']
})
export class LoanListComponent implements OnInit {
  loans: any[] = [];

  constructor(private loanService: LoanService, private router: Router) { }

  ngOnInit(): void {
    this.loanService.getLoans().subscribe(loans => {
      this.loans = loans;
    });
  }

  viewLoan(id: string) {
    this.router.navigate(['/loans', id]);
  }

  editLoan(id: string) {
    this.router.navigate(['/loans', id, 'edit']);
  }

  deleteLoan(id: string) {
    this.loanService.deleteLoan(id).subscribe(() => {
      this.loans = this.loans.filter(loan => loan.id !== id);
    });
  }
}
