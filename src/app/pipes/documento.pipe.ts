import { Pipe, PipeTransform } from '@angular/core';
import { TiposDocumentos } from '../interfaces';

@Pipe({
  name: 'documento'
})
export class DocumentoPipe implements PipeTransform {
  transform(value: string): string {
    return TiposDocumentos.format(value);
  }
}
