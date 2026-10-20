import { Injectable, inject } from '@angular/core';
import { Observable, takeUntil, takeWhile, switchMap, timer } from 'rxjs';
import { ApiService, PagedResponse } from '../../../core/services/api.service';
import {
  FINAL_PAYMENT_STATUSES,
  PaymentOrder,
  PaymentOrderRequest,
} from '../models/payment.model';

const CHECKOUT_SCRIPT = 'https://checkout.razorpay.com/v1/checkout.js';

export interface CheckoutResult {
  outcome: 'paid' | 'dismissed' | 'failed';
  message?: string;
}

// Minimal typing for the Razorpay Checkout global
interface RazorpayInstance {
  open(): void;
  on(event: string, handler: (response: any) => void): void;
}
declare const Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;

@Injectable({ providedIn: 'root' })
export class PaymentService {
  private api = inject(ApiService);
  private scriptPromise?: Promise<void>;

  createOrder(data: PaymentOrderRequest, idempotencyKey: string): Observable<PaymentOrder> {
    return this.api.createPaymentOrder(data, idempotencyKey);
  }

  getOrder(id: string): Observable<PaymentOrder> {
    return this.api.getPaymentOrder(id);
  }

  getMyOrders(params?: { page?: number; size?: number }): Observable<PagedResponse<PaymentOrder>> {
    return this.api.getMyPaymentOrders({ sort: 'createdAt,desc', ...params });
  }

  /**
   * Polls the backend until the order reaches a final status or the timeout passes.
   * The Razorpay popup callback only means checkout finished — the webhook decides
   * the real status, so this is the only thing the UI should trust.
   */
  pollUntilFinal(id: string, intervalMs = 2500, timeoutMs = 60000): Observable<PaymentOrder> {
    return timer(0, intervalMs).pipe(
      switchMap(() => this.getOrder(id)),
      takeWhile(order => !FINAL_PAYMENT_STATUSES.includes(order.status), true),
      takeUntil(timer(timeoutMs)),
    );
  }

  /** Lazily loads checkout.js once. */
  loadCheckoutScript(): Promise<void> {
    if (typeof Razorpay !== 'undefined') return Promise.resolve();
    this.scriptPromise ??= new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = CHECKOUT_SCRIPT;
      script.onload = () => resolve();
      script.onerror = () => {
        this.scriptPromise = undefined;
        reject(new Error('Could not load the payment gateway. Check your connection and try again.'));
      };
      document.head.appendChild(script);
    });
    return this.scriptPromise;
  }

  /** Opens the Razorpay popup for an order created by the backend. */
  async openCheckout(
    order: PaymentOrder,
    prefill?: { name?: string; email?: string; contact?: string },
  ): Promise<CheckoutResult> {
    await this.loadCheckoutScript();

    return new Promise<CheckoutResult>(resolve => {
      const rzp = new Razorpay({
        key: order.razorpayKeyId,
        order_id: order.razorpayOrderId,
        amount: Math.round(order.amount * 100),
        currency: order.currency,
        name: 'RewaBank',
        description: 'Add money to account',
        prefill,
        handler: () => resolve({ outcome: 'paid' }),
        modal: { ondismiss: () => resolve({ outcome: 'dismissed' }) },
      });
      rzp.on('payment.failed', (res: any) =>
        resolve({ outcome: 'failed', message: res?.error?.description }),
      );
      rzp.open();
    });
  }
}
