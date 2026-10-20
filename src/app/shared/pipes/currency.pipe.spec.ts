import { CurrencyFormatPipe } from './currency.pipe';

describe('CurrencyFormatPipe', () => {
  const pipe = new CurrencyFormatPipe();

  it('create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('formats a number with the rupee symbol', () => {
    expect(pipe.transform(1234.5)).toBe('₹1,234.50');
  });

  it('returns zero for null', () => {
    expect(pipe.transform(null)).toBe('₹0.00');
  });
});
