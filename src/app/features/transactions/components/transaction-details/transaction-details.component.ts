import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TransactionService } from '../../services/transaction.service';
import { Transaction } from '../../../../shared/models/transaction.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-transaction-details',
  standalone: true,
  imports: [CommonModule], // Include CommonModule here
  templateUrl: './transaction-details.component.html',
  styleUrls: ['./transaction-details.component.scss']
})
export class TransactionDetailsComponent implements OnInit {
  transaction: Transaction = {
    id: '2',
    amount: 0,
    date: ''
  };

  constructor(private route: ActivatedRoute, private transactionService: TransactionService) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadTransactionDetails(id);
    }
  }

  loadTransactionDetails(id: string): void {
    this.transactionService.getTransactionById(id).subscribe(transaction => {
      // this.transaction = transaction;    uncomment it later
    });
  }
}



