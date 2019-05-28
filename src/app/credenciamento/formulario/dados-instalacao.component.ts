import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, Validators, AbstractControl } from '@angular/forms';
import { CredenciamentoService } from '../credenciamento.service';
import { DominioService } from '../../dominio/dominio.service';
import { TiposPessoa } from '../../interfaces';
import {
  CredenciamentoSteps,
  Horarios,
  Wizard,
  CredenciamentoNumeroSteps,
} from '../../interfaces/credenciamento';
import { NomeFunctions } from '../../core/functions/nome.functions';
import { setStyles } from '@angular/animations/browser/src/util';
import { NotificationService } from 'src/app/core/notification/notification.service';

@Component({
  templateUrl: './dados-instalacao.component.html',
})
export class CredenciamentoDadosInstalacaoComponent implements OnInit, AfterViewInit {
  constructor(
    private cdRef: ChangeDetectorRef,
    private route: ActivatedRoute,
    private service: CredenciamentoService,
    private dominio: DominioService,
    private notification: NotificationService,
  ) {}

  // PROPERTIES
  tiposPessoa = TiposPessoa;
  tipoPessoa = TiposPessoa.fisica;
  horarios = Horarios;
  steps;
  loaded = false;
  semana = ['segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado', 'domingo'];

  // FORM CONTROLS
  cep = new FormControl('', Validators.required);
  logradouro = new FormControl('', Validators.required);
  numero = new FormControl('', Validators.required);
  complemento = new FormControl('');
  bairro = new FormControl('', Validators.required);
  cidade = new FormControl('', Validators.required);
  pontoReferencia = new FormControl('');
  horario = new FormControl('', Validators.required);
  segunda = new FormControl(false);
  terca = new FormControl(false);
  quarta = new FormControl(false);
  quinta = new FormControl(false);
  sexta = new FormControl(false);
  sabado = new FormControl(false);
  domingo = new FormControl(false);
  nome = new FormControl('', NomeFunctions.validatorNomeCompleto);
  email = new FormControl('', [Validators.required, Validators.email]);
  telefone = new FormControl('', Validators.required);
  celular = new FormControl('', Validators.required);

  // FORM GROUPS
  formEndereco = new FormGroup({
    cep: this.cep,
    logradouro: this.logradouro,
    numero: this.numero,
    complemento: this.complemento,
    bairro: this.bairro,
    cidade: this.cidade,
    pontoReferencia: this.pontoReferencia,
    horario: this.horario,
    segunda: this.segunda,
    terca: this.terca,
    quarta: this.quarta,
    quinta: this.quinta,
    sexta: this.sexta,
    sabado: this.sabado,
    domingo: this.domingo,
  });
  formContato = new FormGroup({
    nome: this.nome,
    email: this.email,
    telefone: this.telefone,
    celular: this.celular,
  });
  formInstalacao = new FormGroup({
    endereco: this.formEndereco,
    contato: this.formContato,
  });
  wizardConfig = {
    stepValidation: () => this.validForm(),
    adjustmentSessionStorage: () => this.atualizaDadosSessionStorage(),
  };

