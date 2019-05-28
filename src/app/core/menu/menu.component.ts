import { Component, OnInit, Injectable, OnDestroy } from '@angular/core';
import { Router, NavigationStart } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Roles } from '../auth/auth.roles';
import { MenuService } from './menu.service';
import { Subscription } from 'rxjs';

declare const $: any;

export interface MenuViewModel {
    bulletCredenciamentoPendente?: number;
    bulletEcPendenteCadastro?: number;
    bulletFornecedorPendenteCadastro?: number;
    bulletVinculosPendentes?: number;
    bulletCessoesPendentes?: number;
    podeVerExportacoes?: boolean;
}

export interface ExportProfile {
    habilitado: boolean;
}

@Component({
    selector: 'app-menu',
    templateUrl: './menu.component.html',
    styleUrls: ['../theme/theme.css']
})
@Injectable({ providedIn: 'root' })
export class MenuComponent implements OnInit, OnDestroy {
    constructor(
        public auth: AuthService,
        private router: Router,
        private menuService: MenuService
    ) { }

    roles = Roles;
    notificationsIntervalId: any;

    participantSubscription: Subscription;
    impersonateSubscription: Subscription;

    viewModel: MenuViewModel = {};

    ngOnInit() {
        this.router.events.subscribe(e => {
            if (e instanceof NavigationStart && window.innerWidth <= 768) {
                $('body').removeClass('sidebar-open');
            }
        });

        this.participantSubscription = this.auth.onParticipantChanged.subscribe(() => {
            this.refreshAll();
        });

        this.impersonateSubscription = this.auth.onImpersonated.subscribe(() => {
            this.refreshAll();
        });

        this.refreshAll();

        this.notificationsIntervalId = setInterval(() => {
            this.refreshNotifications();
        }, 30000);
    }

    refreshAll() {
        this.refreshNotifications();
        this.updateExportProfile();
    }

    refreshNotifications() {
        this.menuService
            .getMenuViewModel()
            .subscribe(menu => this.viewModel = Object.assign(this.viewModel, menu));
    }

    updateExportProfile() {
        if (this.auth.user.participanteEstabelecimento
            || this.auth.user.participanteFornecedor) {
            this.menuService
                .getExportPermission()
                .subscribe(profile => this.viewModel.podeVerExportacoes = profile.habilitado);
        } else {
            this.viewModel.podeVerExportacoes = false;
        }
    }

    authEstabelecimento() {
        return this.auth.hasRole(
            this.roles.ecCompras,
            this.roles.ecAdministrador,
            this.roles.ecFinanceiro
        );
    }

    authFornecedor() {
        return this.auth.hasRole(
            this.roles.fcComercial,
            this.roles.fcAdministrador,
            this.roles.fcFinanceiro
        );
    }

    authBackOffice() {
        return this.auth.hasRole(
            this.roles.boAdministrador,
            this.roles.boOperacoes
        );
    }

    isAdministrator() {
        return this.auth.hasRole(
            this.roles.boAdministrador,
            this.roles.ecAdministrador,
            this.roles.fcAdministrador
        );
    }

    userParticipanteEstabelecimento() {
        return this.auth.user.participanteEstabelecimento;
    }

    userParticipanteFornecedor() {
        return this.auth.user.participanteFornecedor;
    }

    ngOnDestroy() {
        if (this.notificationsIntervalId) {
            clearInterval(this.notificationsIntervalId);
        }

        if (this.participantSubscription) {
            this.participantSubscription.unsubscribe();
        }

        if (this.impersonateSubscription) {
            this.impersonateSubscription.unsubscribe();
        }
    }
}
