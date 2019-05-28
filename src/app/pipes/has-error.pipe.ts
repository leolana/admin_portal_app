import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'hasError',
  pure: false,
})
export class HasErrorPipe implements PipeTransform {
  transform(ctrl: any, controlName: string = null): boolean {
    if (controlName) {
      ctrl = ctrl.controls[controlName];
    }
    return ctrl.invalid && (ctrl.dirty || ctrl.touched);
  }
}
