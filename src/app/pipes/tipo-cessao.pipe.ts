import { Pipe, PipeTransform } from '@angular/core';
import { CessaoOperacoes } from '../interfaces/cessao';

@Pipe({
  name: 'tipoCessao',
})
export class TipoCessaoPipe implements PipeTransform {
  transform(value: number): string {
    return CessaoOperacoes.descricoes[value];
  }
}

@Pipe({
  name: 'tipoCessaoEC',
})
export class TipoCessaoECPipe implements PipeTransform {
  transform(value: number): string {
    return CessaoOperacoes.descricoesEC[value];
  }
}
