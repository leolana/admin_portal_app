import { Pipe, PipeTransform } from '@angular/core';
import { TiposDocumentos } from '../interfaces';

@Pipe({
  name: 'tipoDocumento'
})
export class TipoDocumentoPipe implements PipeTransform {
  transform(value: number): string {
    return TiposDocumentos.descricoes[value];
  }
}
