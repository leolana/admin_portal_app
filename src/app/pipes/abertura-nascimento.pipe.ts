import { Pipe, PipeTransform } from '@angular/core';
import { AberturaNascimento } from '../interfaces';

@Pipe({
  name: 'aberturaNascimento'
})
export class AberturaNascimentoPipe implements PipeTransform {
  transform(value: number): string {
    return AberturaNascimento.descricoes[value];
  }

}
