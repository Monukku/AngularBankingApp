import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencyFormat'
})
export class CurrencyPipe implements PipeTransform {

  transform(value: number, ...args: any[]): string {
    if (!value) return '';
    return '$' + value.toFixed(2);
  }
}
