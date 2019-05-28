import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { DialogService } from '../../core/dialog/dialog.service';
import { AlpeTabs } from '../../core/components/alpe-tabs/alpe-tabs.component';
import { UsuariosConviteAtivoComponent } from '../por-status/convidado/usuarios-convite-ativo.component';
import { UsuariosConviteExpiradoComponent } from '../por-status/expirado/usuarios-convite-expirado.component';
import { Router, ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { Roles } from 'src/app/core/auth/auth.roles';

export interface UsuarioViewModel {
    status: number;
    celular: string;
    email: string;
    id: string;
    nome: string;
    roles: string[];
}

export interface ConviteViewModel extends UsuarioViewModel {
    expiraEm: any;
}

@Component({
    templateUrl: './gerenciamento.component.html'
})
export class UsuariosGerenciamentoComponent implements AfterViewInit {
    constructor(
        private dialogService: DialogService,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService,

    ) { }

    @ViewChild('usuariosAtivos') usuariosAtivos: TemplateRef<any>;
    @ViewChild('usuariosInativos') usuariosInativos: TemplateRef<any>;
    @ViewChild('usuariosConviteAtivo') usuariosConviteAtivo: TemplateRef<any>;
    @ViewChild('usuariosConviteExpirado') usuariosConviteExpirado: TemplateRef<any>;

    @ViewChild('refletirInclusaoConvidados') refletirInclusaoConvidados: UsuariosConviteAtivoComponent;
    @ViewChild('refletirInclusaoExpirados') refletirInclusaoExpirados: UsuariosConviteExpiradoComponent;

    // PROPERTIES
    controls = {
        nomeParticipante: new FormControl(null),
    };
    form = new FormGroup(this.controls);

    filters: any;

    tabs: AlpeTabs[];

    ngAfterViewInit() {
        this.tabs = [
            { label: 'Ativos', template: this.usuariosAtivos},
            { label: 'Inativos', template: this.usuariosInativos },
            { label: 'Convidados', template: this.usuariosConviteAtivo },
            { label: 'Expirados', template: this.usuariosConviteExpirado }
        ];
        this.route.params.subscribe(params => this.paramsChanged(params));
    }

    paramsChanged(params) {
        const aba = params.aba || 'ativos';

        this.tabs[0].active = aba === 'ativos';
        this.tabs[1].active = aba === 'inativos';
        this.tabs[2].active = aba === 'convidados';
        this.tabs[3].active = aba === 'expirados';

        this.setFilters();
    }

    isViewingRegistered() {
        return this.tabs && this.tabs[0] && this.tabs[0].active;
    }

    setFilters() {
        const params: any = {};

        Object.keys(this.controls).forEach(key => {
            const value = this.controls[key].value;

            if (value) {
                params[key] = value;
            }
        });

        if (this.controls.nomeParticipante.value) {
            params.nomeParticipante = this.controls.nomeParticipante.value;
        }

        this.filters = params;
    }

    reset() {
        this.form.reset();
        this.setFilters();
    }


    adicionarUsuario() {
        this.router.navigateByUrl('usuario/cadastrar');
    }

    loggedUserIsBKO(): boolean {
        return this.authService.hasRole(Roles.boAdministrador)
            && !this.authService.user.participanteEstabelecimento
            && !this.authService.user.participanteFornecedor;
    }
}
