import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { WizardFornecedor } from 'src/app/interfaces/fornecedor';
import { FornecedorService } from 'src/app/fornecedor/fornecedor.service';
import { Router } from '@angular/router';
import { TipoCanalEntradaPipe } from 'src/app/pipes/tipo-canal-entrada.pipe';

export interface ViewFornecedores {
  id?: number;
  documento: string;
  nome: string;
  data: Date;
  status?: string;
}

@Component({
  selector: 'alpe-fornecedores-cadastrados',
  templateUrl: './fornecedores-cadastrados.component.html',
  styleUrls: ['../fornecedores.css'],
  encapsulation: ViewEncapsulation.None,
})
export class FornecedoresCadastradosComponent implements OnInit {
  constructor(private fornecedorService: FornecedorService, private router: Router) {}

  fornecedores: ViewFornecedores[];
  fornecedoresCadastrados = new Datatable<ViewFornecedores>({
    table: [
      { property: 'id', description: 'Número Fornecedor' },
      { property: 'documento', description: 'CNPJ' },
      { property: 'canalEntrada', description: 'Canal de Entrada' },
      { property: 'nome', description: 'Nome' },
      { property: 'data', description: 'Data', pipe: 'dateTime' },
      { property: 'status', description: 'Status' },
      {
        property: 'buttons',
        description: '',
        buttons: [
          {
            btnClass: 'btn-xs btn-primary m-5 white',
            iconClass: 'fa-search',
            fnAction: row => this.goToInfos(row),
          },
          {
            btnClass: 'btn-xs btn-warning btn-mobile white',
            iconClass: 'fa-edit',
            fnAction: row => this.editar(row),
          },
        ],
      },
    ],
    data: [],
  });

  @Input() set filters(params: any) {
    if (!/cadastrados$/i.test(this.router.url)) {
      return;
    }

    this.fornecedorService.listarCadastrados(params).subscribe(fornecedores => {
      fornecedores.forEach(f => {
        f.documento = new DocumentoPipe().transform(f.documento);
        f.status = f.status ? 'Ativo' : 'Inativo';
        f.canalEntrada = new TipoCanalEntradaPipe().transform(f.canalEntrada);
      });
      this.fornecedores = fornecedores;
      this.fornecedoresCadastrados.updateData(fornecedores);
    });
  }

  editar(forn) {
    this.fornecedorService.obter(forn.id).subscribe(fornecedor => {
      const domicilios = fornecedor.domiciliosBancarios.sort((a, b) => {
        if (a.bandeiraId < b.bandeiraId) return -1;
        if (a.bandeiraId > b.bandeiraId) return 1;
        return 0;
      });

      domicilios.forEach(d => {
        d.existing = true;
        d.newFile = false;
      });

      fornecedor.domiciliosBancarios = domicilios;

      const wizard: any = WizardFornecedor.steps;
      wizard[0].url = '/fornecedor/dados-cadastrais';
      wizard[1].url = '/fornecedor/domicilio-bancario';
      wizard[2].url = '/fornecedor/tarifas';
      wizard.forEach(w => (w.cursor = 'pointer'));

      sessionStorage.setItem('wizardFornecedor', JSON.stringify(wizard));
      this.fornecedorService.saveFornecedorSessionStorage(fornecedor);

      this.router.navigate(['/fornecedor/dados-cadastrais', { edicao: true }]);
    });
  }

  goToInfos(item) {
    this.router.navigateByUrl(`/fornecedor/${item.id}/informacoes`);
  }

  ngOnInit() {
    this.router.navigate(['/fornecedor/gerenciamento', 'cadastrados']);
  }
}
