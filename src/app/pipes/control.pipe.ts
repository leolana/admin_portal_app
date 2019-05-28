import { Pipe, PipeTransform } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';

@Pipe({
    name: 'control'
})
export class ControlPipe implements PipeTransform {
    transform(group: FormGroup, controlName: string): AbstractControl {
        return group.controls[controlName];
    }
}
