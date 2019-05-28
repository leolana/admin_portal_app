import { FormControl, FormGroup } from '@angular/forms';
import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalCancelamentoComponent } from '../../../../core/components/modal-cancelamento/modal-cancelamento.component';
import { recusaTipoEnum } from '../../../../core/components/modal-cancelamento/recusa-tipo.enum';
import { NotificationService } from '../../../../core/notification/notification.service';
import { IVinculo, VinculoStatus } from '../../../../interfaces/participante';
import { NumberFunctions } from '../../../../core/functions/number.functions';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { EstabelecimentoService } from '../../../estabelecimento.service';
import { PromptService } from '../../../../core/prompt/prompt.service';
import { DocumentoPipe } from '../../../../pipes/documento.pipe';

declare const $: any;

@Component({
  selector: 'alpe-fornecedor-aprovado',
  templateUrl: './fornecedor-aprovado.component.html',
})
export class FornecedorAprovadoComponent implements OnInit {
  constructor(
    private service: EstabelecimentoService,
    private prompt: PromptService,
    private notification: NotificationService,
  ) {}

  @ViewChild('modalCancelar') modalCancelar: ModalCancelamentoComponent;

  edit = {
    valorMaximoExibicao: new FormControl('', NumberFunctions.float.validator('optional')),
    prazoAprovacao: new FormControl(NumberFunctions.positiveInteger.validator('required')),
    exibeValorDisponivel: new FormControl(),
  };
  formEdit = new FormGroup(this.edit);
  itemEditing: IVinculo;

  vinculos: IVinculo[];
  fornecedoresAprovados = new Datatable<IVinculo>({
    table: [
      { property: 'nome', description: 'Nome' },
      { property: 'documento', description: 'CNPJ' },
      { property: 'dataCadastro', description: 'Data Cadastro', pipe: 'date' },
      { property: 'prazoAprovacao', description: 'Prazo Aprovação' },
      {
        property: 'exibeValorDisponivel',
        description: 'Exibir Valor Disponível',
        slideToggle: {
          textTrue: 'Sim',
          textFalse: 'Não',
          disableSlideToggle: false,
          changeSlideToggle: row => this.atualizarExibeValorDisponivel(row),
        },
      },
      { property: 'valorMaximoExibicao', description: 'Valor Máximo Disponível', pipe: 'currency' },
      {
        property: 'buttons',
        description: 'Ações',
        buttons: [
          {
            btnClass: 'btn-success btn-xs',
            iconClass: 'fa-edit',
            text: 'Editar',
            fnAction: row => this.editarVinculo(row),
          },
          {
            btnClass: 'btn-danger btn-xs',
            iconClass: 'fa-times',
            text: 'Cancelar',
            fnAction: row => this.openModalCancelar(row),
          },
        ],
      },
    ],
    data: [],
  });

  ngOnInit() {
    this.getVinculos();
  }

  getVinculos(): void {
    this.service.obterVinculos(VinculoStatus.aprovado).subscribe(vinculos => {
      this.vinculos = vinculos;

      const data = vinculos.map(v => ({
        id: v.id,
        nome: v.participante.nome,
        documento: new DocumentoPipe().transform(v.participante.documento),
        dataCadastro: v.dataCadastro,
        prazoAprovacao: v.diasAprovacao == 1 ? '1 dia útil' : v.diasAprovacao + ' dias úteis',
        exibeValorDisponivel: v.exibeValorDisponivel,
        valorMaximoExibicao: v.valorMaximoExibicao,
        participante: v.participante,
      }));

      this.fornecedoresAprovados.updateData(data);
    });
  }

  editarVinculo(vinculo: IVinculo): void {
    if ($('.modal-editar').length) {
      $('.modal-editar')
        .first()
        .appendTo('body')
        .modal('show');
    } else {
      $('.modal-editar').show();
    }
    setTimeout(() => $('#valorMaximoExibicao').select(), 200);

    this.itemEditing = vinculo;
    Object.keys(this.formEdit.controls).forEach(control => {
      this.formEdit.controls[control].setValue(this.itemEditing[control]);
    });
  }

  openModalCancelar(row) {
    const fornecedor = row.participante.nome;
    const message = `Deseja cancelar o vínculo com o Fornecedor "${fornecedor}"?`;

    this.prompt.confirm(message, 'Confirmação').then(yes => {
      if (yes) {
        this.modalCancelar.open(recusaTipoEnum.recusa_vinculo, row);
      }
    });
  }

  cancelar(event: { item: IVinculo; value: any }): void {
    this.service
      .cancelarVinculo({
        ...event.item,
        ...event.value,
      })
      .subscribe(() => {
        event.item.status = VinculoStatus.cancelado;
        this.getVinculos();

        const fornecedor = event.item.participante.nome;
        const message = `O vínculo com o fornecedor "${fornecedor}" foi cancelado com sucesso`;

        this.modalCancelar.close();
        this.notification.showSuccessMessage(message);
      });
  }

  atualizarExibeValorDisponivel(item) {
    const check = !item.exibeValorDisponivel
      ? this.prompt.confirm(
          `Selecionando "Não" para Exibição Valor Disponível, o respectivo fornecedor não visualizará valor de agenda,
                 porém conseguirá solicitar a cessão. Deseja continuar?`,
          'Confirmação',
        )
      : Promise.resolve(true);

    check.then(ans => {
      if (!ans) {
        item.exibeValorDisponivel = true;
      }
      this.service.alterarVinculo(item).subscribe(() => {});
    });
  }

  atualizarVinculo(): void {
    Object.keys(this.formEdit.controls).forEach(controlName => {
      this.formEdit.controls[controlName].markAsDirty();
    });

    if (this.formEdit.invalid) {
      this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
      return;
    }

    if (this.edit.valorMaximoExibicao.value < 1 && this.edit.valorMaximoExibicao.value !== null) {
      this.notification.showAlertMessage('O valor máximo de exibição deve ser superior à R$1,00!');
      return;
    }

    Object.keys(this.formEdit.controls).forEach(control => {
      this.itemEditing[control] = this.formEdit.controls[control].value;
    });

    this.service.alterarVinculo(this.itemEditing).subscribe(() => {
      this.notification.showSuccessMessage('Fornecedor atualizado');
      $('.modal-editar').modal('hide');
      this.itemEditing = null;
      this.getVinculos();
    });
  }
}
