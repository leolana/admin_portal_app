import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { TiposPessoa } from '../../interfaces';
import { DominioService } from '../../dominio/dominio.service';
import { CredenciamentoService } from '../credenciamento.service';
import { CredenciamentoNumeroSteps } from '../../interfaces/credenciamento';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { TiposCaptura, ICapturaItem, ICaptura, CredenciamentoSteps } from '../../interfaces/credenciamento';

@Component({
    templateUrl: './captura.component.html',
    styleUrls: ['./captura.component.css']
})
export class CredenciamentoCapturaComponent implements OnInit {
    constructor(private location: Location,
        private route: ActivatedRoute,
        private dominioService: DominioService,
        private credenciamentoService: CredenciamentoService,
        private notification: NotificationService) {
        this.route.params.subscribe(params => {
            this.credenciamentoService.verificarCredenciamentoCorrente(params.pessoa);
            this.tipoPessoa = +sessionStorage.getItem('tipoPessoa');
        });
    }

    // FORM CONTROLS
    quantidades = new FormArray([]);
    valores = new FormArray([], Validators.required);
    url = new FormControl('');

    // FORM GROUP
    formCaptura = new FormGroup({
        quantidades: this.quantidades,
        valores: this.valores,
        url: this.url
    });


    // PROPERTIES
    tiposCaptura = TiposCaptura;
    tiposPessoa = TiposPessoa;
    tipoPessoa = TiposPessoa.fisica;
    steps;
    capturas: any[] = [];
    wizardConfig = {
        stepValidation: () => this.validForm(),
        adjustmentSessionStorage: () => this.atualizaDadosSessionStorage()
    };

    ngOnInit() {
        this.dominioService.obterCapturas().subscribe(response => {
            this.capturas = response;

            this.capturas.forEach(c => {
                c.quantidade = new FormControl();
                c.valor = new FormControl('', Validators.required);
                this.valores.push(c.valor);
                this.quantidades.push(c.quantidade);
            });
            this.preencheDadosAnterioresSeTiver();
        });
        this.setSteps();
    }
    preencheDadosAnterioresSeTiver() {
        const capturaSession = JSON.parse(sessionStorage.getItem('captura'));
        const inSessionStorage = [];

        if (capturaSession) {
            this.url.setValue(capturaSession.url);
            capturaSession.capturas.forEach(captura => {
                const index = this.capturas.findIndex(item => item.id === captura.id);
                inSessionStorage.push(this.capturas[index].id);
                if (index !== -1) {
                    this.quantidades.controls[index].setValue(captura.quantidade);
                    this.valores.controls[index].setValue(captura.valor);
                }
            });
        }
        this.resetarValores(inSessionStorage);
    }

    setSteps() {
        this.steps = JSON.parse(sessionStorage.getItem('wizard'));
        this.steps.forEach((step, i) => {
            if (i === CredenciamentoNumeroSteps.captura) {
                step.url = `/credenciamento/${TiposPessoa.urls[this.tipoPessoa]}/captura`;
                step.class = 'active';
                step.cursor = 'pointer';
            } else if (i < CredenciamentoNumeroSteps.captura) {
                step.class = 'activated';
            } else {
                step.class = '';
            }
        });
        sessionStorage.setItem('wizard', JSON.stringify(this.steps));
    }

    goBack() {
        this.credenciamentoService.retrocederCredenciamento(CredenciamentoSteps.captura);
    }

    validForm() {
        Object.keys(this.valores.controls).forEach(controlName => {
            this.valores.controls[controlName].markAsDirty();
        });

        if (!this.valores.valid) {
            this.notification.showAlertMessage('Verifique os campos de valor da captura antes de prosseguir!');
            return false;
        }

        const capturas = this.capturas.filter(c => +c.quantidade.value && c.quantidade.value > 0);
        if (!capturas.length) {
            this.notification.showAlertMessage('Você precisa selecionar pelo menos uma opção de captura.');
            return false;
        }
        if (!this.formCaptura.valid) {
            this.notification.showAlertMessage('Cadastre uma URL válida!');
            return false;
        }
        return true;
    }

    submitForm() {
        if (this.validForm()) {
            this.credenciamentoService.prosseguirCredenciamento(CredenciamentoSteps.captura);
            this.atualizaDadosSessionStorage();
        }
    }

    atualizaDadosSessionStorage() {
        const captura = this.getCaptura();
        sessionStorage.setItem('captura', JSON.stringify(captura));
    }

    getCaptura() {
        const _capturas: ICapturaItem[] = [];
        this.capturas.filter(c => +c.quantidade.value && c.quantidade.value > 0)
            .forEach(c => {
                _capturas.push({
                    id: c.id,
                    quantidade: +c.quantidade.value,
                    valor: c.valor.value,
                });
            });
        return { capturas: _capturas, url: this.url.value };
    }

    resetarValores(inSessionStorage = []) {
        this.dominioService.obterCapturas().subscribe(capturas => {
            capturas.forEach(captura => {
                const index = this.capturas.findIndex(item => item.id === captura.id);
                if (index !== -1 && !(inSessionStorage.includes(this.capturas[index].id))) {
                    this.valores.controls[index].setValue(captura.valor);
                }
            });
        });
    }
}
