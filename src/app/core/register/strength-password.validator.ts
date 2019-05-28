import { AbstractControl } from '@angular/forms';

export function strengthPasswordValidator(control: AbstractControl): any {
    const val = control.value.trim();

    if (!val) {
        return { required: true };
    }

    if (!/[a-z]/.test(val)) {
        return { lowerCase: true };
    }

    if (!/[A-Z]/.test(val)) {
        return { upperCase: true };
    }

    if (!/[0-9]/.test(val)) {
        return { hasNumber: true };
    }

    if (!/[$@!%*?&]/.test(val)) {
        return { symbols: true };
    }

    if (val.length < 8) {
        return { minLength: true };
    }

    return null;
}
