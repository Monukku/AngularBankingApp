import { NgModule } from '@angular/core';
import { ButtonsModule } from './buttons/buttons.module';
import { FormsModule } from './forms/forms.module';
import { ModalsModule } from './modals/modals.module';

@NgModule({
  imports: [
    ButtonsModule,
    FormsModule,
    ModalsModule
  ],
  exports: [
    ButtonsModule,
    FormsModule,
    ModalsModule
  ]
})
export class UiKitModule { }
