/// <reference types="jasmine" />
import { TransactionClass } from './transaction.model';

declare const expect: <T>(actual: T) => {
  toBe(expected: T): void;
  toBeTruthy(): void;
  toBeFalsy(): void;
  toBeDefined(): void;
  toHaveBeenCalledWith(...args: any[]): void;
  toContain(expected: string): void;
  toBeGreaterThanOrEqual(expected: number): void;
  toEqual(expected: T): void;
};

describe('TransactionClass', () => {
  it('should create an instance', () => {
    const transaction = new TransactionClass(
      '1',
      '12345',
      100,
      'DEBIT',
      'COMPLETED',
      '2022-01-01'
    );

    expect(transaction).toBeTruthy();
  });
});

