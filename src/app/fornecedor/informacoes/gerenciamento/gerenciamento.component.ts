import { Component, ViewChild, TemplateRef, AfterViewInit, OnInit, OnDestroy } from '@angular/core';
import { AlpeTabs } from '../../../core/components/alpe-tabs/alpe-tabs.component';
import { ActivatedRoute, Params } from '@angular/router';
import { FornecedorService } from '../../fornecedor.service';
import { Datatable } from 'src/app/core/datatable/datatable.interface';
import { zip } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';
import { VinculoStatusPipe } from 'src/app/pipes/vinculo-status.pipe';

@Component({
    templateUrl: './gerenciamento.component.html'
})
export class GerenciamentoInformacacoesFornecedorComponent implements AfterViewInit, OnInit, OnDestroy {

    constructor(
        private service: FornecedorService,

    ) { }

    fornecedor = '';
    vinculos: any[];
    vinculosFornecedor = new Datatable<any>({
        table: [
            { property: 'nome', description: 'Nome' },
            { property: 'documento', description: 'CPF/CNPJ' },
            { property: 'razaoSocial', description: 'Razão Social' },
            { property: 'telefone', description: 'Telefone' },
            { property: 'status', description: 'Status' },
        ],
        data: []
    });


    @ViewChild('fornecedorConvites') fornecedorConvites: TemplateRef<any>;
    @ViewChild('fornecedorUsuarios') fornecedorUsuarios: TemplateRef<any>;

    tabs: AlpeTabs[];
    ngAfterViewInit() {
        this.tabs = [
            { label: 'Usuários', template: this.fornecedorUsuarios },
            { label: 'Convites', template: this.fornecedorConvites },
        ];

    }

    ngOnDestroy() {
        if (localStorage.getItem('forn')) {
            localStorage.removeItem('forn');
        }
    }

    ngOnInit(): void {
        const id = parseInt(window.location.pathname.split('/')[2], 10);
        zip(
            this.service.obter(id),
            this.service.vinculosFornecedor(id)
        )
        .pipe(catchError(err => {
            return err;
        }))
        .subscribe(arr => {
            this.fornecedor = arr[0].nome;
            this.vinculos = arr[1];

            const data = this.vinculos.map(v => ({
                nome: v.nome,
                documento: new DocumentoPipe().transform(v.documento),
                razaoSocial: v.razaoSocial,
                telefone: new TelefonePipe().transform(v.razaoSocial),
                status: new VinculoStatusPipe().transform(v.status),
            }));
            this.vinculosFornecedor.updateData(data);
        });
    }

}
