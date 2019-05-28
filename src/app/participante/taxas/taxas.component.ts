import { Component, OnInit } from '@angular/core';
import { ParticipanteService } from '../participante.service';
import { TiposPessoa } from 'src/app/interfaces';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  styleUrls: ['../participante.styles.css'],
  templateUrl: './taxas.component.html',
})
export class ParticipanteTaxasComponent implements OnInit {
  constructor(private participanteService: ParticipanteService) {}
  dados: any;
  tiposPessoa = TiposPessoa;

  ngOnInit(): void {
    this.getCondicoesComerciais();
  }

  getCondicoesComerciais() {
    this.participanteService
      .getCondicoesComerciais()
      .pipe(
        catchError(data => {
          this.dados = {};
          return of(data);
        }),
      )
      .subscribe(taxas => {
        this.dados = taxas;
      });
  }

  obterTaxasAdministrativasPorProduto(produto) {
    return this.ordenandoPorParcela(this.dados.condicoesComerciais.taxasAdministrativas).filter(
      t => t.bandeira.id === produto.id,
    );
  }

  obterTaxasAdministrativasPorProdutoEPeriodo(produto, periodo) {
    return this.ordenandoPorParcela(this.dados.condicoesComerciais.taxasAdministrativas).filter(
      t =>
        t.bandeira.id === produto.id &&
        t.opcoesParcelamento.minimoParcelas === periodo.opcoesParcelamento.minimoParcelas &&
        t.opcoesParcelamento.maximoParcelas === periodo.opcoesParcelamento.maximoParcelas,
    );
  }

  obterTaxasAdministrativasPeriodos() {
    const taxas = this.dados.condicoesComerciais.taxasAdministrativas.reduce(
      (accumulator, current) => {
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
      },
      [],
    );
    return this.ordenandoPorParcela(taxas);
  }

  ordenandoPorParcela(arr) {
    return arr.sort(
      (a, b) => a.opcoesParcelamento.minimoParcelas - b.opcoesParcelamento.minimoParcelas,
    );
  }
}
