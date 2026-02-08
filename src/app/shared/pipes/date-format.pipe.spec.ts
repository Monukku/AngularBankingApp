import { TestBed } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { DateFormatPipe } from './date-format.pipe';

describe('DateFormatPipe', () => {
  let pipe: DateFormatPipe;
  let datePipe: DatePipe;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [DatePipe],
    });
    datePipe = TestBed.inject(DatePipe);
    pipe = new DateFormatPipe(datePipe);
  });

  it('should create an instance', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format date correctly', () => {
    const testDate = new Date('2024-02-07');
    const result = pipe.transform(testDate);
    expect(result).toBeTruthy();
  });
});
