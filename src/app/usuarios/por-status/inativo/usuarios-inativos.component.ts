import { Component, OnInit, Input, ViewEncapsulation, OnDestroy, } from '@angular/core';
import { Datatable } from '../../../core/datatable/datatable.interface';
import { UsuariosService } from '../../usuarios.service';
import { UsuarioStatus } from '../../../../app/interfaces';
import { DialogService } from 'src/app/core/dialog/dialog.service';
import { UsuarioViewModel } from '../../gerenciamento/gerenciamento.component';
import { UsuarioEditarComponent } from '../../editar-incluir-usuario/incluir-usuario.component';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';
import { Router } from '@angular/router';
import { UsuarioKeycloak } from '../ativo/usuarios-ativos.component';
import { AuthService } from 'src/app/core/auth/auth.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { Roles } from 'src/app/core/auth/auth.roles';

declare const $: any;
export interface UsuarioInativoViewModel {
    id: string;
    nome: string;
    email: string;
    celular: string;
    perfis: string;
}

@Component({
    selector: 'alpe-usuarios-inativos',
    templateUrl: './usuarios-inativos.component.html',
    styleUrls: ['../usuario.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class UsuariosInativosComponent implements OnInit, OnDestroy {
    constructor(
        private router: Router,
        private usuariosService: UsuariosService,
        private authService: AuthService,
        private notificacaoService: NotificationService,
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
    usuariosInativos = new Datatable<UsuarioInativoViewModel>({
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
                }]
            }
        ],
        serverSide: (pageSize, pageIndex, sortColumn, sortOrder) => {
            this.obter(this.filterParams, pageSize, pageIndex, sortColumn, sortOrder);
        },
        data: []
    });

    @Input() set filters(params: any) {
        if (!/inativos$/i.test(this.router.url)) { return; }

        this.filterParams = params;
        const datatable = this.usuariosInativos.internal;
        if (datatable.initialized)
            this.obter(params, datatable.pageSize, datatable.pageIndex);
    }

    ngOnInit() {
        this.router.navigate(['/usuarios', 'inativos']);
    }


    obter(params, pageSize = null, pageIndex = null, sortColumn = null, sortOrder = null) {
        this.lastObter = arguments;
        const filter = params;
        filter.status = UsuarioStatus.inativo;

        this.usuariosService.obterUsuarios(filter, pageSize, pageIndex, sortColumn, sortOrder)
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

                this.usuariosInativos.internal.data.length = objUsuarios.usersLength;
                this.usuariosInativos.internal.visibleData = data;
            });
    }

    editUser(row: UsuarioInativoViewModel) {
        const usuario = this.usuarios.find(u => u.id === row.id);
        usuario.status = UsuarioStatus.ativo;

        this.router.navigate(['usuario/cadastrar', { id: usuario.id }]);
    }

    infoKeycloak(row: UsuarioInativoViewModel) {
        this.usuariosService.obterInfoKeycloak(row.id).subscribe(userKeycloak => {
            const userAlpe: any = row;
            if (userKeycloak) {
                userKeycloak.perfis = userKeycloak.roles.join(', ');
                userKeycloak.status = userKeycloak.enabled || userKeycloak.ativo ? 'Ativo' : 'Inativo';
                userAlpe.status = UsuarioStatus.descricoes[UsuarioStatus.inativo];
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
            $('.modal').first().appendTo('body').modal('show');
        });
    }


    recriarUsuario(): void {
        const usuario = {
            id: this.infoUserKeyclaok.id || this.infoUserAlpe.id,
            email: this.infoUserKeyclaok.email || this.infoUserAlpe.email,
            userNewKeycloak: this.infoUserKeyclaok.id === null,
            status: false
        };

        this.usuariosService.recriarUsuarioKeycloak(usuario).subscribe(() => {
            this.notificacaoService.showSuccessMessage('Usuário recriado no keycloak com sucesso!');
            $('.modal').modal('hide');
            this.obter.apply(this, this.lastObter);
        });
    }

    loggedUserIsBKO(): boolean {
        return this.authService.hasRole(Roles.boAdministrador)
            && !this.authService.user.participanteEstabelecimento
            && !this.authService.user.participanteFornecedor;
    }

    ngOnDestroy() {
        $('.modal').remove();
    }
}
