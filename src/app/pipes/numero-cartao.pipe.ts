import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'numeroCartao'
})
export class NumeroCartaoPipe implements PipeTransform {
  transform(value: string): string {
    return value.replace(/[X]/g, '*');
  }
}
