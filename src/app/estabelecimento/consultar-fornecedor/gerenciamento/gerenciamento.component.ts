import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { DialogService } from '../../../core/dialog/dialog.service';
import { AlpeTabs } from '../../../core/components/alpe-tabs/alpe-tabs.component';
import { ActivatedRoute } from '@angular/router';

export interface VinculoViewModel {
  id: string;
  nome: string;
  documento: string;
  dataCadastro: Date;
  prazoAprovacao: string;
  exibirValor: boolean;
  valorMaximoDisponivel: number;
}

@Component({
  templateUrl: './gerenciamento.component.html',
})
export class GerenciamentoConsultaFornecedorComponent implements AfterViewInit {
  constructor(private route: ActivatedRoute) {}

  @ViewChild('fornecedorPendente') fornecedorPendente: TemplateRef<any>;
  @ViewChild('fornecedorAprovado') fornecedorAprovado: TemplateRef<any>;
  @ViewChild('fornecedorCancelado') fornecedorCancelado: TemplateRef<any>;
  @ViewChild('fornecedorReprovado') fornecedorReprovado: TemplateRef<any>;
  @ViewChild('fornecedorIndicacao') fornecedorIndicacao: TemplateRef<any>;

  tabs: AlpeTabs[];

  ngAfterViewInit() {
    this.tabs = [
      { label: 'Pendente', template: this.fornecedorPendente },
      { label: 'Aprovado', template: this.fornecedorAprovado },
      { label: 'Cancelado', template: this.fornecedorCancelado },
      { label: 'Reprovado', template: this.fornecedorReprovado },
      { label: 'Indicações', template: this.fornecedorIndicacao },
    ];
    this.route.params.subscribe(params => {
      this.tabs[0].active = params.aba === 'pendente';
      this.tabs[1].active = params.aba === 'aprovado';
      this.tabs[2].active = params.aba === 'cancelado';
      this.tabs[3].active = params.aba === 'reprovado';
      this.tabs[4].active = params.aba === 'indicacoes';
    });
  }
}
