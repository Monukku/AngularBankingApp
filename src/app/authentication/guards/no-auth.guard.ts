// import { Injectable, inject } from '@angular/core';
// import { CanActivate, Router } from '@angular/router';
// import { KeycloakService } from 'keycloak-angular';

// @Injectable({
//   providedIn: 'root'
// })
// export class NoAuthGuard implements CanActivate {

//   private keycloakService = inject(KeycloakService);
//   private router = inject(Router);

//   async canActivate(): Promise<boolean> {
//     const isLoggedIn = await this.keycloakService.isLoggedIn();
//     if (isLoggedIn) {
//       this.router.navigate(['/home']);
//       return false;
//     } else {
//       return true;
//     }
//   }
// }


import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { KeycloakService } from 'keycloak-angular';

@Injectable({
  providedIn: 'root',
})
export class NoAuthGuard implements CanActivate {
  
  private keycloakService = inject(KeycloakService);
  private router = inject(Router);

  async canActivate(): Promise<boolean> {
    const isLoggedIn = await this.keycloakService.isLoggedIn();
    if (isLoggedIn) {
      // ✅ Redirect to dashboard if already logged in
      this.router.navigate(['/home']);
      return false;

    }
  
    return true;
  }
}
