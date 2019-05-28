import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { RelatoriosService } from '../../relatorios.service';
import { Datatable } from '../../../core/datatable/datatable.interface';

@Component({
    templateUrl: './relatorio-consolidado-fornecedor.component.html',
    styleUrls: [
        '../../../cessao/detalhe/timeline-recebiveis.component.css',
        './relatorio-consolidado-fornecedor.component.css',
    ]
})
export class RelatorioConsolidadoFornecedorComponent implements OnInit {
    constructor(
        private relatorioService: RelatoriosService
    ) { }

    lists = {
        periods: [
            { id: 7, text: '7 dias' },
            { id: 15, text: '15 dias' },
            { id: 30, text: '30 dias' },
        ]
    };

    controls = {
        period: new FormControl(7)
    };

    formFilter = new FormGroup(this.controls);

    antecipacoesDatatable = new Datatable({
        table: [
            { property: 'dataSolicitacao', description: 'Data da Solicitação', pipe: 'date' },
            { property: 'codigoAntecipacao', description: 'Código da Antecipação' },
            { property: 'valorSolicitado', description: 'Valor Solicitado', pipe: 'currency' },
            { property: 'valorDescontoAntecipacao', description: 'Valor do Desconto de Antecipação', pipe: 'currency' },
            { property: 'valorAntecipado', description: 'Valor Líquido Antecipado', pipe: 'currency' },
        ],
        data: [],
    });

    cessoes: any[] = [];
    result: any = {};

    ngOnInit() {
        this.list();
    }

    list() {
        const where = this.formFilter.value;

        this.cessoes = [];
        this.result = {};
        this.antecipacoesDatatable.updateData([]);

        this.relatorioService
            .getRelatorioConsolidadoFornecedor(where)
            .subscribe(result => {
                this.result = result;
                this.antecipacoesDatatable.updateData(result.antecipacao);
                this.cessoes = result.cessao;
            });
    }

}
