import { NgModule } from '@angular/core';
import { DatePickerComponent } from './date-picker.component';
import { TextMaskModule } from 'angular2-text-mask';
import {
  MatDatepickerModule,
  MatFormFieldModule,
  MatNativeDateModule,
  MatInputModule,
} from '@angular/material';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    ReactiveFormsModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatInputModule,
    TextMaskModule,
  ],
  declarations: [DatePickerComponent],
  exports: [DatePickerComponent],
})
export class DatePickerModule {}
