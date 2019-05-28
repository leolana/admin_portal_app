import { Pipe, PipeTransform } from '@angular/core';
import { ParticipanteIndicacaoStatus } from '../interfaces';

@Pipe({
  name: 'participanteIndicacaoStatus'
})
export class ParticipanteIndicacaoStatusPipe implements PipeTransform {

  transform(value: number): string {
    return ParticipanteIndicacaoStatus.descricoes[value];
  }

}
