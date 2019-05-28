import { Pipe, PipeTransform } from '@angular/core';
import { tipoCanalEntrada } from '../interfaces/participante';

@Pipe({
  name: 'tipoCanalEntrada'
})
export class TipoCanalEntradaPipe implements PipeTransform {
  transform(value: number): string {
    return tipoCanalEntrada.descricoes[value];
  }
}
