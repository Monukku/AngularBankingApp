// import { Component } from '@angular/core';

// @Component({
//   selector: 'app-recurring-payments',
//   standalone: true,
//   imports: [],
//   templateUrl: './recurring-payments.component.html',
//   styleUrl: './recurring-payments.component.scss'
// })
// export class RecurringPaymentsComponent {

// }

// recurring-payments.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecurringPayment } from '../../models/RecurringPayment';

@Component({
  selector: 'app-recurring-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './recurring-payments.component.html',
  styleUrl: './recurring-payments.component.scss'
})
export class RecurringPaymentsComponent implements OnInit {
  recurringPayments: RecurringPayment[] = [];
  newPayment: RecurringPayment = {
    payee: '',
    amount: 0,
    frequency: 'monthly',
    startDate: ''
  };
  editIndex: number | null = null;

  constructor() {}

  ngOnInit(): void {}

  addRecurringPayment(): void {
    if (this.editIndex !== null) {
      this.recurringPayments[this.editIndex] = { ...this.newPayment };
      this.editIndex = null;
    } else {
      this.recurringPayments.push({ ...this.newPayment });
    }
    this.resetForm();
  }

  editPayment(index: number): void {
    this.editIndex = index;
    this.newPayment = { ...this.recurringPayments[index] };
  }

  deletePayment(index: number): void {
    this.recurringPayments.splice(index, 1);
    if (this.editIndex === index) {
      this.resetForm();
      this.editIndex = null;
    }
  }

  resetForm(): void {
    this.newPayment = {
      payee: '',
      amount: 0,
      frequency: 'monthly',
      startDate: ''
    };
  }
}
