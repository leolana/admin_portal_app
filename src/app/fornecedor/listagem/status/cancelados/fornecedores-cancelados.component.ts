import { Component, Input, OnInit } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { FornecedorService } from 'src/app/fornecedor/fornecedor.service';
import { DatePipe } from '@angular/common';
import { TipoCanalEntradaPipe } from 'src/app/pipes/tipo-canal-entrada.pipe';
import { Router } from '@angular/router';

export interface ViewFornecedoresCancelados {
  id?: number;
  documento: string;
  dataCadastro: Date;
  canalEntrada: string;
  solicitante: string;
  motivoCancelamento?: string;
  dataCancelamento?: Date;
}

@Component({
  selector: 'alpe-fornecedores-cancelados',
  templateUrl: './fornecedores-cancelados.component.html',
})
export class FornecedoresCanceladosComponent implements OnInit {
  constructor(private service: FornecedorService, private router: Router) {}

  fornecedores: ViewFornecedoresCancelados[];
  fornecedoresCancelados = new Datatable<ViewFornecedoresCancelados>({
    table: [
      { property: 'documento', description: 'CNPJ' },
      { property: 'dataCadastro', description: 'Data Solicitação de Cadastro', pipe: 'date' },
      { property: 'canalEntrada', description: 'Canal de Entrada' },
      { property: 'solicitante', description: 'Solicitante' },
      { property: 'motivoCancelamento', description: 'Motivo' },
      { property: 'dataCancelamento', description: 'Data do Cancelamento' },
    ],
    data: [],
  });

  @Input() set filters(params: any) {
    if (!/cancelados$/i.test(this.router.url)) {
      return;
    }

    this.service.listarCancelados(params).subscribe(fornecedores => {
      this.fornecedores = fornecedores;

      const data = fornecedores.map(f => ({
        id: f.id,
        documento: new DocumentoPipe().transform(f.documento),
        dataCadastro: f.dataCadastro,
        canalEntrada: new TipoCanalEntradaPipe().transform(f.canalEntrada),
        solicitante: f.nome,
        motivoCancelamento: f.motivoCancelamento,
        dataCancelamento: f.dataCancelamento
          ? new DatePipe('pt').transform(f.dataCancelamento, 'shortDate')
          : '',
      }));

      this.fornecedoresCancelados.updateData(data);
    });
  }

  ngOnInit() {
    this.router.navigate(['/fornecedor/gerenciamento', 'cancelados']);
  }
}
