import { FormControl, FormGroup } from '@angular/forms';
import { OnInit, Component } from '@angular/core';
import { DominioService } from '../../dominio/dominio.service';
import { AntecipacaoService } from '../antecipacao.service';
import { DateTime } from 'luxon';
import { NotificationService } from '../../core/notification/notification.service';

@Component({
  templateUrl: './pesquisar-antecipacao-fornecedor.component.html',
  styleUrls: ['./pesquisar-antecipacao-fornecedor.component.css'],
})
export class PesquisarAntecipacaoFornecedorComponent implements OnInit {
  constructor(
    private antecipacaoService: AntecipacaoService,
    private dominioService: DominioService,
    private notification: NotificationService,
  ) {}

  // PROPERTIES
  mobile: boolean;
  total;

  combos = {
    bandeiras: [] as any[],
    produtos: [] as any[],
  };

  controls = {
    dataSolicitacaoInicio: new FormControl(null),
    dataSolicitacaoFim: new FormControl(null),
    bandeirasIds: new FormControl(null),
    produtoId: new FormControl(null),
  };

  form = new FormGroup(this.controls);
  table: any[] = [];

  hasError = {
    dataSolicitacaoInicio: () => {
      const dataSolicitacaoInicio = this.form.value.dataSolicitacaoInicio;
      const dataSolicitacaoFim = this.form.value.dataSolicitacaoFim;

      if (
        dataSolicitacaoInicio &&
        dataSolicitacaoFim &&
        dataSolicitacaoInicio > dataSolicitacaoFim
      ) {
        return 'A data final deve ser maior que a data inicial';
      }

      return null;
    },

    dataSolicitacaoFim: () => {
      const dataSolicitacaoInicio = this.form.value.dataSolicitacaoInicio;
      const dataSolicitacaoFim = this.form.value.dataSolicitacaoFim;

      if (
        dataSolicitacaoInicio &&
        dataSolicitacaoFim &&
        dataSolicitacaoInicio > dataSolicitacaoFim
      ) {
        return 'A data final deve ser maior que a data inicial';
      }

      return null;
    },
  };

  // METHODS
  ngOnInit(): void {
    this.solveLayout();
    this.getBandeiras();
    this.getProdutos();
    this.filter();
  }

  getBandeiras() {
    this.dominioService.obterBandeiras().subscribe(arr => {
      this.combos.bandeiras = arr;
    });
  }

  getProdutos() {
    this.antecipacaoService.getComboProdutosAntecipacaoRealizada().subscribe(arr => {
      this.combos.produtos = arr;
    });
  }

  filter(): void {
    const errors = Object.keys(this.hasError)
      .map(key => (this.form.controls[key].markAsDirty(), this.hasError[key]()))
      .filter(error => error);

    if (errors.length) {
      errors.forEach(e => this.notification.showAlertMessage(e));
      return;
    }

    const parameters = this.form.value;

    this.table = [];
    this.antecipacaoService.pesquisarAntecipacoesRealizadas(parameters).subscribe(data => {
      this.table = data;
      this.total = 0;

      this.table.forEach(antecipacao => {
        antecipacao.dataAntecipacaoIso = DateTime.fromISO(antecipacao.dataAntecipacao).toFormat(
          'dd/MM/yyyy',
        );
        antecipacao.dataPagamentoIso = DateTime.fromISO(antecipacao.dataPagamento).toFormat(
          'dd/MM/yyyy',
        );
        this.total += antecipacao.valorAntecipado;
      });
    });
  }

  clearFilter() {
    this.form.reset();
    this.filter();
  }

  solveLayout(): void {
    const checkScreenSize = () => {
      this.mobile = document.body.offsetWidth < 992;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }

  isDebit(antecipacao) {
    return antecipacao.valorSolicitado < 0;
  }
}
