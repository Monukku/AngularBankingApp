import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { RouterModule } from '@angular/router';
import { HomeComponent } from '../../../features/home/components/home/home.component'; 
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    HomeComponent,
    CommonModule,
    MatCardModule,
    MatButtonModule,
    RouterModule
  ],
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.scss']
})
export class NotFoundComponent {}
