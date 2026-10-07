import { Component, OnInit, OnDestroy, inject, PLATFORM_ID, NgZone, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FooterComponent } from '../../../../shared/components/footer/footer.component';
import { KeycloakService } from 'keycloak-angular';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, FooterComponent],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingComponent implements OnInit, OnDestroy {
  private keycloakService = inject(KeycloakService);
  private router        = inject(Router);
  private platformId    = inject(PLATFORM_ID);
  private ngZone        = inject(NgZone);
  private cdr           = inject(ChangeDetectorRef);
  private twTimer: ReturnType<typeof setInterval> | null = null;
  private twInner: ReturnType<typeof setTimeout>  | null = null;

  readonly twLines = [
    'Zero-fee transfers, instantly.',
    'Earn 8.1% on Fixed Deposits.',
    'Smart savings, auto-invested.',
    'Bank anywhere, anytime.',
    'Your money, fully protected.',
  ];
  twIndex = 0;
  twFade  = false;

  stats = [
    { number: '50K+', label: 'ACTIVE USERS' },
    { number: '15+',  label: 'COUNTRIES' },
    { number: '100%', label: 'UPTIME SLA' },
  ];

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    // Run entirely outside Angular zone so Zone.js never sees these timers
    this.ngZone.runOutsideAngular(() => {
      this.twTimer = setInterval(() => {
        this.twFade = true;
        this.cdr.markForCheck();

        this.twInner = setTimeout(() => {
          this.twIndex = (this.twIndex + 1) % this.twLines.length;
          this.twFade  = false;
          this.cdr.markForCheck();
        }, 400);
      }, 3000);
    });
  }

  ngOnDestroy(): void {
    if (this.twTimer)  clearInterval(this.twTimer);
    if (this.twInner)  clearTimeout(this.twInner);
  }

  async login(): Promise<void> {
    try {
      await this.keycloakService.login({ redirectUri: window.location.origin + '/dashboard' });
    } catch {
      this.router.navigate(['/dashboard']);
    }
  }
}
