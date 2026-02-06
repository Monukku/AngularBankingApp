import { Transaction } from './transaction.model';

describe('Transaction', () => {
  it('should create an instance', () => {
    // Provide sample values for id, amount, and date
    const id = '1';
    const amount = 100;
    const date = '2022-01-01';
    
    // Create an instance of Transaction with the provided values
    const transaction = new Transaction(id, amount, date);
    
    // Verify that the instance is created successfully
    expect(transaction).toBeTruthy();
  });
});
