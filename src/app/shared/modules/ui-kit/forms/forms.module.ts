import { NgModule } from '@angular/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  exports: [
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule
  ]
})
export class FormsModule { }
