import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CredenciamentoService } from '../credenciamento.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { TiposPessoa } from '../../interfaces';
import { ISocio } from '../../interfaces/participante';
import {
  CredenciamentoSteps,
  Wizard,
  CredenciamentoNumeroSteps,
} from '../../interfaces/credenciamento';
import { NomeFunctions } from '../../core/functions/nome.functions';
import { CpfFunctions } from '../../core/functions/cpf.functions';
import { CnpjFunctions } from '../../core/functions/cnpj.functions';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { DataFunctions } from './../../core/functions/data.functions';

@Component({ templateUrl: './dados-societarios.component.html' })
export class CredenciamentoDadosSocietariosComponent implements OnInit {
  constructor(
    private location: Location,
    private credenciamentoService: CredenciamentoService,
    private promptService: PromptService,
    private notification: NotificationService,
  ) {}

  tiposPessoa = TiposPessoa;
  steps;
  contatoOn = true;

  socios = new FormArray([], Validators.required);
  inscricoes = new Array();

  sociosStorage: ISocio[];

  wizardConfig = {
    stepValidation: () => this.validForm(),
    adjustmentSessionStorage: () => this.atualizaDadosSessionStorage(),
  };

  ngOnInit(): void {
    this.credenciamentoService.verificarCredenciamentoCorrente('pessoa-juridica');

    this.sociosStorage = JSON.parse(sessionStorage.getItem('dadosSocietarios'));

    if (this.sociosStorage && JSON.stringify(this.sociosStorage) !== '{}') {
      this.preencheDadosExistentes();
    } else {
      const { nomeContato, emailContato, telefoneContato, celularContato } = JSON.parse(
        sessionStorage.getItem('contato'),
      );

      this.adicionarSocio(TiposPessoa.fisica, {
        nome: nomeContato,
        telefone: telefoneContato,
        celular: celularContato,
        email: emailContato,
        contato: true,
      });
    }
    this.contatoOn = false;

    this.setSteps();
  }

  changeValidationsForTipoPessoa(form: FormGroup, idTipoPessoa: number): void {
    if (idTipoPessoa === TiposPessoa.fisica) {
      form.controls.nome.setValidators(NomeFunctions.validatorNomeCompleto);
      form.controls.celular.setValidators(Validators.required);
      form.controls.documento.setValidators(CpfFunctions.validator);

      form.controls.razaoSocial.clearValidators();
      form.controls.inscricaoEstadual.clearValidators();
      form.controls.inscricaoMunicipal.clearValidators();
    } else {
      form.controls.nome.setValidators(Validators.required);
      form.controls.celular.clearValidators();
      form.controls.documento.setValidators(CnpjFunctions.validator);

      form.controls.contato.setValue(false);
      form.controls.razaoSocial.setValidators(Validators.required);
      form.controls.inscricaoEstadual.setValidators(Validators.required);
      form.controls.inscricaoMunicipal.setValidators(Validators.required);
    }

    form.controls.documento.updateValueAndValidity();
    form.controls.celular.updateValueAndValidity();
    form.controls.razaoSocial.updateValueAndValidity();
    form.controls.inscricaoEstadual.updateValueAndValidity();
    form.controls.inscricaoMunicipal.updateValueAndValidity();
  }

  createNewFormSocio(idTipoPessoa = TiposPessoa.fisica, dadosContato: any = {}): FormGroup {
    const form = new FormGroup({
      id: new FormControl(null),
      tipoPessoa: new FormControl(idTipoPessoa),
      nome: new FormControl(dadosContato.nome || ''),
      documento: new FormControl(),
      telefone: new FormControl(dadosContato.telefone || '', Validators.required),
      aberturaNascimento: new FormControl('', [
        Validators.required,
        DataFunctions.validatorDataFutura,
      ]),
      email: new FormControl(dadosContato.email || '', [Validators.required, Validators.email]),
      participacao: new FormControl(0, [Validators.required, Validators.min(0.01)]),
      contato: new FormControl(dadosContato.contato || this.contatoOn),
      celular: new FormControl(dadosContato.celular || ''),
      razaoSocial: new FormControl(),
      inscricaoEstadual: new FormControl(),
      inscricaoMunicipal: new FormControl(),
    });

    form.controls.tipoPessoa.valueChanges.subscribe(value => {
      this.changeValidationsForTipoPessoa(form, +value);
    });

    this.habilitarContato(form);

    return form;
  }

  habilitarContato(form: FormGroup) {
    form.controls.contato.valueChanges.subscribe(value => {
      if (value) {
        const checked: any = this.socios.controls.find((f: any) => {
          return f !== form && f.controls.contato.value;
        });
        if (checked) {
          const nome = checked.controls.nome.value;
          const msg = nome
            ? `${nome} não será mais contato para instalação.`
            : `Já existe outro sócio marcado como contato.`;
          this.promptService.confirm(msg + ' Deseja continuar?').then(yes => {
            if (yes) checked.controls.contato.setValue(false);
            else form.controls.contato.setValue(false);
          });
        }
      }
    });
  }

