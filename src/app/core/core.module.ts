import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from '../authentication/interceptors/auth.interceptor';
import { HttpErrorInterceptor } from '../authentication/interceptors/error.interceptor';
import { DateUtil } from './utils/date.service'; // Import DateUtil service
import { NumberUtil } from './utils/number.service'; // Import NumberUtil service

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    HttpClientModule
  ],
  providers: [
    // Provide HTTP interceptors
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
    // Provide utility services
    DateUtil,
    NumberUtil
  ]
})
export class CoreModule { }
