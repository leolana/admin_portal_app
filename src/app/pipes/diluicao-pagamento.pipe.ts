import { Pipe, PipeTransform } from '@angular/core';
import { CessaoPagamentos } from '../interfaces/cessao';

@Pipe({
  name: 'diluicaoPagamento',
})
export class DiluicaoPagamentoPipe implements PipeTransform {
  transform(value: number): string {
    return CessaoPagamentos.descricoes[value];
  }
}
