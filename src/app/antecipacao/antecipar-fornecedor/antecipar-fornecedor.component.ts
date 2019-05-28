import { OnInit, Component } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NotificationService } from '../../core/notification/notification.service';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { DominioService } from '../../dominio/dominio.service';
import { AntecipacaoService } from '../antecipacao.service';
import { IRecebivel } from '../../interfaces/recebivel';
import { IdText } from '../../interfaces';
import { tags } from 'src/app/core/tags';

interface ViewModelRecebivel extends IRecebivel {
  selecionado?: boolean;
  bandeira?: { id: number; nome: string };
  evento?: { id: number; nome: string };
}

@Component({
  templateUrl: './antecipar-fornecedor.component.html',
  styleUrls: ['./antecipar-fornecedor.component.css'],
})
export class AnteciparFornecedorComponent implements OnInit {
  constructor(
    private antecipacaoService: AntecipacaoService,
    private dominioService: DominioService,
    private toastr: NotificationService,
    private prompt: PromptService,
  ) {}

  // PROPERTIES
  mobile: boolean;
  table: ViewModelRecebivel[] = [];
  limitHour: string;
  isChecked: boolean;

  totais = {
    descontoAntecipacao: 0 as number,
    valorAntecipado: 0 as number,
  };

  combos = {
    meses: [] as IdText[],
    bandeiras: [] as any[],
    produtos: [] as any[],
  };

  controls = {
    mes: new FormControl(null),
    bandeirasId: new FormControl(null),
    produtoId: new FormControl(null),
  };
  form = new FormGroup(this.controls);

  // METHODS
  ngOnInit(): void {
    this.isChecked = true;
    this.solveLayout();

    this.getBandeiras();
    this.getProdutos();
    this.getComboMeses();
    this.getLimitHour();

    this.filter();
  }

  calculateTotal() {
    this.totais.descontoAntecipacao = 0;
    this.totais.valorAntecipado = 0;
    this.table.forEach(t => {
      this.totais.descontoAntecipacao += t.descontoAntecipacao;
      this.totais.valorAntecipado += t.valorAntecipado;
    });
  }

  getComboMeses() {
    this.antecipacaoService.getComboMeses().subscribe(arr => (this.combos.meses = arr));
  }

  getBandeiras() {
    this.dominioService.obterBandeiras().subscribe(arr => (this.combos.bandeiras = arr));
  }

  getProdutos() {
    this.antecipacaoService.getComboProdutos().subscribe(arr => {
      this.combos.produtos = arr;
    });
  }

  getLimitHour() {
    this.antecipacaoService.getLimitHour().subscribe(hour => {
      this.limitHour = hour.hora;
    });
  }

  filter(): void {
    const parameters = this.form.value;

    this.table = [];
    this.antecipacaoService.pesquisarRecebiveisParaAntecipacao(parameters).subscribe(arr => {
      this.table = arr;
      this.table.forEach(item => (!this.isDebit(item) ? (item.selecionado = true) : null));
      this.calculateTotal();
    });
  }

  reset() {
    this.form.reset();
    this.filter();
  }

  valorDisponivelNegativo() {
    const val = this.table.reduce((acc, item) => {
      return acc + (item.valorPagar < 0 ? item.valorPagar : 0);
    }, 0);
    return val;
  }

  valorDisponivel(): number {
    const val = this.table.reduce((acc, item) => {
      return acc + item.valorPagar;
    }, 0);
    return val;
  }

  valorSaldo(): number {
    const val = this.table.reduce((acc, item) => {
      return acc + (item.valorPagar > 0 ? item.valorPagar : 0);
    }, 0);
    return val;
  }

  valorSolicitado(): number {
    const val = this.table.reduce((acc, item) => {
      return acc + (item.selecionado ? item.valorPagar : 0);
    }, 0);
    return val;
  }

  valorDescontado(): number {
    const val = this.table.reduce((acc, item) => {
      return acc + (item.selecionado ? item.descontoAntecipacao : 0);
    }, 0);
    return val;
  }

  valorAntecipado(): number {
    return this.valorSolicitado() + this.valorDisponivelNegativo() - this.valorDescontado();
  }
  checkAll(): void {
    const tableData = this.table;
    this.table = [];
    tableData.forEach(item => {
      if (!this.isDebit(item)) {
        item.selecionado = this.isChecked;
      }
    });
    this.table = tableData;
  }
  solicitar(): void {
    if (this.invalidWeekDay()) {
      this.toastr.showErrorMessage(tags['anticipation-blocked-day']);
      return;
    }
    if (this.invalidHour()) {
      this.toastr.showErrorMessage(tags['anticipation-time-limit-exceeded']);
      return;
    }

    const selecionados = this.table.filter(row => row.selecionado || row.valorPagar < 0);
    if (!selecionados.length) {
      this.toastr.showAlertMessage('Selecione ao menos um Recebível para Efetuar Solicitação.');
      return;
    }

    if (this.valorAntecipado() < 0) {
      this.toastr.showAlertMessage('O valor Antecipado não pode ser negativo');
      return;
    }

    this.antecipacaoService.anteciparRecebiveis(selecionados.map(s => s.rowId)).subscribe(x => {
      this.toastr.showSuccessMessage('Antecipação solicitada com sucesso.');
      this.prompt.inform(
        'O pagamento da antecipação será realizada no domicilio bancário cadastrado na Alpe.',
        'Antecipação solicitada com sucesso',
      );
      this.table = [];
    });
  }

  invalidHour() {
    const now = new Date();
    const hour = `0${now.getHours()}`.slice(-2);
    const min = `0${now.getMinutes()}`.slice(-2);
    const current = `${hour}:${min}`;

    return current >= this.limitHour;
  }

  invalidWeekDay() {
    const blockedDays = {
      0: 'sunday',
      6: 'saturday',
    };

    return new Date().getDay() in blockedDays;
  }

  isDebit(recebivel) {
    return recebivel.valorPagar < 0;
  }

  solveLayout(): void {
    const checkScreenSize = () => {
      this.mobile = document.body.offsetWidth < 992;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }
}
