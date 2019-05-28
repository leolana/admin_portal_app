import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { WizardFornecedor } from 'src/app/interfaces/fornecedor';
import { FornecedorService } from 'src/app/fornecedor/fornecedor.service';
import { ActivatedRoute, Router } from '@angular/router';
import { NumberFunctions } from 'src/app/core/functions/number.functions';
import { TipoCanalEntradaPipe } from 'src/app/pipes/tipo-canal-entrada.pipe';
import { ModalCancelamentoComponent } from 'src/app/core/components/modal-cancelamento/modal-cancelamento.component';
import { recusaTipoEnum } from 'src/app/core/components/modal-cancelamento/recusa-tipo.enum';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { Status, StatusDescricao } from 'src/app/interfaces/participante/indicacao';

declare const $: any;

export interface ViewFornecedores {
  id?: number;
  documento: string;
  data: Date;
  canalEntrada: string;
  solicitante: string;
}

@Component({
  selector: 'alpe-fornecedores-pendentes',
  templateUrl: './fornecedores-pendentes.component.html',
})
export class FornecedoresPendentesComponent implements OnInit {
  indicacaoStatus = Status;
  indicacaoStatusDescricao = StatusDescricao;

  constructor(
    private service: FornecedorService,
    private router: Router,
    private notification: NotificationService,
  ) {}

  currentParams: any;

  @ViewChild('modalReprovar') modalReprovar: ModalCancelamentoComponent;

  fornecedores: ViewFornecedores[];
  fornecedoresPendentes = new Datatable<ViewFornecedores>({
    table: [
      { property: 'documento', description: 'CNPJ' },
      { property: 'data', description: 'Data da solicitação de Cadastro', pipe: 'dateTime' },
      { property: 'canalEntrada', description: 'Canal de Entrada' },
      { property: 'solicitante', description: 'Solicitante' },
      {
        property: 'buttons',
        description: '',
        buttons: [
          {
            btnClass: 'btn-xs btn-warning m-5',
            iconClass: 'fa-edit white',
            fnAction: row => this.cadastrar(row),
          },
          {
            btnClass: 'btn-xs btn-danger',
            iconClass: 'fa-close white',
            fnAction: row => this.openModalReprovar(row),
          },
        ],
      },
    ],
    data: [],
  });

  @Input() set filters(params: any) {
    if (!/pendentes$/i.test(this.router.url)) {
      return;
    }

    this.currentParams = params;

    this.updateData();
  }

  updateData() {
    this.service.listarPendentes(this.currentParams).subscribe(fornecedores => {
      this.fornecedores = fornecedores;

      const data = fornecedores.map(f => ({
        id: f.id,
        documento: new DocumentoPipe().transform(f.documento),
        data: f.data,
        canalEntrada: new TipoCanalEntradaPipe().transform(f.canalEntrada),
        solicitante: f.solicitante,
        nome: f.nome,
        telefone: f.telefone,
        email: f.email,
      }));

      this.fornecedoresPendentes.updateData(data as any);
    });
  }

  editar(forn) {
    this.service.obter(forn.id).subscribe(fornecedor => {
      fornecedor.arquivosExistentes = fornecedor.arquivos.map((f, i) => ({
        id: f.tipo + i,
        arquivo: f.arquivo,
      }));
      delete fornecedor.arquivos;

      const wizard: any = WizardFornecedor.steps;
      wizard[0].url = '/fornecedor/dados-cadastrais';
      wizard[1].url = '/fornecedor/domicilio-bancario';
      wizard[2].url = '/fornecedor/tarifas';
      wizard.forEach(w => (w.cursor = 'pointer'));

      sessionStorage.setItem('wizardFornecedor', JSON.stringify(wizard));
      this.service.saveFornecedorSessionStorage(fornecedor);

      this.router.navigate(['/fornecedor/dados-cadastrais', { edicao: true }]);
    });
  }

  cadastrar(item) {
    const forn = {
      documento: NumberFunctions.removeNonDigits(item.documento),
      contato: {
        nome: item.nome,
        celular: item.telefone,
        email: item.email,
      },
    };
    this.service.saveFornecedorSessionStorage(forn);
    this.router.navigate(['/fornecedor/dados-cadastrais', { back: true }]);
  }

  openModalReprovar(item) {
    this.modalReprovar.open(recusaTipoEnum.cad_fornecedor, item);
  }

  reprovar(event: { item: any; value: any }) {
    this.service
      .recusarIndicacao({
        motivoTipoRecusaId: event.value.motivoTipoRecusaId,
        documento: NumberFunctions.removeNonDigits(event.item.documento),
        motivo: event.value.observacao,
      })
      .subscribe(() => {
        this.notification.showSuccessMessage('Cancelado com sucesso.');
        this.updateData();
        this.modalReprovar.close();
      });
  }

  ngOnInit() {
    this.router.navigate(['/fornecedor/gerenciamento', 'pendentes']);
  }
}
