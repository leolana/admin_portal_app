import { Router } from '@angular/router';
import { Component, Input, OnInit } from '@angular/core';
import { IVinculo, VinculoStatus } from '../../../interfaces/participante';
import { Datatable } from '../../../core/datatable/datatable.interface';
import { FornecedorService } from './../../fornecedor.service';
import { DocumentoPipe } from '../../../pipes/documento.pipe';

@Component({
    selector: 'alpe-estabelecimentos-reprovados',
    templateUrl: './estabelecimentos-reprovados.component.html',
    styleUrls: ['./estabelecimentos-reprovados.component.css']
})
export class EstabelecimentosReprovadosComponent implements OnInit {
    constructor(
        private service: FornecedorService,
        private router: Router,
    ) { }

    datatable = new Datatable<IVinculo>({
        table: [{
            property: 'nome',
            description: 'Nome'
        }, {
            property: 'documento',
            description: 'CPF/CNPJ'
        }, {
            property: 'motivoRecusa',
            description: 'Motivo Recusa'
        },
        {
            property: 'dataFimIndicacao',
            description: 'Data Recusa',
            pipe: 'date'
        },
        {
            property: 'dataCadastro',
            description: 'Data Cadastro',
            pipe: 'date'
        }],
        data: []
    });

    @Input() set filters(value: any) {
        if (!/reprovados$/i.test(this.router.url)) {
            return;
        }

        const params = Object.assign({
            status: VinculoStatus.reprovado,
        }, value);

        this.service.meusEstabelecimentos(params).subscribe(estabelecimentos => {
            const documentoPipe = new DocumentoPipe();

            estabelecimentos.forEach((e: any) => {
                e.documento = documentoPipe.transform(e.participante.documento);
                e.nome = e.participante.nome;
            });

            this.datatable.updateData(estabelecimentos);
        });
    }

    ngOnInit() {
        this.router.navigate(['/fornecedor/estabelecimentos', 'reprovados']);
    }
}
