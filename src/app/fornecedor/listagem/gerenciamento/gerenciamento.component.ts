import { Component, ViewChild, TemplateRef, AfterViewInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { AlpeTabs } from '../../../core/components/alpe-tabs/alpe-tabs.component';
import { ActivatedRoute, Params } from '@angular/router';

@Component({
    templateUrl: './gerenciamento.component.html'
})
export class GerenciamentoFornecedorComponent implements AfterViewInit {
    constructor(
        private route: ActivatedRoute,
    ) { }

    @ViewChild('fornecedoresCadastrados') fornecedoresCadastrados: TemplateRef<any>;
    @ViewChild('fornecedoresPendentes') fornecedoresPendentes: TemplateRef<any>;
    @ViewChild('fornecedoresCancelados') fornecedoresCancelados: TemplateRef<any>;

    de = new FormControl('');
    ate = new FormControl('');
    documento = new FormControl('');
    id = new FormControl('');

    formPesquisa = new FormGroup({
        de: this.de,
        ate: this.ate,
        documento: this.documento,
        id: this.id,
    });

    filters: any;

    tabs: AlpeTabs[];

    hasError = {
        de: () => {
            if (new Date(this.de.value) > new Date(this.ate.value)) {
                return 'Range de datas inválidas';
            }
        },
        ate: () => {
            if (new Date(this.de.value) > new Date(this.ate.value)) {
                return 'Range de datas inválidas';
            }
        },
    };

    ngAfterViewInit() {
        this.tabs = [
            { label: 'Cadastrados', template: this.fornecedoresCadastrados },
            { label: 'Pendentes', template: this.fornecedoresPendentes },
            { label: 'Cancelados', template: this.fornecedoresCancelados },
        ];

        this.route.params.subscribe(params => this.paramsChanged(params));
    }

    paramsChanged(params: Params) {
        const aba = params.aba || 'cadastrados';

        this.tabs[0].active = aba === 'cadastrados';
        this.tabs[1].active = aba === 'pendentes';
        this.tabs[2].active = aba === 'cancelados';

        this.setFilters();
    }

    isViewingRegistered() {
        return this.tabs && this.tabs[0] && this.tabs[0].active;
    }

    setFilters() {
        const parameters: any = {};

        if (this.de.value) {
            parameters.dataInicioSolicitacao = this.de.value.toJSON();
        }

        if (this.ate.value) {
            parameters.dataFimSolicitacao = this.ate.value.toJSON();
        }

        if (this.documento.value) {
            parameters.documento = this.documento.value;
        }

        if (this.id.enabled && this.id.value) {
            parameters.id = this.id.value;
        }

        this.filters = parameters;
    }

    clear() {
        this.formPesquisa.reset();
        this.setFilters();
    }

}
