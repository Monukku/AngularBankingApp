import { Transaction, TransactionClass } from './transaction.model';

describe('Transaction', () => {
  it('should create an instance from the legacy class', () => {
    const transaction: Transaction = new TransactionClass(
      '1', 'ACC123', 100, 'DEPOSIT', 'COMPLETED', '2022-01-01',
    );

    expect(transaction.id).toBe('1');
    expect(transaction.amount).toBe(100);
    expect(transaction.transactionType).toBe('DEPOSIT');
  });
});
