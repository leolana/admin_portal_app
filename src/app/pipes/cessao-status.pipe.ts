import { Pipe, PipeTransform } from '@angular/core';
import { CessaoStatus } from '../interfaces/cessao';

@Pipe({
  name: 'cessaoStatus'
})
export class CessaoStatusPipe implements PipeTransform {
  transform(value: number): string {
    return CessaoStatus.descricoes[value];
  }
}
