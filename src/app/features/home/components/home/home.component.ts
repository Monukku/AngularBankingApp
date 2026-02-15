import { Component, OnInit, HostListener, OnDestroy, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { KeycloakService } from 'keycloak-angular';
import { Subscription } from 'rxjs';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatInputModule,
    MatMenuModule,
    RouterModule,
    MatButtonModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent implements OnInit, OnDestroy {
  navItems = [
    { name: 'Home', link: '/home/home-page', icon: 'home' },
    {
      name: 'Accounts',
      link: '/accounts/account-management',
      icon: 'account_balance',
    },
    { name: 'Loans', link: '/loans/loans-page', icon: 'loan' },
    { name: 'Cards', link: '/cards/cards-page', icon: 'credit_card' },
    { name: 'Transactions', link: '/transactions/list', icon: 'receipt' },
    { name: 'Profile', link: '/profile/user-profile', icon: 'person' },
  ];

  dropdownItems = [
    {
      name: 'Settings',
      subItems: [
        { name: 'Profile', link: '/settings/profile' },
        { name: 'Account Settings', link: '/settings/account' },
        { name: 'Preferences', link: '/settings/preferences' },
      ],
    },
    {
      name: 'More',
      subItems: [
        { name: 'Help', link: '/help' },
        { name: 'Contact Us', link: '/contact' },
      ],
    },
  ];

  cards = [
    { title: 'Account Balance', content: 'Your account balance is $10,000' },
    { title: 'Recent Transactions', content: 'View your recent transactions' },
    { title: 'Loan Status', content: 'Check your loan application status' },
    { title: 'Support', content: 'Contact our support team for assistance' },
  ];

  gridCols: number = 3;
  isAuthenticated: boolean = false;
  private routerSubscription?: Subscription;

  constructor(
    private router: Router,
    private keycloakService: KeycloakService
  ) {}

  @HostListener('window:resize', ['$event'])
  onResize(event: Event) {
    this.setGridCols((event.target as Window).innerWidth);
  }

  async ngOnInit() {
    this.setGridCols(window.innerWidth);
    await this.checkAuthentication();

    // Subscribe to router events to handle navigation
    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.checkAuthentication();
      }
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
  }

  setGridCols(width: number) {
    if (width < 600) {
      this.gridCols = 1;
    } else if (width >= 600 && width < 960) {
      this.gridCols = 2;
    } else {
      this.gridCols = 3;
    }
  }

  async checkAuthentication() {
    try {
      this.isAuthenticated = await this.keycloakService.isLoggedIn();
    } catch (error) {
      console.error('Error checking authentication', error);
      this.isAuthenticated = false; // Fallback in case of error
    }
  }
}
