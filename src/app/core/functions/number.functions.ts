import { AbstractControl } from '@angular/forms';

// float functions
function validaFloatNumber(input: any): boolean {
    return regexValidaFloatNumber().test(input);
}
function regexValidaFloatNumber(): RegExp {
    return /^(0|[1-9]\d*)(\.\d{1,2})?$/;
}
function validatorFloatNumber(required: 'required' | 'optional') {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if ((required === 'optional') && !control.value) {
            return null;
        }
        return validaFloatNumber(control.value) ? null : { float: 'Valor Inválido' };
    };
}

// positive integer functions
function validaPositiveIntegerNumber(input: any): boolean {
    return regexValidaPositiveIntegerNumber().test(input);
}
function regexValidaPositiveIntegerNumber(): RegExp {
    return /^[1-9]\d*$/;
}
function validatorPositiveIntegerNumber(required: 'required' | 'optional') {
    return (control: AbstractControl): { [key: string]: any } | null => {
        if ((required === 'optional') && !control.value) {
            return null;
        }
        return validaPositiveIntegerNumber(control.value) ? null : { float: 'Valor Inválido' };
    };
}

function removeNonDigits(input: string): string {
    return String(input).replace(/\D/g, '');
}

export const NumberFunctions = {
    float: {
        regex: regexValidaFloatNumber,
        valida: validaFloatNumber,
        validator: validatorFloatNumber
    },
    positiveInteger: {
        regex: regexValidaPositiveIntegerNumber,
        valida: validaPositiveIntegerNumber,
        validator: validatorPositiveIntegerNumber
    },
    removeNonDigits
};
