import { TestBed } from '@angular/core/testing';

import { RecurringPaymentService } from './recurring-payment.service';

describe('RecurringPaymentService', () => {
  let service: RecurringPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RecurringPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
