import { OnInit, Component, AfterViewInit } from '@angular/core';
import { FormControl, Validators, AbstractControl, FormGroup } from '@angular/forms';
import { CnpjFunctions } from '../../../core/functions/cnpj.functions';
import { NomeFunctions } from '../../../core/functions/nome.functions';
import { Router, ActivatedRoute } from '@angular/router';
import { FornecedorService } from '../../fornecedor.service';
import { DominioService } from 'src/app/dominio/dominio.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { FornecedorNumeroSteps, WizardFornecedor } from 'src/app/interfaces/fornecedor';
import { DocumentoService } from 'src/app/core/services/documento.service';
import { tags } from 'src/app/core/tags';

@Component({
  styleUrls: ['../cadastro-fornecedor.component.css'],
  templateUrl: './dados-cadastrais.component.html',
})
export class DadosCadastraisFornecedorComponent implements OnInit, AfterViewInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: FornecedorService,
    private dominioService: DominioService,
    private notification: NotificationService,
    private documentoService: DocumentoService,
  ) {}

  // PROPERTIES
  fornecedor;
  steps;
  blockId = false;
  wizardConfig = {
    stepValidation: () => this.validateForm(),
    adjustmentSessionStorage: () => this.saveObject(),
  };

  // FORM CONTROLS
  documento = new FormControl('', [
    Validators.required,
    (control: AbstractControl): { [key: string]: any } | null => {
      return CnpjFunctions.validator(control);
    },
  ]);
  inscricaoEstadual = new FormControl('');
  inscricaoMunicipal = new FormControl('', Validators.required);
  telefone = new FormControl('');

  razaoSocial = new FormControl('', Validators.required);
  nomeFantasia = new FormControl('', Validators.required);

  cep = new FormControl('', Validators.required);
  logradouro = new FormControl('', Validators.required);
  numero = new FormControl('', Validators.required);

  complemento = new FormControl('');
  bairro = new FormControl('', Validators.required);
  cidade = new FormControl('', Validators.required);

  // nome = new FormControl('', Validators.required);
  nome = new FormControl(
    '',
    Validators.compose([
      Validators.required,
      Validators.pattern(NomeFunctions.regexValidaNomeCompleto()),
    ]),
  );
  email = new FormControl('', [Validators.required, Validators.email]);
  celular = new FormControl('', Validators.required);

  // FORM GROUPS
  formFornecedorDadosCadastrais = new FormGroup({
    documento: this.documento,
    inscricaoEstadual: this.inscricaoEstadual,
    inscricaoMunicipal: this.inscricaoMunicipal,
    telefone: this.telefone,

    razaoSocial: this.razaoSocial,
    nomeFantasia: this.nomeFantasia,

    cep: this.cep,
    logradouro: this.logradouro,
    numero: this.numero,

    complemento: this.complemento,
    bairro: this.bairro,
    cidade: this.cidade,
  });

  formFornecedorDadosContato = new FormGroup({
    nome: this.nome,
    email: this.email,
    celular: this.celular,
  });

  formFornecedorCadastro = new FormGroup({
    dadosCadastrais: this.formFornecedorDadosCadastrais,
    dadosContato: this.formFornecedorDadosContato,
  });

  inscricaoEstadualIsenta = false;
  inscricaoMunicipalIsenta = false;

  // METHODS
  desabilitarInscricaoEstadual() {
    const value = this.inscricaoEstadualIsenta ? 'ISENTO' : '';
    this.inscricaoEstadual.setValue(value);
  }

  desabilitarInscricaoMunicipal() {
    const value = this.inscricaoMunicipalIsenta ? 'ISENTO' : '';
    this.inscricaoMunicipal.setValue(value);
  }

  obterEndereco(cep) {
    if (!cep) {
      return;
    }

    this.dominioService.obterEndereco(cep).subscribe(endereco => {
      this.logradouro.setValue(endereco.end);
      this.bairro.setValue(endereco.bairro);
      this.cidade.setValue(endereco.cidadeId);
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.setSteps();
      if (!params.back && !params.edicao) {
        this.service.resetFornecedor();
        this.setSteps();
        return;
      }
      this.fornecedor = this.service.getFornecedorSessionStorage();
      if (params.edicao || (params.back && this.fornecedor.id)) {
        this.blockId = true;
      }

      if (this.fornecedor) {
        this.documento.setValue(this.fornecedor.documento);
        this.inscricaoEstadual.setValue(this.fornecedor.inscricaoEstadual);
        this.inscricaoMunicipal.setValue(this.fornecedor.inscricaoMunicipal);
        this.inscricaoEstadualIsenta = this.fornecedor.inscricaoEstadual === 'ISENTO';
        this.inscricaoMunicipalIsenta = this.fornecedor.inscricaoMunicipal === 'ISENTO';
        this.telefone.setValue(this.fornecedor.telefone);
        this.razaoSocial.setValue(this.fornecedor.razaoSocial);
        this.nomeFantasia.setValue(this.fornecedor.nome);
        this.cep.setValue(this.fornecedor.cep);
        this.logradouro.setValue(this.fornecedor.logradouro);
        this.numero.setValue(this.fornecedor.numero);
        this.complemento.setValue(this.fornecedor.complemento);
        this.bairro.setValue(this.fornecedor.bairro);

        if (this.fornecedor.contato) {
          this.nome.setValue(this.fornecedor.contato.nome);
          this.email.setValue(this.fornecedor.contato.email);
          this.celular.setValue(this.fornecedor.contato.celular);
        }
      }
    });
  }

  ngAfterViewInit() {
    this.cidade.setValue(this.fornecedor.cidadeId);
  }

  setSteps() {
    const wizardSessionStorage = JSON.parse(sessionStorage.getItem('wizardFornecedor'));
    this.steps = wizardSessionStorage ? wizardSessionStorage : WizardFornecedor.steps;
    this.steps.forEach((step, i) => {
      if (i === FornecedorNumeroSteps.dadosCadastrais) {
        step.url = `/fornecedor/dados-cadastrais`;
        step.cursor = 'pointer';
        step.class = 'active';
      } else if (i < FornecedorNumeroSteps.dadosCadastrais) {
        step.class = 'activated';
      } else {
        step.class = '';
      }
      step.param = true;
    });
    sessionStorage.setItem('wizardFornecedor', JSON.stringify(this.steps));
  }

  _obterErrosFormulario = (form: any) => {
    const errors: any = {};

    Object.keys(form.controls).forEach(control => {
      const controlErrors = form.controls[control].errors;

      if (controlErrors) {
        Object.keys(controlErrors).forEach(errorName => {
          errors[errorName] = controlErrors[errorName];
        });
      }
    });

    return errors;
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    this.saveObject();
    this.router.navigateByUrl('fornecedor/domicilio-bancario');
  }

  validateForm() {
    for (const control in this.formFornecedorDadosCadastrais.controls) {
      if (this.formFornecedorDadosCadastrais.controls[control]) {
        this.formFornecedorDadosCadastrais.controls[control].markAsDirty();
      }
    }

    for (const control in this.formFornecedorDadosContato.controls) {
      if (this.formFornecedorDadosContato.controls[control]) {
        this.formFornecedorDadosContato.controls[control].markAsDirty();
      }
    }

    if (!this.formFornecedorCadastro.valid) {
      const errosControlesCadastrais = this._obterErrosFormulario(
        this.formFornecedorCadastro.controls.dadosCadastrais,
      );
      const errosControlesContato = this._obterErrosFormulario(
        this.formFornecedorCadastro.controls.dadosContato,
      );

      if (errosControlesCadastrais.cnpj) {
        this.notification.showErrorMessage('Verifique o campo CNPJ antes de prosseguir!');
        return false;
      }

      if (errosControlesContato.email) {
        this.notification.showErrorMessage('Verifique o campo E-mail antes de prosseguir!');
        return false;
      }

      this.notification.showErrorMessage('Verifique os campos obrigatórios antes de prosseguir!');
      return false;
    }
    return true;
  }

  saveObject() {
    let fornecedor = { ...this.formFornecedorDadosCadastrais.value };
    fornecedor.contato = { ...this.formFornecedorDadosContato.value };

    fornecedor.cidadeId = fornecedor.cidade;
    fornecedor.nome = fornecedor.nomeFantasia;

    delete fornecedor.cidade;
    delete fornecedor.nomeFantasia;

    if (this.fornecedor) {
      fornecedor = Object.assign({}, this.fornecedor, fornecedor);
    }

    this.service.saveFornecedorSessionStorage(fornecedor);
  }

  checkDocumentExistence(documento: string) {
    this.documentoService.checkDocumentExistence(documento).subscribe(documents => {
      documents.forEach(o => {
        const msg = tags['status-documento-' + o.statusDocumento];
        this.notification.showInfoMessage(msg);
      });
    });
  }
}
