import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { StatusPagamentoFinanceiro } from '../../interfaces/securitizacao';
import { RelatoriosService } from '../relatorios.service';
import { NotificationService } from '../../core/notification/notification.service';
import { DateTime } from 'luxon';
import { TiposDocumentos } from '../../interfaces';
import { Datatable } from '../../core/datatable/datatable.interface';
import { NumeroCartaoPipe } from '../../pipes/numero-cartao.pipe';

@Component({
  templateUrl: './extrato-detalhado.component.html',
  styleUrls: ['./extrato-detalhado.component.css'],
})
export class ExtratoDetalhadoComponent implements OnInit {
  constructor(private service: RelatoriosService, private notification: NotificationService) {}

  razaoSocial: string;
  nomeFantasia: string;
  ehEstabelecimento: boolean;
  documento: string;
  codigoParticipante: number;
  currentDate = DateTime.local().toISO();
  tableData: any[] = [];
  allData: any[] = [];

  get data() {
    return this.tableData;
  }

  set data(values: any[]) {
    this.tableData = values;
    if (this.detalheDatatable) {
      this.detalheDatatable.updateData(values);
    }
  }

  detalheDatatable: Datatable<any> = null;

  user: any[];

  bandeiras: { [id: number]: string } = {
    0: 'Todas',
  };
  modalidade: { [id: number]: string } = {
    0: 'Todos',
  };

  statusPagamento: { [id: string]: string } = {
    '0': 'Todos',
  };

  mobile: boolean;

  form = {
    dataVendaInicial: new FormControl(''),
    dataVendaFinal: new FormControl(''),
    dataPagamentoInicial: new FormControl(''),
    dataPagamentoFinal: new FormControl(''),
    bandeira: new FormControl(''),
    statusPagamento: new FormControl(''),
    modalidade: new FormControl(''),
    terminal: new FormControl(''),
  };
  formExtratoDetalhado = new FormGroup(this.form);

  ngOnInit(): void {
    this.solveLayout();

    this.statusPagamento = StatusPagamentoFinanceiro.descricoes;

    this.getExtratoDetalhado();
    this.getBandeiras();
    this.getTiposOperacao();

    const [_, type] = location.href.match(
      /(estabelecimento|fornecedor)\/relatorio\/extratodetalhado$/,
    );
    this.user = [type];
    this.ehEstabelecimento = type === 'estabelecimento';
  }

  getBandeiras(): void {
    this.service.getFinanceiroBandeiras().subscribe(result => {
      result.forEach(bandeira => {
        this.bandeiras[bandeira.id] = bandeira.descricao;
      });
    });
  }

  getTiposOperacao(): void {
    this.service.getFinanceiroTiposOperacao().subscribe(result => {
      result.forEach(operacao => {
        this.modalidade[operacao.id] = operacao.descricao;
      });
    });
  }

  getExtratoDetalhado(filters?: any): void {
    this.data = [];
    this.service.getExtratoDetalhado(filters).subscribe(result => {
      if (!filters) this.allData = result;
      this.razaoSocial = result.razaoSocial;
      this.nomeFantasia = result.nomeFantasia;
      this.documento = result.documento;
      this.codigoParticipante = result.id;

      result.data.forEach(row => {
        row.cartao = new NumeroCartaoPipe().transform(row.cartao);
      });
      this.data = result.data;
    });
  }

