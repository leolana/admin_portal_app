import { Pipe, PipeTransform } from '@angular/core';
import { ITaxaAdministrativa } from '../interfaces/credenciamento';

@Pipe({
  name: 'taxaAdministrativaParcelas'
})
export class TaxaAdministrativaParcelasPipe implements PipeTransform {
  transform(taxa: ITaxaAdministrativa): string {
    return taxa.opcoesParcelamento.minimoParcelas === taxa.opcoesParcelamento.maximoParcelas
      ? 'À vista'
      : `${taxa.opcoesParcelamento.minimoParcelas} até ${taxa.opcoesParcelamento.maximoParcelas}`;
  }
}
