import { Injectable, inject, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

/** Open/closed state of the slide-in sidebar on phones (≤768px). */
@Injectable({ providedIn: 'root' })
export class MobileNavService {
  readonly open = signal(false);

  constructor() {
    inject(Router).events
      .pipe(filter(e => e instanceof NavigationEnd))
      .subscribe(() => this.close());
  }

  toggle(): void { this.open.update(v => !v); }
  close(): void  { this.open.set(false); }
}
