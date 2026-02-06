import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserProfileComponent } from './components/user-profile/user-profile.component';
import { UserProfileRoutingModule } from './user-profile-routing.module';
import { ReactiveFormsModule } from '@angular/forms';
import { UserProfileService } from './services/user-profile.service';
import { HttpClientModule } from '@angular/common/http';
import { KeycloakService } from 'keycloak-angular';
import { AuthGuard } from '../authentication/guards/auth.guard';


@NgModule({
  declarations: [],
  imports: [
    
    UserProfileComponent,
    HttpClientModule,
    CommonModule,
    UserProfileRoutingModule,
    ReactiveFormsModule,
  ],
  providers: [UserProfileService,KeycloakService]
})
export class UserProfileModule { }
