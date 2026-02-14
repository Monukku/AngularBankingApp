import { Component } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-transfer',
  standalone: true,
  imports: [  
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule
  ],
  templateUrl: './transfer.component.html',
  styleUrl: './transfer.component.scss'
})

export class TransferFundsComponent {
  amount: number = 0; // Initialize with a default value
  fromAccount: string = ''; // Initialize with a default value
  toAccount: string = ''; // Initialize with a default value

  constructor(private transactionService: TransactionService) { }

  transfer(): void {
    this.transactionService.transferFunds(this.fromAccount, this.toAccount, this.amount).subscribe(response => {
      console.log('Funds transferred successfully', response);
    });
  }
}


