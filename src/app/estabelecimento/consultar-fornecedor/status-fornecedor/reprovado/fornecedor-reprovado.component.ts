import { Component, OnInit } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { EstabelecimentoService } from '../../../estabelecimento.service';
import { ParticipanteStatus } from '../../../../../app/interfaces';
import { DialogService } from 'src/app/core/dialog/dialog.service';
import { IVinculo, VinculoStatus } from 'src/app/interfaces/participante';
import { PromptComponent } from 'src/app/core/prompt/prompt.component';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'alpe-fornecedor-reprovado',
  templateUrl: './fornecedor-reprovado.component.html',
})
export class FornecedorReprovadoComponent implements OnInit {
  constructor(
    private dialogService: DialogService,
    private service: EstabelecimentoService,
    private prompt: PromptService,
  ) {}

  vinculos: IVinculo[];
  fornecedoresReprovados = new Datatable<IVinculo>({
    table: [
      { property: 'nome', description: 'Nome' },
      { property: 'documento', description: 'CNPJ' },
      { property: 'motivoCancelamento', description: 'Motivo da Recusa' },
      { property: 'dataCancelamento', description: 'Data da Recusa' },
      { property: 'dataCadastro', description: 'Data Cadastro', pipe: 'date' },
    ],
    data: [],
  });

  ngOnInit() {
    this.getVinculos();
  }

  getVinculos(): void {
    this.service.obterVinculos(VinculoStatus.reprovado).subscribe(vinculos => {
      this.vinculos = vinculos;

      const data = vinculos.map(v => ({
        id: v.id,
        nome: v.participante.nome,
        documento: new DocumentoPipe().transform(v.participante.documento),
        dataCadastro: v.dataCadastro,
        participante: v.participante,
        motivoCancelamento: v.motivoRecusa,
        dataCancelamento: v.dataRecusa
          ? new DatePipe('pt').transform(v.dataRecusa, 'shortDate')
          : '',
      }));

      this.fornecedoresReprovados.updateData(data);
    });
  }
}
