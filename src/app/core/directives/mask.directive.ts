import { Directive, ElementRef, Input, OnInit, Optional, forwardRef } from '@angular/core';
import { NgControl, ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

declare const $: any;

@Directive({
    selector: '[oldmask]',
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MaskDirective),
        multi: true
    }]
})
export class MaskDirective implements OnInit, ControlValueAccessor {
    @Input('mask') mask: string;
    @Input('mask-reverse') reverse: string;
    @Input('mask-value') valueType: string;

    constructor(private el: ElementRef) { }

    onChange = (_: any) => { };

    ngOnInit() {
        const options = this.reverse ? { reverse: true } : null;
        const useCleanValue = this.valueType === 'clean';

        $(this.el.nativeElement).mask(this.mask, options).on('change', e => {
            let value = this.el.nativeElement.value;

            if (this.valueType === 'clean') {
                value = $(this.el.nativeElement).cleanVal();
            }

            if (this.valueType === 'numeric') {
                value = +this.el.nativeElement.value.replace(/\./g, '').replace(',', '.');
            }

            this.onChange(value);
        });
    }

    writeValue(inputValue: string): void {
        if (!inputValue) { return; }
        const masked = $(this.el.nativeElement).masked(inputValue);
        $(this.el.nativeElement).val(masked);
    }

    registerOnChange(fn: any): void { this.onChange = fn; }
    registerOnTouched(fn: any): void {}
    setDisabledState(isDisabled: boolean): void {}
}