  // METHODS
  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.service.verificarCredenciamentoCorrente(params.pessoa);
      this.tipoPessoa = +sessionStorage.getItem('tipoPessoa');
      this.loaded = true;
    });

    this.setSteps();

    let dadosExistentes = JSON.parse(sessionStorage.getItem('dadosInstalacao'));

    if (dadosExistentes && dadosExistentes.dias) {
      // tslint:disable:no-bitwise
      const dias = {
        segunda: Boolean(dadosExistentes.dias & 1),
        terca: Boolean(dadosExistentes.dias & 2),
        quarta: Boolean(dadosExistentes.dias & 4),
        quinta: Boolean(dadosExistentes.dias & 8),
        sexta: Boolean(dadosExistentes.dias & 16),
        sabado: Boolean(dadosExistentes.dias & 32),
        domingo: Boolean(dadosExistentes.dias & 64),
      };
      // tslint:enable:no-bitwise

      dadosExistentes = Object.assign(dadosExistentes, dias);

      sessionStorage.setItem('dadosInstalacao', JSON.stringify(dadosExistentes));
    }
  }

  ngAfterViewInit(): void {
    const dadosInstalacao = JSON.parse(sessionStorage.getItem('dadosInstalacao'));
    if (this.loaded && dadosInstalacao) {
      this.cidade.setValue(dadosInstalacao.cidade);
      if (this.tipoPessoa === TiposPessoa.juridica) {
        const socio = JSON.parse(sessionStorage.getItem('dadosSocietarios')).find(s => s.contato);
        if (socio) {
          const edicao = sessionStorage.getItem('credenciamentoEdicao');
          const analise = sessionStorage.getItem('credenciamentoEmAnalise');
          edicao || analise
            ? this.setValueFormContato(dadosInstalacao)
            : this.setValueFormContato(socio);
        } else this.formContato.reset();
      }
      this.cdRef.detectChanges();
    }
  }

  setSteps() {
    this.steps = JSON.parse(sessionStorage.getItem('wizard'));
    this.steps.forEach((step, i) => {
      if (i === CredenciamentoNumeroSteps.dadosInstalacao) {
        step.url = `/credenciamento/${TiposPessoa.urls[this.tipoPessoa]}/dados-instalacao`;
        step.class = 'active';
        step.cursor = 'pointer';
      } else if (i < CredenciamentoNumeroSteps.dadosInstalacao) {
        step.class = 'activated';
      } else {
        step.class = '';
      }
    });
    sessionStorage.setItem('wizard', JSON.stringify(this.steps));
  }
  obterEndereco(cep) {
    if (cep) {
      this.dominio.obterEndereco(cep).subscribe(endereco => {
        this.logradouro.setValue(endereco.end);
        this.bairro.setValue(endereco.bairro);
        this.cidade.setValue(endereco.cidadeId);
      });
    }
  }

  goBack() {
    if (this.tipoPessoa === this.tiposPessoa.juridica) {
      this.service.retrocederCredenciamento(CredenciamentoSteps.dadosInstalacao, 'juridica');
    } else {
      this.service.retrocederCredenciamento(CredenciamentoSteps.dadosInstalacao);
    }
  }

  _obterErrosFormulario = (form: AbstractControl) => {
    return Object.keys(form['controls'])
      .map(key => form['controls'][key])
      .filter(control => !!control.errors)
      .map(control => control.errors)
      .reduce((errors, error, index) => {
        const property = Object.keys(error)[0];
        errors[property] = error[property];
        return errors;
      }, {});
  }

  validForm() {
    Object.keys(this.formEndereco.controls).forEach(k =>
      this.formEndereco.controls[k].markAsDirty(),
    );
    Object.keys(this.formContato.controls).forEach(k => this.formContato.controls[k].markAsDirty());

    if (!this.formInstalacao.valid) {
      const errosControlesEndereco = this._obterErrosFormulario(
        this.formInstalacao.controls.endereco,
      );
      const errosControlesContato = this._obterErrosFormulario(this.formInstalacao.controls.contato);
      if (!!errosControlesContato['email']) {
        this.notification.showAlertMessage('Verifique o campo Email antes de prosseguir!');
        return false;
      }
      if (!!errosControlesEndereco['pattern']) {
        this.notification.showAlertMessage('Verifique o campo Endereço antes de prosseguir!');
        return false;
      }
      this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
      return false;
    }

    if (!this._calcularDiasParaInstalacao()) {
      this.notification.showAlertMessage('Selecione ao menos um dia para instalação.');
      return false;
    }

    return true;
  }

  submitForm() {
    if (this.validForm()) {
      this.atualizaDadosSessionStorage();
      const dadosInstalacao = this.getParams();
      this.service.prosseguirCredenciamento(CredenciamentoSteps.dadosInstalacao, dadosInstalacao);
    }
  }

  atualizaDadosSessionStorage() {
    const params = this.getParams();

    const dias = this._calcularDiasParaInstalacao();

    const session = JSON.parse(sessionStorage.getItem('dadosInstalacao'));
    session.dias = dias;
    session.cidade = params.cidade;
    sessionStorage.setItem('dadosInstalacao', JSON.stringify(session));
  }

  getParams() {
    return {
      ...this.formEndereco.value,
      ...this.formContato.value,
    };
  }

  _calcularDiasParaInstalacao() {
    const dias = this.semana.reduce((acc, dia, bit) => {
      return acc + 2 ** bit * +!!this.formEndereco.controls[dia].value;
    }, 0);

    return dias;
  }

  selectAllDays(event) {
    if (+event.target.value === this.horarios.horarioComercial) {
      this.semana.forEach((dia, i) => this.formEndereco.controls[dia].setValue(i !== 5 && i !== 6));
    }
  }

  setValueFormContato(dadosContato) {
    this.nome.setValue(dadosContato.nome);
    this.email.setValue(dadosContato.email);
    this.telefone.setValue(dadosContato.telefone);
    this.celular.setValue(dadosContato.celular);
  }
}
