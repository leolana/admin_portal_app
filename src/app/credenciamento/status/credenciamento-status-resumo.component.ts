import { Component, Input } from '@angular/core';
import { IParticipante, IBandeira } from 'src/app/interfaces/participante';
import {
  ICaptura,
  ICondicaoComercial,
  ITaxaAdministrativa,
} from 'src/app/interfaces/credenciamento';
import { TiposPessoa } from 'src/app/interfaces';

@Component({
  selector: 'alpe-credenciamento-status-resumo',
  templateUrl: './credenciamento-status-resumo.component.html',
  styleUrls: ['../credenciamento.styles.css'],
})
export class CredenciamentoStatusResumoComponent {
  @Input() dados: IParticipante;
  @Input() captura: ICaptura;
  @Input() condicoesComerciais: ICondicaoComercial;

  tiposPessoa = TiposPessoa;

  obterTaxasAdministrativasPorProduto(produto: IBandeira): ITaxaAdministrativa[] {
    return this.condicoesComerciais.taxasAdministrativas.filter(t => t.bandeira.id === produto.id);
  }

  obterTaxasAdministrativasPeriodos(): ITaxaAdministrativa[] {
    return this.condicoesComerciais.taxasAdministrativas.reduce((accumulator, current) => {
      if (
        !accumulator.some(
          r =>
            r.prazo === current.prazo &&
            r.opcoesParcelamento.minimoParcelas === current.opcoesParcelamento.minimoParcelas &&
            r.opcoesParcelamento.maximoParcelas === current.opcoesParcelamento.maximoParcelas,
        )
      ) {
        accumulator.push(current);
      }
      return accumulator;
    }, []);
  }
}
