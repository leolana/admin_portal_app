import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { Datatable } from '../../../core/datatable/datatable.interface';
import { UsuariosService } from '../../usuarios.service';
import { UsuarioStatus } from '../../../../app/interfaces';
import { UsuarioViewModel } from '../../gerenciamento/gerenciamento.component';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';
import { Router } from '@angular/router';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Roles } from 'src/app/core/auth/auth.roles';

declare const $: any;
export interface UsuarioAtivoViewModel {
    id: string;
    nome: string;
    email: string;
    celular: string;
    perfis: string;
}

export interface UsuarioKeycloak {
    id: string;
    email: string;
    status: string;
    perfis: string;
    infoErrada?: boolean;
}


@Component({
    selector: 'alpe-usuarios-ativos',
    templateUrl: './usuarios-ativos.component.html',
    styleUrls: ['../usuario.component.css'],
})

export class UsuariosAtivosComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router,
        private usuariosService: UsuariosService,
        private notificacaoService: NotificationService,
        private authService: AuthService,
    ) { }

    lastObter: any;
    openInfo = false;
    infoUserKeyclaok: UsuarioKeycloak = {
        id: null,
        email: null,
        status: null,
        perfis: null,
        infoErrada: null,
    };
    infoUserAlpe;
    dataValidation = {
        id: false,
        email: false,
        status: false,
        roles: false,
    };
    usuarios: UsuarioViewModel[];
    filterParams: any;
    usuariosAtivos = new Datatable<UsuarioAtivoViewModel>({
        table: [
            { property: 'nome', description: 'Nome' },
            { property: 'email', description: 'E-mail' },
            { property: 'celular', description: 'Celular' },
            { property: 'perfis', description: 'Perfis', classProperty: 'mobile-roles' },
            {
                property: 'buttons',
                description: 'Ações',
                buttons: [{
                    btnClass: 'btn-success btn-xs',
                    iconClass: 'fa-edit',
                    fnAction: row => this.editUser(row)
                },
                {
                    btnClass: 'btn-primary btn-xs',
                    iconClass: 'fa-info',
                    fnAction: row => this.infoKeycloak(row)
                }],
            }
        ],
        serverSide: (pageSize, pageIndex, sortColumn, sortOrder) => {
            this.obter(this.filterParams, pageSize, pageIndex, sortColumn, sortOrder);
        },
        data: []
    });

    @Input() set filters(params: any) {
        if (!/ativos$/i.test(this.router.url)) {
            return;
        }
        this.filterParams = params;
        const datatable = this.usuariosAtivos.internal;
        if (datatable.initialized)
            this.obter(params, datatable.pageSize, datatable.pageIndex);
    }


    ngOnInit() {
        this.router.navigate(['/usuarios', 'ativos']);
    }

    obter(params, pageSize = null, pageIndex = null, sortColumn = null, sortOrder = null) {
        this.lastObter = arguments;

        const filter = params;
        filter.status = UsuarioStatus.ativo;

        this.usuariosService
            .obterUsuarios(filter, pageSize, pageIndex, sortColumn, sortOrder)
            .subscribe(objUsuarios => {
                const usuarios = objUsuarios.users;
                this.usuarios = usuarios;

                const data = usuarios.map(usuario => ({
                    id: usuario.id,
                    nome: usuario.nome,
                    email: usuario.email,
                    celular: new TelefonePipe().transform(usuario.celular),
                    perfis: usuario.roles.join(', ')
                }));

                this.usuariosAtivos.internal.data.length = objUsuarios.usersLength;
                this.usuariosAtivos.internal.visibleData = data;
            });
    }

    editUser(row: UsuarioAtivoViewModel) {
        const usuario = this.usuarios.find(u => u.id === row.id);
        usuario.status = UsuarioStatus.ativo;

        this.router.navigate(['usuario/cadastrar', { id: usuario.id }]);
    }

    infoKeycloak(row: UsuarioAtivoViewModel) {
        this.usuariosService.obterInfoKeycloak(row.id).subscribe(userKeycloak => {
            const userAlpe: any = row;
            if (userKeycloak) {
                userKeycloak.perfis = userKeycloak.roles.join(', ');
                userKeycloak.status = userKeycloak.enabled || userKeycloak.ativo ? 'Ativo' : 'Inativo';
                userAlpe.status = UsuarioStatus.descricoes[UsuarioStatus.ativo];
                this.infoUserKeyclaok = userKeycloak;

                userAlpe.roles = userAlpe.perfis.split(', ');
                Object.keys(this.dataValidation).forEach(user => {
                    this.dataValidation[user] = Array.isArray(userKeycloak[user]) ?
                        userKeycloak[user].every(userItem => userAlpe[user].includes(userItem)) : userKeycloak[user] === userAlpe[user];
                });
            } else {
                this.infoUserAlpe = userAlpe;
            }
            this.infoUserKeyclaok.infoErrada = Object.values(this.dataValidation).some(validation => !validation);
            this.openInfo = true;

            $('#modalInfoKeycloak').appendTo('body').modal('show');
        });
    }

    recriarUsuario(): void {
        const usuario = {
            id: this.infoUserKeyclaok.id || this.infoUserAlpe.id,
            email: this.infoUserKeyclaok.email || this.infoUserAlpe.email,
            userNewKeycloak: this.infoUserKeyclaok.id === null,
            status: true
        };

        this.usuariosService.recriarUsuarioKeycloak(usuario).subscribe(() => {
            this.notificacaoService.showSuccessMessage('Usuário recriado no keycloak com sucesso!');
            $('#modalInfoKeycloak').modal('hide');
            this.obter.apply(this, this.lastObter);
        });
    }

    loggedUserIsBKO(): boolean {
        return this.authService.hasRole(Roles.boAdministrador)
            && !this.authService.user.participanteEstabelecimento
            && !this.authService.user.participanteFornecedor;
    }

    ngOnDestroy() {
        $('#modalInfoKeycloak').remove();
    }

}
