import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat',
  standalone: true,
  pure: true,
})
export class CurrencyFormatPipe implements PipeTransform {
  transform(value: number | null | undefined, currencySymbol = '₹'): string {
    if (value == null) return `${currencySymbol}0.00`;
    return currencySymbol + value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
}
