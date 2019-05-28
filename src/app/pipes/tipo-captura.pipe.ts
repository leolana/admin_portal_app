import { Pipe, PipeTransform } from '@angular/core';
import { TiposCaptura } from '../interfaces/credenciamento';

@Pipe({
  name: 'tipoCaptura'
})
export class TipoCapturaPipe implements PipeTransform {
  transform(value: number): string {
    return TiposCaptura.descricoes[value];
  }
}
