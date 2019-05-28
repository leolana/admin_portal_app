import { Pipe, PipeTransform } from '@angular/core';
import { TiposPessoa } from '../interfaces';

@Pipe({
  name: 'tipoPessoa',
})
export class TipoPessoaPipe implements PipeTransform {
  transform(value: number): string {
    return TiposPessoa.descricoes[value];
  }
}
