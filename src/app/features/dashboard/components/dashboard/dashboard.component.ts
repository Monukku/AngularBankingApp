import { Component } from '@angular/core';
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
import { AccountService } from '../../../accounts/services/account.service';
import { UserService } from '../../../../core/services/user.service';

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
})
export class DashboardComponent {
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

  accountDetails: any;
  userDetails: any;

  constructor(
    private accountService: AccountService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.loadAccountDetails();
    this.loadUserDetails();
  }

  loadAccountDetails() {
    const accountId = this.accountDetails.id;
    this.accountService.fetchAccountDetails(accountId).subscribe((details) => {
      this.accountDetails = details;
    });
  }

  loadUserDetails() {
    this.userService.getUserDetails().subscribe((details) => {
      this.userDetails = details;
    });
  }
}
