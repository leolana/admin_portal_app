import { Component, Input, OnInit } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { FornecedorService } from 'src/app/fornecedor/fornecedor.service';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';

@Component({
    selector: 'alpe-fornecedores-usuarios',
    templateUrl: './fornecedores-usuarios.component.html',
})

export class FornecedoresUsuariosComponent implements OnInit {
    constructor(
        private service: FornecedorService,
    ) { }

    usuarios: any[];
    fornecedoresUsuarios = new Datatable({
        table: [
            { property: 'nome', description: 'Nome' },
            { property: 'email', description: 'E-mail' },
            { property: 'celular', description: 'Celular' },
            { property: 'acessos', description: 'Perfis' },
            { property: 'status', description: 'Status' }
        ],
        data: []
    });

    ngOnInit() {
        this.getUsuarios();
    }

    getUsuarios(): void {
        const id = parseInt(window.location.pathname.split('/')[2], 10);

        this.service.obterUsuariosDoFornecedor(id).subscribe(usuarios => {
            this.usuarios = usuarios;
            usuarios.forEach(user => {
                user.status = user.ativo ? 'Ativo' : 'Inativo';
                user.acessos = user.perfis.join(', ');
                user.celular = new TelefonePipe().transform(user.celular);
            });

            this.fornecedoresUsuarios.updateData(usuarios);

        });
    }

}
