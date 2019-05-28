import { Component, OnInit, Input, AfterContentInit } from '@angular/core';
import { TiposPessoa } from 'src/app/interfaces';
import { Router } from '@angular/router';
import { CredenciamentoNumeroSteps } from 'src/app/interfaces/credenciamento';
import { CredenciamentoValidatorService } from './../credenciamento-validator.service';
import { FornecedorValidatorService } from 'src/app/fornecedor/fornecedor-validator.service';

declare const $: any;
@Component({
  selector: 'app-wizard',
  templateUrl: './wizard.component.html',
  styleUrls: ['./wizard.component.css'],
})
export class WizardComponent implements OnInit {
  @Input() progressLine;
  @Input() steps;
  @Input() tipoPessoa;
  @Input() config;
  @Input() fornecedor = false;
  width;

  constructor(
    private router: Router,
    private validatorCredenciamentoService: CredenciamentoValidatorService,
    private validatorFornecedorService: FornecedorValidatorService,
  ) {}

  private stepsErrors = [];

  ngOnInit(): void {
    this.wizardWidthCalc();
    this.fornecedor ? this.validaStepsFornecedor() : this.validaStepsCredenciamento();
  }

  goTo(step) {
    const params: any = {};
    if (!step.url) return;
    if (!this.config.stepValidation()) return;

    this.config.adjustmentSessionStorage();

    if (step.param) {
      params.back = step.param;
    }
    if (sessionStorage.getItem('credenciamentoEdicao')) {
      params.edicao = true;
    }
    this.router.navigate([step.url, params]);
  }

  wizardWidthCalc() {
    const index = this.steps.findIndex(step => step.class === 'active');
    if (this.fornecedor) {
      this.width = 100 / this.steps.length;
      this.progressLine = +this.width * (index + 1);
    } else if (this.tipoPessoa === TiposPessoa.fisica) {
      this.width = 100 / (this.steps.length - 1);
      this.progressLine = +this.width * (index || 1);
      this.steps[CredenciamentoNumeroSteps.dadosSocietarios].escondido = true;
    } else {
      this.width = 100 / this.steps.length;
      this.progressLine = +this.width * (index + 1);
      this.steps[CredenciamentoNumeroSteps.dadosSocietarios].escondido = false;
    }
    const sessionName = this.fornecedor ? 'wizardFornecedor' : 'wizard';
    sessionStorage.setItem(sessionName, JSON.stringify(this.steps));
  }

  validaStepsFornecedor() {
    this.validatorFornecedorService.validaSteps();
    this.validatorFornecedorService.errorSender.subscribe(stepsErrors => {
      this.stepsErrors = Object.values(stepsErrors);
      const stepsValid = this.stepsErrors.filter(step => step);
      sessionStorage.setItem('stepsValidationErrorsForn', stepsValid.length.toString());
    });
  }

  validaStepsCredenciamento() {
    this.validatorCredenciamentoService.validaSteps();
    this.validatorCredenciamentoService.errorSender.subscribe(stepsErrors => {
      this.stepsErrors = Object.values(stepsErrors);
      const stepsValid = this.stepsErrors.filter(step => step);
      sessionStorage.setItem('stepsValidationErrors', stepsValid.length.toString());
    });
  }

  setStepError(step) {
    return this.stepsErrors[step];
  }
}
