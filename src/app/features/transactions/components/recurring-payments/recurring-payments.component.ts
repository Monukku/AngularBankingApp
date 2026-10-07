import { Component, ChangeDetectionStrategy } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recurring-payments',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './recurring-payments.component.html',
  styleUrl: './recurring-payments.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecurringPaymentsComponent {}
