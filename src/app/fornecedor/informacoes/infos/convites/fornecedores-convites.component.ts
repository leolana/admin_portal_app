import { Component, Input, OnInit } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { FornecedorService } from 'src/app/fornecedor/fornecedor.service';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';

@Component({
    selector: 'alpe-fornecedores-convites',
    templateUrl: './fornecedores-convites.component.html',
})

export class FornecedoresConvitesComponent implements OnInit {
    constructor(
        private service: FornecedorService,
    ) { }

    convites: any[];
    fornecedoresConvites = new Datatable({
        table: [
            { property: 'nome', description: 'Nome' },
            { property: 'email', description: 'E-mail' },
            { property: 'celular', description: 'Celular' },
            { property: 'acessos', description: 'Perfis' },
            { property: 'status', description: 'Status' },
        ],
        data: []
    });

    ngOnInit() {
        this.getConvites();
    }

    getConvites(): void {
        const id = parseInt(window.location.pathname.split('/')[2], 10);

        this.service.obterConvitesDoFornecedor(id).subscribe(convites => {
            this.convites = convites;

            convites.forEach(user => {
                user.acessos = user.perfis.join(', ');
                user.celular = new TelefonePipe().transform(user.celular);
            });

             this.fornecedoresConvites.updateData(convites);

        });
    }

}
