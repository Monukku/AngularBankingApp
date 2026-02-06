import { TestBed } from '@angular/core/testing';

import { NumberUtil } from './number.service';

describe('NumberService', () => {
  let service: NumberUtil;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(NumberUtil);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
