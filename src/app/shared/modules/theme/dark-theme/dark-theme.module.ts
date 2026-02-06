import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

@NgModule({
  imports: [CommonModule],
  providers: [
    { provide: 'theme', useValue: 'dark' }
  ]
})
export class DarkThemeModule { }
