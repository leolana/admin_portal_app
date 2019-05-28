import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { CredenciamentoService } from '../credenciamento.service';
import { DominioService } from '../../dominio/dominio.service';

import { zip } from 'rxjs';
import { IDadosBancarios } from '../../interfaces/participante';
import { CredenciamentoSteps, Wizard, CredenciamentoNumeroSteps } from '../../interfaces/credenciamento/';
import { TiposPessoa } from '../../interfaces';
import { tap } from 'rxjs/operators';
import { NotificationService } from 'src/app/core/notification/notification.service';

@Component({
    templateUrl: './domicilio-bancario.component.html',
    styleUrls: ['./domicilio-bancario.component.css']
})
export class CredenciamentoDomicilioBancarioComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private credenciamentoService: CredenciamentoService,
        private dominioService: DominioService,
        private notification: NotificationService
    ) { }

    // PROPERTIES
    bancos: any[] = [];
    bandeiras: any[] = [];
    domicilio = new FormArray([], Validators.required);
    tiposPessoa = TiposPessoa;
    tipoPessoa = TiposPessoa.fisica;
    steps;
    loaded = false;
    wizardConfig = {
        stepValidation: () => this.validForm(),
        adjustmentSessionStorage: () => this.atualizaDadosSessionStorage()
    };

    // METHODS
    ngOnInit() {
        this.route.params.subscribe(params => {
            this.credenciamentoService.verificarCredenciamentoCorrente(params.pessoa);
            this.tipoPessoa = +sessionStorage.getItem('tipoPessoa');
        });

        zip(this.getBancos(), this.getBandeiras()).subscribe(() => {
            this.criaBandeirasForms();

            this.domicilio.controls.forEach((group: FormGroup, i) => {
                group.controls.banco.valueChanges.subscribe(id => {
                    this.domicilio.controls.slice(i + 1).forEach((nextGroup: FormGroup) => {
                        const nextBancoControl = nextGroup.controls.banco;
                        if (nextBancoControl.value !== id) {
                            nextGroup.controls.banco.setValue(id);
                        }
                    });
                });
            });
            this.loaded = true;
        });
        this.setSteps();
    }

    chaveDomicilio(d) { return `${d.banco.id}#${d.agencia}#${d.conta}-${d.digito}`; }

    criaBandeirasForms() {
        const session = JSON.parse(sessionStorage.getItem('domicilioBancario') || '[]');

        this.bandeiras.forEach(bandeira => {
            const stored = session.find(i => i.bandeira && (i.bandeira.id === bandeira.id));

            const group = new FormGroup({
                bandeira: new FormControl(bandeira),
                banco: new FormControl(stored ? (stored.banco && stored.banco.id) : '', Validators.required),
                agencia: new FormControl(stored ? stored.agencia : '', Validators.required),
                conta: new FormControl(stored ? stored.conta : '', Validators.required),
                digito: new FormControl(stored ? stored.digito : '', Validators.required)
            });

            this.domicilio.push(group);
        });
    }

    getBancos() {
        return this.dominioService.obterBancos().pipe(
            tap(bancos => this.bancos = bancos)
        );
    }

    getBandeiras() {
        return this.dominioService.obterBandeiras().pipe(
            tap(bandeiras => this.bandeiras = bandeiras)
        );
    }
    setSteps() {
        this.steps = JSON.parse(sessionStorage.getItem('wizard'));
        this.steps.forEach((step, i) => {
            if (i === CredenciamentoNumeroSteps.domicilioBancario) {
                step.url = `/credenciamento/${TiposPessoa.urls[this.tipoPessoa]}/domicilio-bancario`;
                step.cursor = 'pointer';
                step.class = 'active';
            } else if (i < CredenciamentoNumeroSteps.domicilioBancario) {
                step.class = 'activated';
            } else {
                step.class = '';
            }
        });
        sessionStorage.setItem('wizard', JSON.stringify(this.steps));
    }
    goBack() {
        this.credenciamentoService.retrocederCredenciamento(CredenciamentoSteps.domicilioBancario);
    }

    validForm() {
        const group: any = this.domicilio.controls[0];
        Object.keys(group.controls).forEach(controlName => {
            group.controls[controlName].markAsDirty();
        });

        if (!group.valid) {
            this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
            return false;
        }
        return true;
    }

    submitForm() {
        if (this.validForm()) {
            this.atualizaDadosSessionStorage();
            this.credenciamentoService.prosseguirCredenciamento(CredenciamentoSteps.domicilioBancario);
        }
    }

    atualizaDadosSessionStorage() {
        const existentes = JSON.parse(sessionStorage.getItem('domicilioBancario')) as any[];
        let domicilioBancario = this.domicilio.controls.map((control: any) => {
            const obj = control.value;
            obj.banco = this.bancos.find(b => b.id === obj.banco);
            obj.bandeira = control.controls.bandeira.value;

            return obj;
        });
        if (existentes) {
            existentes.forEach((e, i) => {
                const newValues = domicilioBancario[i];
                if (this.chaveDomicilio(newValues) !== this.chaveDomicilio(e)) {
                    e.newFile = true;
                    e.existing = false;
                    e.arquivo = null;
                }
                Object.assign(e, newValues);
            });
            sessionStorage.setItem('domicilioBancario', JSON.stringify(existentes));
        }else {
            domicilioBancario = domicilioBancario.map(d => ({
                ...d,
                newFile: true,
                existing: false,
                arquivo: null,
            }));
            sessionStorage.setItem('domicilioBancario', JSON.stringify(domicilioBancario));
        }
    }

    getNomeBancoPorId(control: FormControl): string {
        if (!control) {
            return '';
        }
        const id = control.value;
        const banco = this.bancos.find(b => b.id === id);
        return banco ? banco.text : '';
    }

}
