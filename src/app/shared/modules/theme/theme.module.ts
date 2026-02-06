import { NgModule } from '@angular/core';
import { LightThemeModule } from './light-theme/light-theme.module';
import { DarkThemeModule } from './dark-theme/dark-theme.module';

@NgModule({
  imports: [
    LightThemeModule,
    DarkThemeModule
  ],
  exports: [
    LightThemeModule,
    DarkThemeModule
  ]
})
export class ThemeModule { }
