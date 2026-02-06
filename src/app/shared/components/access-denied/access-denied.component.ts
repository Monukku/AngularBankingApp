import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HomeComponent } from '../../../home/components/home/home.component';

@Component({
  selector: 'app-access-denied',
  standalone: true,
  imports: [
    HomeComponent,

    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule,
  ],
  templateUrl: './access-denied.component.html',
  styleUrls: ['./access-denied.component.scss'],
})
export class AccessDeniedComponent {}
