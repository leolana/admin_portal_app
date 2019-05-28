import { Component, OnInit } from '@angular/core';
import { TiposDocumentos } from '../../interfaces';
import { RelatoriosService } from '../relatorios.service';
import { DateTime } from 'luxon';

@Component({
  templateUrl: './extrato-resumido.component.html',
  styleUrls: ['./extrato-resumido.component.css'],
})
export class ExtratoResumidoComponent implements OnInit {
  constructor(private service: RelatoriosService) {}

  // PROEPRTIES
  nomeFantasia: string;
  ehEstabelecimento: boolean;
  documento: string;
  codigoParticipante: number;
  currentDate: string;
  data: any[];
  user: any[];
  mobile: boolean;

  // METHODS
  ngOnInit(): void {
    this.currentDate = DateTime.local().toFormat('dd/MM/yyyy HH:mm');
    this.solveLayout();
    this.getExtratoResumido();

    const [_, type] = location.href.match(
      /(estabelecimento|fornecedor)\/relatorio\/extratoresumido$/,
    );
    this.user = [type];
    this.ehEstabelecimento = type === 'estabelecimento';
  }

  getExtratoResumido(): void {
    this.service.getExtratoResumido().subscribe(result => {
      this.nomeFantasia = result.nomeFantasia;
      this.documento = result.documento;
      this.codigoParticipante = result.id;
      this.data = result.data;
    });
  }

  solveLayout(): void {
    const checkScreenSize = () => {
      this.mobile = document.body.offsetWidth < 1100;
    };

    window.onresize = checkScreenSize;
    checkScreenSize();
  }

  formatarDocumento(str: string): string {
    if (!str) {
      return '';
    }
    return `${str.length <= 11 ? 'CPF' : 'CNPJ'} ${TiposDocumentos.format(str)}`;
  }
}