  ConsultarExtratoDetalhado() {
    const dataVendaInicial = this.form.dataVendaInicial.value;
    const dataVendaFinal = this.form.dataVendaFinal.value;
    const dataPagamentoInicial = this.form.dataPagamentoInicial.value;
    const dataPagamentoFinal = this.form.dataPagamentoFinal.value;

    if (dataVendaInicial && !dataVendaFinal) {
      this.notification.showAlertMessage('Data de Venda Final não pode estar em branco.');
      return;
    }

    if (dataVendaFinal && !dataVendaInicial) {
      this.notification.showAlertMessage('Data de Venda Inicial não pode estar em branco.');
      return;
    }

    if (dataPagamentoInicial && !dataPagamentoFinal) {
      this.notification.showAlertMessage('Data de Pagamento Final não pode estar em branco.');
      return;
    }

    if (dataPagamentoFinal && !dataPagamentoInicial) {
      this.notification.showAlertMessage('Data de Pagamento Inicial não pode estar em branco.');
      return;
    }

    if (dataVendaInicial > new Date()) {
      this.notification.showAlertMessage('A data da venda não pode ser maior que a data atual');
      return;
    }

    if (dataVendaFinal < dataVendaInicial || dataPagamentoFinal < dataPagamentoInicial) {
      this.notification.showAlertMessage('Data Final não pode ser menor que a Data Inicial');
      return;
    }

    const filters: any = {};

    if (dataVendaInicial) {
      filters.dataVendaInicial = DateTime.fromJSDate(dataVendaInicial).toISODate();
    }

    if (dataVendaFinal) {
      filters.dataVendaFinal = DateTime.fromJSDate(dataVendaFinal).toISODate();
    }

    if (dataPagamentoInicial) {
      filters.dataPagamentoInicial = DateTime.fromJSDate(dataPagamentoInicial).toISODate();
    }

    if (dataPagamentoFinal) {
      filters.dataPagamentoFinal = DateTime.fromJSDate(dataPagamentoFinal).toISODate();
    }

    if (this.form.bandeira.value && this.form.bandeira.value !== '0') {
      filters.idBandeira = +this.form.bandeira.value;
    }

    if (this.form.statusPagamento.value.length > 0 && this.form.statusPagamento.value !== '0') {
      filters.statusPagamento = this.form.statusPagamento.value;
    }

    if (this.form.modalidade.value && this.form.modalidade.value !== '0') {
      filters.tipoOperacao = +this.form.modalidade.value;
    }

    if (this.form.terminal.value.length > 0) {
      filters.posId = this.form.terminal.value;
    }

    this.getExtratoDetalhado(filters);
  }

  limparFiltros() {
    this.form.terminal.setValue('');
    this.form.dataPagamentoFinal.setValue('');
    this.form.dataPagamentoInicial.setValue('');
    this.form.dataVendaFinal.setValue('');
    this.form.dataVendaInicial.setValue('');
    this.form.bandeira.setValue(0);
    this.form.statusPagamento.setValue(0);
    this.form.modalidade.setValue(0);
    this.getExtratoDetalhado();
  }

  formatarDocumento(str: string): string {
    if (!str) {
      return '';
    }
    return `${str.length <= 11 ? 'CPF' : 'CNPJ'} ${TiposDocumentos.format(str)}`;
  }

  solveLayout(): void {
    const checkScreenSize = () => {
      const isMobile = document.body.offsetWidth < 1100;

      if (!isMobile && this.detalheDatatable == null) {
        this.detalheDatatable = new Datatable({
          table: [
            { property: 'dataVenda', description: 'Data venda', pipe: 'date' },
            { property: 'dataPagamento', description: 'Data Pagamento', pipe: 'date' },
            { property: 'statusPagamento', description: 'Status pagamento' },
            { property: 'bandeira', description: 'Bandeira' },
            { property: 'operacao', description: 'Modalidade' },
            { property: 'valorVenda', description: 'Valor parcela', pipe: 'currency' },
            { property: 'valorDesconto', description: 'Valor desconto', pipe: 'currency' },
            { property: 'valorReceber', description: 'Valor a receber', pipe: 'currency' },
            { property: 'idPos', description: 'Terminal' },
            { property: 'idAutorizacao', description: 'Autorização' },
            { property: 'nsu', description: 'NSU' },
            { property: 'nsuOriginal', description: 'NSU original' },
            { property: 'cartao', description: 'Cartão' },
          ],
          data: this.data,
        });
      }

      this.mobile = isMobile;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }

  export() {
    this.service.exportReport(this.allData);
  }
}
