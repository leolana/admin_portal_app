import { Router } from '@angular/router';
import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { NotificationService } from '../../../core/notification/notification.service';
import { IVinculo, VinculoStatus } from '../../../interfaces/participante';
import { Datatable } from '../../../core/datatable/datatable.interface';
import { PromptService } from '../../../core/prompt/prompt.service';
import { FornecedorService } from './../../fornecedor.service';
import { DocumentoPipe } from '../../../pipes/documento.pipe';
import { tags } from '../../../core/tags';

@Component({
  selector: 'alpe-estabelecimentos-aprovados',
  templateUrl: './estabelecimentos-aprovados.component.html',
  styleUrls: ['./estabelecimentos-aprovados.component.css'],
  encapsulation: ViewEncapsulation.None,
})
export class EstabelecimentosAprovadosComponent implements OnInit {
  constructor(
    private service: FornecedorService,
    private notification: NotificationService,
    private prompt: PromptService,
    private router: Router,
  ) {}

  valorTotalCessoes: number;

  datatable = new Datatable<IVinculo>({
    table: [
      {
        property: 'nome',
        description: 'Nome',
      },
      {
        property: 'documento',
        description: 'CPF/CNPJ',
      },
      {
        property: 'valorDisponivel',
        description: 'Valor Disponível para Cessão',
        pipe: 'currency',
      },
      {
        property: 'diasAprovacao',
        description: 'Prazo de Aprovação',
        inputNumber: {
          min: 2,
          valueChange: vinculo => this.salvar(vinculo),
          label: vinculo => (vinculo.diasAprovacao == 1 ? 'dia útil' : 'dias úteis'),
        },
      },
      {
        property: 'buttons',
        description: '',
        buttons: [
          {
            text: 'Solicitar Cessão',
            btnClass: 'btn btn-primary btn-solicitar-cessao',
            fnAction: vinculo => this.solicitarCessao(vinculo),
          },
        ],
      },
    ],
    data: [],
    rowClasses: item => {
      if (item.exibeValorDisponivel && item.valorDisponivel <= 0) {
        return 'row-red';
      }
    },
  });

  @Input() set filters(value: any) {
    if (!/aprovados$/i.test(this.router.url)) {
      return;
    }

    const params = Object.assign(
      {
        status: VinculoStatus.aprovado,
      },
      value,
    );

    this.service.meusEstabelecimentos(params).subscribe(estabelecimentos => {
      const documentoPipe = new DocumentoPipe();

      estabelecimentos.forEach((e: any) => {
        e.documento = documentoPipe.transform(e.participante.documento);
        e.nome = e.participante.nome;
        e.valorDisponivel = e.exibeValorDisponivel ? e.valorDisponivel : null;
      });
      this.datatable.updateData(estabelecimentos);
      this.valorTotalCessoes = estabelecimentos.reduce(
        (tot, e: any) => (e.exibeValorDisponivel ? tot + e.valorDisponivel : tot),
        null,
      );
    });
  }

  ngOnInit() {
    this.router.navigate(['/fornecedor/estabelecimentos', 'aprovados']);
  }

  hasError(vinculo: IVinculo): boolean {
    if (vinculo.diasAprovacao < 2) {
      this.notification.showErrorMessage(tags['prazo-aprovacao-dias']);
      return true;
    }
    return false;
  }

  salvar(vinculo: IVinculo): void {
    if (this.hasError(vinculo)) return;

    this.service.alterarVinculo(vinculo).subscribe();
  }

  solicitarCessao(vinculo: IVinculo): void {
    if (this.hasError(vinculo)) return;

    const estabelecimento = vinculo.participante.nome;
    const message = `Deseja Solicitar Cessão para o Estabelecimento "${estabelecimento}"?`;

    this.prompt.confirm(message, 'Confirmação').then(yes => {
      if (yes) {
        this.router.navigateByUrl('fornecedor/solicitarcessao/' + vinculo.id);
      }
    });
  }
}
