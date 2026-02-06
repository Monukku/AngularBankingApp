// transaction.model.ts
export class Transaction {
  id: string;
  amount: number;
  date: string;
  
  constructor(id: string, amount: number, date: string) {
    this.id = id;
    this.amount = amount;
    this.date = date;
  }
}