  preencheDadosExistentes() {
    this.sociosStorage.forEach(socio => {
      const group = this.createNewFormSocio(socio.tipoPessoa);
      if (socio.contato) {
        if (!this.contatoOn) {
          socio.contato = false;
        }
        this.contatoOn = false;
      }

      group.controls.id.setValue(socio.id);
      group.controls.contato.setValue(socio.contato);
      group.controls.nome.setValue(socio.nome);
      group.controls.documento.setValue(socio.documento);
      group.controls.celular.setValue(socio.celular);
      group.controls.razaoSocial.setValue(socio.razaoSocial);
      group.controls.inscricaoEstadual.setValue(socio.inscricaoEstadual);
      group.controls.inscricaoMunicipal.setValue(socio.inscricaoMunicipal);
      group.controls.telefone.setValue(socio.telefone);
      group.controls.aberturaNascimento.setValue(socio.aberturaNascimento);
      group.controls.email.setValue(socio.email);
      group.controls.participacao.setValue(socio.participacao);
      this.changeValidationsForTipoPessoa(group, socio.tipoPessoa);

      this.socios.push(group);
      this.inscricoes.push({
        inscricaoEstadualIsencao: group.value.inscricaoEstadualIsencao,
        inscricaoMunicipalIsencao: group.value.inscricaoMunicipalIsencao,
      });
    });
  }

  setSteps() {
    this.steps = JSON.parse(sessionStorage.getItem('wizard'));
    this.steps.forEach((step, i) => {
      if (i === CredenciamentoNumeroSteps.dadosSocietarios) {
        step.url = `/credenciamento/pessoa-juridica/dados-societarios`;
        step.cursor = 'pointer';
        step.class = 'active';
      } else if (i < CredenciamentoNumeroSteps.dadosSocietarios) {
        step.class = 'activated';
      } else {
        step.class = '';
      }
    });
    sessionStorage.setItem('wizard', JSON.stringify(this.steps));
  }

  adicionarSocio(tipoPessoa = TiposPessoa.fisica, socio: any = {}): void {
    const group = this.createNewFormSocio(tipoPessoa, socio);
    this.changeValidationsForTipoPessoa(group, TiposPessoa.fisica);

    this.socios.push(group);
    this.inscricoes.push({
      inscricaoEstadualIsencao: group.value.inscricaoEstadualIsencao,
      inscricaoMunicipalIsencao: group.value.inscricaoMunicipalIsencao,
    });
  }

  removerSocio(index, event) {
    const promise = this.socios.at(index).dirty
      ? this.promptService.confirm(
          `Deseja mesmo remover ${this.socios.at(index).value.nome || 'este sócio'}?`,
        )
      : Promise.resolve(true);

    promise.then(result => {
      if (result) {
        this.socios.removeAt(index);
        this.inscricoes.splice(index, 1);
      }
    });

    event.stopPropagation();
  }

  goBack() {
    this.credenciamentoService.retrocederCredenciamento(CredenciamentoSteps.dadosSocietarios);
  }

  validForm() {
    let sum = 0;
    for (let g = 0; g < this.socios.controls.length; g++) {
      Object.keys(this.socios.controls[g]['controls']).forEach(k =>
        this.socios.controls[g]['controls'][k].markAsDirty(),
      );

      sum += this.socios.controls[g]['controls'].participacao.value;
    }
    if (!this.socios.valid) {
      const obterErrosListaCampos = (errors, error, index) => {
        const property = Object.keys(error)[0];
        errors[property] = error[property];
        return errors;
      };

      const controlsErrors = this.socios.controls
        .map(form =>
          Object.keys(form['controls'])
            .map(key => form['controls'][key])
            .filter(control => !!control.errors)
            .map(control => control.errors)
            .reduce(obterErrosListaCampos, {}),
        )
        .reduce(obterErrosListaCampos, {});

      if (!!controlsErrors['cpf']) {
        this.notification.showAlertMessage('Verifique o campo CPF antes de prosseguir!');
        return false;
      }

      if (!!controlsErrors['data']) {
        this.notification.showAlertMessage(
          'Verifique o campo Data de Nascimento antes de prosseguir!',
        );
        return false;
      }

      if (!!controlsErrors['email']) {
        this.notification.showAlertMessage('Verifique o campo E-mail antes de prosseguir!');
        return false;
      }

      if (!!controlsErrors['dataFutura']) {
        this.notification.showAlertMessage(controlsErrors['dataFutura']);
        return false;
      }

      this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
      return false;
    }
    if (sum !== 100) {
      this.notification.showAlertMessage('A soma das participações não somam 100%');
      return false;
    }
    return true;
  }

  submitForm() {
    if (this.validForm()) {
      this.atualizaDadosSessionStorage();
      this.credenciamentoService.prosseguirCredenciamento(CredenciamentoSteps.dadosSocietarios);
    }
  }

  atualizaDadosSessionStorage() {
    const dadosSocietarios: ISocio[] = [];

    Object.keys(this.socios.controls).forEach(k => {
      this.socios.controls[k].controls.contato.setValue(
        !!this.socios.controls[k].controls.contato.value,
      );
      dadosSocietarios.push(this.socios.controls[k].value);
    });
    if (!Boolean(sessionStorage.getItem('credenciamentoEmAnalise'))) {
      dadosSocietarios.forEach(s => {
        delete s.id;
      });
    }

    sessionStorage.setItem('dadosSocietarios', JSON.stringify(dadosSocietarios));
  }

  desabilitarInscricaoEstadual(group: FormGroup, index) {
    const value = this.inscricoes[index].inscricaoEstadualIsencao ? 'ISENTO' : '';
    group.controls.inscricaoEstadual.setValue(value, { onlySelf: true });
  }

  desabilitarInscricaoMunicipal(group: FormGroup, index) {
    const value = this.inscricoes[index].inscricaoMunicipalIsencao ? 'ISENTO' : '';
    group.controls.inscricaoMunicipal.setValue(value, { onlySelf: true });
  }
}
