import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'roleUsuario',
})
export class RoleUsuarioPipe implements PipeTransform {
  transform(value: string): string {
    return value.substring(value.indexOf('-') + 1);
  }
}
