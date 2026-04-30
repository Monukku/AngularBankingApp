import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { KeycloakService } from 'keycloak-angular';
import { trigger, transition, style, animate, query, stagger } from '@angular/animations';

@Component({
  selector: 'app-landing',
  standalone: true,
  imports: [CommonModule, RouterModule, MatButtonModule, MatIconModule],
  templateUrl: './landing.component.html',
  styleUrls: ['./landing.component.scss'],
  animations: [
    trigger('fadeDown', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-16px)' }),
        animate('0.6s cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('fadeUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.6s 0.1s cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerCards', [
      transition(':enter', [
        query('.feature-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(60, [
            animate('0.45s cubic-bezier(0.16,1,0.3,1)', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ])
  ]
})
export class LandingComponent {
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);

  features = [
    { icon: 'security',      title: 'Bank-Grade Security',  description: 'Military-grade encryption 24/7.' },
    { icon: 'speed',         title: 'Lightning Fast',       description: 'Instant transfers, real-time updates.' },
    { icon: 'public',        title: 'Global Access',        description: 'Send money across 15+ countries.' },
    { icon: 'support_agent', title: '24/7 Support',         description: 'Expert help any hour of the day.' },
    { icon: 'savings',       title: 'Smart Savings',        description: 'Save automatically without effort.' },
    { icon: 'trending_up',   title: 'Investments',          description: 'Grow wealth with smart options.' },
  ];

  stats = [
    { number: '50K+', label: 'Active Users' },
    { number: '15+',  label: 'Countries' },
    { number: '100%', label: 'Uptime SLA' },
  ];

  async login(): Promise<void> {
    try {
      await this.keycloakService.login({ redirectUri: window.location.origin + '/dashboard' });
    } catch {
      this.router.navigate(['/dashboard']);
    }
  }
}
