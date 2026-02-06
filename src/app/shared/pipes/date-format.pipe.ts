import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat'
})
export class DateFormatPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) {}

  transform(value: any, format: string): string | null {
    if (!value) return null;

    return this.datePipe.transform(value, format) || '';
  }
}
