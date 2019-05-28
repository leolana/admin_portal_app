import { Pipe, PipeTransform } from '@angular/core';
import { CredenciamentoStatus } from '../interfaces/credenciamento';

@Pipe({
  name: 'credenciamentoStatus'
})
export class CredenciamentoStatusPipe implements PipeTransform {
  transform(value: number): string {
    return CredenciamentoStatus.descricoes[value];
  }
}
