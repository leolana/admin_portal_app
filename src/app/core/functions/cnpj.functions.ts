import { AbstractControl } from '@angular/forms';

/**
 * original: https://github.com/fnando/cnpj/blob/master/src/cnpj.js
 */


// Blacklist common values.
const BLACKLIST = [
    '00000000000000',
    '11111111111111',
    '22222222222222',
    '33333333333333',
    '44444444444444',
    '55555555555555',
    '66666666666666',
    '77777777777777',
    '88888888888888',
    '99999999999999'
];

function verifierDigit(numbers) {
    let index = 2;
    const reverse = numbers.split('').reduce(function (buffer, number) {
        return [parseInt(number, 10)].concat(buffer);
    }, []);

    const sum = reverse.reduce(function (buffer, number) {
        buffer += number * index;
        index = (index === 9 ? 2 : index + 1);
        return buffer;
    }, 0);

    const mod = sum % 11;
    return (mod < 2 ? 0 : 11 - mod);
}

function format(documento: string): string {
    const onlyDigits = (documento || '').replace(/\D/g, '');
    const formatted = onlyDigits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5');

    if (onlyDigits === formatted) {
        return documento;
    }
    return formatted;
}

function strip(number) {
    return (number || '').toString().replace(/\D/g, '');
}

function isValid(number: string): boolean {
    const stripped = strip(number);

    // CNPJ must be defined
    if (!stripped) { return false; }

    // CNPJ must have 14 chars
    if (stripped.length !== 14) { return false; }

    // CNPJ can't be blacklisted
    if (BLACKLIST.includes(stripped)) { return false; }

    let numbers = stripped.substr(0, 12);
    numbers += verifierDigit(numbers);
    numbers += verifierDigit(numbers);

    return numbers.substr(-2) === stripped.substr(-2);
}

function validator(control: AbstractControl): { [key: string]: any } | null {
    return isValid(control.value) ? null : { cnpj: 'CNPJ Inválido' };
}

export const CnpjFunctions = {
    format,
    isValid,
    validator,
};
