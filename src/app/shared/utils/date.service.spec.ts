import { TestBed } from '@angular/core/testing';

import { DateUtil } from './date.service';

describe('DateService', () => {
  let service: DateUtil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateUtil);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
