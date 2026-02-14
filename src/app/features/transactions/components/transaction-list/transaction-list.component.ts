// transaction-list.component.ts
import { Component, OnInit } from '@angular/core';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../../../shared/models/transaction.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [CommonModule], // Include CommonModule here
  templateUrl: './transaction-list.component.html',
  styleUrls: ['./transaction-list.component.scss']
})
export class TransactionListComponent implements OnInit {
  transactions: Transaction[] = []; // Initialize the property here

  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {
    this.transactionService.getTransactions().subscribe(transactions => {
      this.transactions = transactions;
    });
  }
}
