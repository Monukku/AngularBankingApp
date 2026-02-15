import { Component, ChangeDetectionStrategy, inject, DestroyRef, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { AccountDetails } from '../../../accounts/models/accounts-details.model';
import { AccountService } from '../../../accounts/services/account.service';
import { UserService } from '../../../../core/services/user.service';
import { take } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    MatToolbarModule,
    CommonModule,
    MatSidenavModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private accountService = inject(AccountService);
  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef);

  navItems = ['Home', 'Profile', 'Settings'];
  cards = [
    {
      title: 'Card 1',
      content: 'Content 1',
      subtitle: 'Subtitle 1',
      image: 'image1.jpg',
    },
    {
      title: 'Card 2',
      content: 'Content 2',
      subtitle: 'Subtitle 2',
      image: 'image2.jpg',
    },
    {
      title: 'Card 3',
      content: 'Content 3',
      subtitle: 'Subtitle 3',
      image: 'image3.jpg',
    },
    {
      title: 'Card 4',
      content: 'Content 4',
      subtitle: 'Subtitle 4',
      image: 'image4.jpg',
    },
  ];

  accountDetails: AccountDetails | null = null;
  userDetails: any = null;

  ngOnInit(): void {
    this.loadAccountDetails();
    this.loadUserDetails();
  }

  private loadAccountDetails(): void {
    // Get account ID from route params or use default
    const accountId = this.route.snapshot.queryParamMap.get('accountId') || 'default';
    
    this.accountService.fetchAccountDetails(accountId)
      .pipe(
        take(1),  // Complete after first value
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (details) => {
          this.accountDetails = details;
        },
        error: (err) => {
          console.error('Failed to load account details:', err);
          this.accountDetails = null;
        }
      });
  }

  private loadUserDetails(): void {
    this.userService.getUserDetails()
      .pipe(
        take(1),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (details) => {
          this.userDetails = details;
        },
        error: (err) => {
          console.error('Failed to load user details:', err);
          this.userDetails = null;
        }
      });
  }
}
