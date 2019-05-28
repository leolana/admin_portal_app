import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { Datatable } from '../../../core/datatable/datatable.interface';
import { UsuariosService } from '../../usuarios.service';
import { UsuarioStatus } from '../../../../app/interfaces';
import { NotificationService } from '../../../core/notification/notification.service';
import { ConviteViewModel } from '../../gerenciamento/gerenciamento.component';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';
import { Router } from '@angular/router';

export interface UsuarioConviteAtivoViewModel {
    nome: string;
    email: string;
    celular: string;
    perfis: string;
    expiraEm: Date;
}

@Component({
    selector: 'alpe-usuarios-convite-ativo',
    templateUrl: './usuarios-convite-ativo.component.html',
    styleUrls: ['../usuario.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UsuariosConviteAtivoComponent implements OnInit {

    constructor(
        private usuariosService: UsuariosService,
        private notification: NotificationService,
        private router: Router,
    ) { }

    usuarios: ConviteViewModel[];
    filterParams: any = {};
    usuariosConviteAtivo = new Datatable<UsuarioConviteAtivoViewModel>({
        table: [
            { property: 'nome', description: 'Nome' },
            { property: 'email', description: 'E-mail' },
            { property: 'celular', description: 'Celular' },
            { property: 'perfis', description: 'Perfis', classProperty: 'mobile-roles' },
            { property: 'expiraEm', description: 'Data de Expiração', pipe: 'date' },
            {
                property: 'buttons',
                description: 'Ações',
                buttons: [{
                    btnClass: 'btn-success btn-xs',
                    text: 'Reenviar Convite',
                    fnAction: row => this.reenviarConvite(row)
                }]
            },
        ],
        serverSide: (pageSize, pageIndex, sortColumn, sortOrder) => {
            const filtroParticipante = this.filterParams.nomeParticipante ? this.filterParams : {};
            this.obter(filtroParticipante, pageSize, pageIndex, sortColumn, sortOrder);
        },
        data: []
    });

    @Input() set filters(params: any) {
        if (!/convidados$/i.test(this.router.url)) { return; }
        this.filterParams = params;
        const datatable = this.usuariosConviteAtivo.internal;
        if (datatable.initialized)
            this.obter(params, datatable.pageSize, datatable.pageIndex);
    }

    ngOnInit() {
        this.router.navigate(['/usuarios', 'convidados']);
    }


    obter(params, pageSize = null, pageIndex = null, sortColumn = null, sortOrder = null) {
        const filter = params;
        filter.status = UsuarioStatus.ativo;

        this.usuariosService
            .obterConvites(filter, pageSize, pageIndex, sortColumn, sortOrder)
            .subscribe(objUsuarios => {
                const usuarios = objUsuarios.invites;
                this.usuarios = usuarios;

                const data = usuarios.map(usuario => ({
                    nome: usuario.nome,
                    email: usuario.email,
                    celular: new TelefonePipe().transform(usuario.celular),
                    perfis: usuario.roles.join(', '),
                    expiraEm: usuario.expiraEm
                }));

                this.usuariosConviteAtivo.internal.data.length = objUsuarios.invitesLength;
                this.usuariosConviteAtivo.internal.visibleData = data;
            });

    }

    atualizarDadosTabela() {
        this.usuariosConviteAtivo.updateVisibleData();
    }

    reenviarConvite(row: UsuarioConviteAtivoViewModel) {
        const usuario = this.usuarios.find(u => u.email === row.email);

        this.usuariosService.reenviarConvite(usuario).subscribe(() => {
            this.notification.showSuccessMessage('Convite reenviado para o usuário ' + usuario.nome);
            this.atualizarDadosTabela();
        });
    }
}
