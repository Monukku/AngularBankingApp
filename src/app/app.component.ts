import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './shared/components/sidebar/sidebar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { NotificationComponent } from './shared/components/notification/notification.component';
import { CommonModule } from '@angular/common';
import { SharedModule } from './shared/shared.module';
import { HeaderComponent } from './shared/components/header/header.component';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    HeaderComponent,
    SidebarComponent,
    FooterComponent,
    NotificationComponent,
    SharedModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'banking-app';
}
