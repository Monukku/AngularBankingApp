// import { Injectable } from '@angular/core';
// import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
// import { Observable, from } from 'rxjs';
// import { switchMap } from 'rxjs/operators';
// import { Router } from '@angular/router';
// import { KeycloakService } from 'keycloak-angular';
// @Injectable()
// export class AuthInterceptor implements HttpInterceptor {

//   constructor(private keycloakService: KeycloakService,private router: Router) {}

//   intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
//     return from(this.keycloakService.getToken()).pipe(
//       switchMap(token => {
//         if (token) {
//           req = req.clone({
//             setHeaders: {
//               Authorization: `Bearer ${token}`
//             }
//           });
//         }
//         return next.handle(req);
//       })
//     );
//   }
// }

