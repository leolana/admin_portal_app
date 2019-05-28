import { ActivatedRoute } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { AfterViewInit, ViewChild, TemplateRef, Component } from '@angular/core';
import { AlpeTabs } from '../../core/components/alpe-tabs/alpe-tabs.component';
import { NumberFunctions } from 'src/app/core/functions/number.functions';

@Component({
    templateUrl: './meus-estabelecimentos.component.html',
    styleUrls: ['./meus-estabelecimentos.component.css']
})
export class MeusEstabelecimentosComponent implements AfterViewInit {
    constructor(
        private route: ActivatedRoute,
    ) { }

    @ViewChild('ecsAprovados') ecsAprovados: TemplateRef<any>;
    @ViewChild('ecsPendentes') ecsPendentes: TemplateRef<any>;
    @ViewChild('ecsReprovados') ecsReprovados: TemplateRef<any>;
    @ViewChild('ecsCancelados') ecsCancelados: TemplateRef<any>;

    // PROPERTIES
    controls = {
        nome: new FormControl(null),
        documento: new FormControl(null),
        dataCadastroInicio: new FormControl(null),
        dataCadastroFim: new FormControl(null)
    };
    form = new FormGroup(this.controls);

    filters: any;

    tabs: AlpeTabs[];

    // METHODS
    ngAfterViewInit() {
        this.tabs = [{
            label: 'Aprovados',
            template: this.ecsAprovados
        }, {
            label: 'Pendentes',
            template: this.ecsPendentes
        }, {
            label: 'Reprovados',
            template: this.ecsReprovados
        }, {
            label: 'Cancelados',
            template: this.ecsCancelados
        }];

        this.route.params.subscribe(params => this.paramsChanged(params));
    }

    paramsChanged(params) {
        const aba = params.aba || 'aprovados';

        this.tabs[0].active = aba === 'aprovados';
        this.tabs[1].active = aba === 'pendentes';
        this.tabs[2].active = aba === 'reprovados';
        this.tabs[3].active = aba === 'cancelados';

        this.setFilters();
    }

    setFilters() {
        const params: any = {};

        Object.keys(this.controls).forEach(key => {
            const value = this.controls[key].value;

            if (value) {
                params[key] = value;
            }
        });

        if (this.controls.nome.value) {
            params.nome = this.controls.nome.value;
        }

        if (this.controls.documento.value) {
            params.documento = NumberFunctions.removeNonDigits(this.controls.documento.value);
        }

        if (this.controls.dataCadastroInicio.value) {
            params.dataCadastroInicio = this.controls.dataCadastroInicio.value.toJSON();
        }

        if (this.controls.dataCadastroFim.value) {
            params.dataCadastroFim = this.controls.dataCadastroFim.value.toJSON();
        }

        this.filters = params;
    }

    reset() {
        this.form.reset();
        this.setFilters();
    }
}
