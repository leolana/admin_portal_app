import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { Datatable } from '../../../core/datatable/datatable.interface';
import { TiposPessoa, VerificaTipoPessoa } from '../../../interfaces';
import { FornecedorService } from './../../fornecedor.service';
import { DocumentoPipe } from '../../../pipes/documento.pipe';
import { TelefonePipe } from '../../../pipes/telefone.pipe';
import { VinculoStatus } from 'src/app/interfaces/participante';

@Component({
  selector: 'alpe-estabelecimentos-pendentes',
  templateUrl: './estabelecimentos-pendentes.component.html',
  styleUrls: ['./estabelecimentos-pendentes.component.css'],
})
export class EstabelecimentosPendentesComponent implements OnInit {
  constructor(private service: FornecedorService, private router: Router) {}

  datatable = new Datatable<any>({
    table: [
      {
        property: 'nome',
        description: 'Nome',
      },
      {
        property: 'documentoMasked',
        description: 'CPF/CNPJ',
      },
      {
        property: 'dataCadastro',
        description: 'Data da solicitação de cadastro',
        pipe: 'date',
      },
      {
        property: 'tipoPessoa',
        description: 'Pessoa Física/Jurídica',
      },
      {
        property: 'email',
        description: 'E-mail',
      },
      {
        property: 'telefoneMasked',
        description: 'Telefone',
      },
      {
        property: 'buttons',
        description: '',
        buttons: [
          {
            iconClass: 'fa-pencil',
            btnClass: 'btn btn-success btn-sm',
            fnAction: row => this.alterarIndicacao(row),
            visible: row => Boolean(row.id),
          },
        ],
      },
    ],
    data: [],
  });

  @Input() set filters(value: any) {
    if (!/pendentes$/i.test(this.router.url)) {
      return;
    }

    const params = Object.assign({}, value);

    this.service.listarEstabelecimentosPendentes(params).subscribe(estabelecimentos => {
      const telefonePipe = new TelefonePipe();
      const documentoPipe = new DocumentoPipe();
      estabelecimentos.forEach(e => {
        if (e.telefone) {
          e.telefoneMasked = telefonePipe.transform(e.telefone);
        }
        e.documentoMasked = documentoPipe.transform(e.documento);
        e.tipoPessoa = TiposPessoa.descricoes[VerificaTipoPessoa(e.documento)];
      });

      this.datatable.updateData(estabelecimentos);
    });
  }

  ngOnInit() {
    this.router.navigate(['/fornecedor/estabelecimentos', 'pendentes']);
  }

  alterarIndicacao(row: any) {
    this.router.navigateByUrl('/indicacao-estabelecimento/' + row.id);
  }
}
