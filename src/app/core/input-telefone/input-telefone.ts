import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { NumberFunctions } from '../functions/number.functions';

declare const $: any;

@Component({
    selector: 'input-telefone',
    templateUrl: './input-telefone.html'
})
export class InputTelefoneComponent implements AfterViewInit {
    @Input() label: string;
    @Input() id: string;
    @Input() hasError: boolean;
    @Input() control: FormControl;
    @Input() required: boolean;
    @ViewChild('telefone') input: ElementRef;

    masks = {
        telefone: '(00) 0000-00000',
        celular: '(00) 00000-0000',
    };

    ngAfterViewInit() {
        if (this.control.value) {
            this.updateValues(this.control.value);
        }

        this.control.registerOnChange((value) => {
            this.updateValues(value);
        });
    }

    updateValues(value: any) {
        const inputValue = NumberFunctions.removeNonDigits(this.input.nativeElement.value);
        value = NumberFunctions.removeNonDigits(value);

        if (inputValue !== value) {
            this.input.nativeElement.value = value;
        }
        this.updateMask();
    }

    updateMask() {
        const inputValue = NumberFunctions.removeNonDigits(this.input.nativeElement.value);

        if (!this.control.value || this.control.value.length > 9) {
            const mask = this.masks[inputValue.length < 11 ? 'telefone' : 'celular'];
            $(this.input.nativeElement).mask(mask);
        }

        if (this.control.value !== inputValue) {
            this.control.setValue(inputValue);
        }
    }
}
