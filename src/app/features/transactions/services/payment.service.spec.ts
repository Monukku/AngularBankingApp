import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { PaymentService } from './payment.service';
import { ApiService } from '../../../core/services/api.service';
import { PaymentOrder } from '../models/payment.model';

const order = (status: PaymentOrder['status']): PaymentOrder => ({
  id: 'p1', razorpayOrderId: 'order_1', razorpayKeyId: 'rzp_test',
  amount: 100, currency: 'INR', paymentMethod: 'UPI', status, createdAt: '',
});

describe('PaymentService', () => {
  let service: PaymentService;
  let api: { getPaymentOrder: jasmine.Spy; createPaymentOrder: jasmine.Spy; getMyPaymentOrders: jasmine.Spy };

  beforeEach(() => {
    api = {
      getPaymentOrder: jasmine.createSpy('getPaymentOrder'),
      createPaymentOrder: jasmine.createSpy('createPaymentOrder'),
      getMyPaymentOrders: jasmine.createSpy('getMyPaymentOrders'),
    };
    TestBed.configureTestingModule({ providers: [{ provide: ApiService, useValue: api }] });
    service = TestBed.inject(PaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('polls until the order reaches a final status', done => {
    api.getPaymentOrder.and.returnValues(of(order('CREATED')), of(order('COMPLETED')));
    const seen: string[] = [];
    service.pollUntilFinal('p1', 10, 1000).subscribe({
      next: o => seen.push(o.status),
      complete: () => {
        expect(seen).toEqual(['CREATED', 'COMPLETED']);
        done();
      },
    });
  });
});
