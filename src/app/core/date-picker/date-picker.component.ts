import {
  Component, OnChanges, forwardRef, Input, ViewChild, ElementRef,
  ViewEncapsulation, AfterContentInit, OnDestroy, OnInit
} from '@angular/core';
import {
  ControlValueAccessor, NG_VALUE_ACCESSOR, NG_VALIDATORS, FormControl, Validator
} from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material';
import { APP_DATE_FORMATS, AppDateAdapter } from './date-formats';
import * as textMask from 'vanilla-text-mask/dist/vanillaTextMask.js';

@Component({
  selector: 'date-picker',
  templateUrl: './date-picker.component.html',
  styleUrls: ['./date-picker.component.css'],
  providers: [
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => DatePickerComponent), multi: true },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => DatePickerComponent), multi: true },
    { provide: DateAdapter, useClass: AppDateAdapter },
    { provide: MAT_DATE_FORMATS, useValue: APP_DATE_FORMATS },
  ],
  encapsulation: ViewEncapsulation.None
})
export class DatePickerComponent implements OnInit, OnChanges, ControlValueAccessor, Validator, AfterContentInit, OnDestroy {
  mask = [/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]; // dd/MM/yyyy
  maskedInputController;
  maxDate: Date;
  innerValue: Date;

  @ViewChild('DatePickerControl', { read: ElementRef }) inputElement: ElementRef;
  @Input() formControl: FormControl;
  @Input() label = 'Selecione uma data';
  @Input() labelClass?: string;
  @Input() required = false;
  @Input() disable = false;
  @Input() autofocus = false;
  @Input() allowFutureDates = true;
  @Input() hasError = false;
  @Input() dateChanged?: (newDate: Date) => void;
  @Input() id?: string;

  ngOnDestroy() {
    this.maskedInputController.destroy();
  }

  ngOnInit() { }

  ngAfterContentInit(): void {
    setTimeout(() => {
      this.maskedInputController = textMask.maskInput({
        inputElement: this.inputElement.nativeElement,
        mask: this.mask
      });
    });
  }

  onChange: any = (value) => {
    this.formControl.setValue(value);
    this.formControl.updateValueAndValidity();
  }

  onTouched: any = () => { };

  focus() {
    this.inputElement.nativeElement.focus();
  }

  ngOnChanges() {
    this.maxDate = this.allowFutureDates ? null : new Date();
  }

  writeValue(value: any) {
    if (this.formControl.value != value) {
      this.innerValue = value;
      this.formControl.setValue(this.innerValue);
    }
  }

  onDateChange(event) {
    this.onChange(event.value);

    if (typeof this.dateChanged === 'function') {
      this.dateChanged(event.value);
    }
  }

  registerOnChange(fn: (value: any) => void) {
    this.onChange = fn;
  }

  registerOnTouched(fn: any) {
    // this.onTouched = fn;
  }

  validate(control: FormControl) {
    const errors = Object.assign({}, this.formControl.errors || {});
    return Object.keys(errors).length && this.formControl.invalid ? errors : null;
  }

  onBlur(event: any) {
    const value = event.target && event.target.value;
    if (/_/.test(value)) {
      this.inputElement.nativeElement.value = '';
    }

    this.onTouched();
  }
}
