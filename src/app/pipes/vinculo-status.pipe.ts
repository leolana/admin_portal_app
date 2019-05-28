import { Pipe, PipeTransform } from '@angular/core';
import { VinculoStatus } from '../interfaces/participante';

@Pipe({
  name: 'vinculoStatus'
})
export class VinculoStatusPipe implements PipeTransform {
  transform(value: number): string {
    return VinculoStatus.descricoes[value];
  }
}
