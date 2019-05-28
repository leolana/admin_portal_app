import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'telefone'
})
export class TelefonePipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/^(..)?(.....?)(....)$/, '($1) $2-$3');
  }
}
