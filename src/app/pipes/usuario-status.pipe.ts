import { Pipe, PipeTransform } from '@angular/core';
import { UsuarioStatus } from '../interfaces';

@Pipe({
  name: 'usuarioStatus',
})
export class UsuarioStatusPipe implements PipeTransform {
  transform(value: number): string {
    return UsuarioStatus.descricoes[value];
  }
}
