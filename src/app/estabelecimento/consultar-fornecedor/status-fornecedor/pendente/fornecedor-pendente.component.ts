import { Component, OnInit, ViewChild } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { EstabelecimentoService } from '../../../estabelecimento.service';
import { IVinculo, VinculoStatus } from 'src/app/interfaces/participante';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { ModalCancelamentoComponent } from 'src/app/core/components/modal-cancelamento/modal-cancelamento.component';
import { recusaTipoEnum } from 'src/app/core/components/modal-cancelamento/recusa-tipo.enum';

@Component({
  selector: 'alpe-fornecedor-pendente',
  templateUrl: './fornecedor-pendente.component.html',
})
export class FornecedorPendenteComponent implements OnInit {
  constructor(private service: EstabelecimentoService, private notification: NotificationService) {}
  @ViewChild('modalReprovar') modalReprovar: ModalCancelamentoComponent;

  vinculos: IVinculo[];
  fornecedoresPendentes = new Datatable<IVinculo>({
    table: [
      { property: 'nome', description: 'Nome' },
      { property: 'documento', description: 'CNPJ' },
      { property: 'dataCadastro', description: 'Data Cadastro', pipe: 'date' },
      { property: 'prazoAprovacao', description: 'Prazo Aprovação' },
      {
        property: 'valorMaximoDisponivel',
        description: 'Valor Máximo Disponível',
        pipe: 'currency',
      },
      {
        property: 'buttons',
        description: 'Ações',
        buttons: [
          {
            btnClass: 'btn-success btn-xs m-5',
            iconClass: 'fa-thumbs-o-up',
            text: 'Aprovar',
            fnAction: row => this.aprovar(row),
          },
          {
            btnClass: 'btn-danger btn-xs',
            iconClass: 'fa-thumbs-o-down',
            text: 'Recusar',
            fnAction: row => this.recusar(row),
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
    this.service.obterVinculos(VinculoStatus.pendente).subscribe(vinculos => {
      this.vinculos = vinculos;

      const data = vinculos.map(v => ({
        id: v.id,
        nome: v.participante.nome,
        documento: new DocumentoPipe().transform(v.participante.documento),
        dataCadastro: v.dataCadastro,
        prazoAprovacao: this.diasText(v.diasAprovacao),
        valorMaximoDisponivel: v.valorMaximoExibicao || '-',
        participante: v.participante,
      }));

      this.fornecedoresPendentes.updateData(data);
    });
  }

  aprovar(item: IVinculo): void {
    this.service.aprovarVinculo(item).subscribe(() => {
      item.status = VinculoStatus.aprovado;
      this.notification.showSuccessMessage('Fornecedor aprovado com sucesso');
      this.getVinculos();
    });
  }

  recusar(item: any): void {
    this.modalReprovar.open(recusaTipoEnum.recusa_vinculo, item);
  }

  reprovar(event: { item: IVinculo; value: any }): void {
    this.service
      .recusarVinculo({
        ...event.item,
        ...event.value,
      })
      .subscribe(() => {
        event.item.status = VinculoStatus.reprovado;

        this.getVinculos();

        this.modalReprovar.close();
        this.notification.showSuccessMessage('Fornecedor recusado com sucesso');
      });
  }

  diasText(dias) {
    if (dias == 1) {
      return `${dias} dia útil`;
    }
    return `${dias} dias úteis`;
  }
}
