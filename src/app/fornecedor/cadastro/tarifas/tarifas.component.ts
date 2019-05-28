import { OnInit, Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { FornecedorService } from '../../fornecedor.service';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { UsuariosService, VerificacaoUsuarioEnum } from 'src/app/usuarios/usuarios.service';
import { participanteTaxaTipo } from 'src/app/interfaces/participante';
import { FornecedorNumeroSteps } from 'src/app/interfaces/fornecedor';

@Component({
  styleUrls: ['../cadastro-fornecedor.component.css'],
  templateUrl: './tarifas.component.html',
})
export class TarifasFornecedorComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private service: FornecedorService,
    private prompt: PromptService,
    private notification: NotificationService,
    private usuariosService: UsuariosService,
  ) {}

  // PROPERTIES
  fornecedor;
  valorFinalMaximo = 9999999999.99;
  taxasEdicaoCessao = [];
  taxasEdicaoAntecipacao;
  taxasExcluidas = [];
  steps;
  wizardConfig = {
    stepValidation: () => this.validateForm(),
    adjustmentSessionStorage: () => {
      const fornecedor = this.mapFornecedor();
      this.service.saveFornecedorSessionStorage(fornecedor);
    },
  };

  // FORMS

  taxasCessao: FormGroup[] = [];
  taxa = new FormControl('', Validators.required);

  formTarifasAntecipacao = new FormGroup({
    taxa: this.taxa,
  });

  // METHODS
  ngOnInit() {
    this.route.params.subscribe(params => {
      this.setSteps();
      this.fornecedor = this.service.getFornecedorSessionStorage();
      if (!this.fornecedor.taxas) this.adicionaTaxaCessao();
      if (this.fornecedor.taxas) {
        this.taxasEdicaoAntecipacao =
          this.fornecedor.taxas.antecipacao ||
          this.fornecedor.taxas.filter(
            t => t.participanteTaxaTipo === participanteTaxaTipo.antecipacao,
          )[0];
        this.taxasEdicaoCessao =
          this.fornecedor.taxas.cessao ||
          this.fornecedor.taxas.filter(t => t.participanteTaxaTipo === participanteTaxaTipo.cessao);

        this.formTarifasAntecipacao.controls.taxa.setValue(this.taxasEdicaoAntecipacao.taxa);
        this.taxasEdicaoCessao.length
          ? this.taxasEdicaoCessao.forEach(taxa => this.adicionaTaxaCessao(taxa))
          : this.adicionaTaxaCessao();
      }
    });
  }

  setSteps() {
    this.steps = JSON.parse(sessionStorage.getItem('wizardFornecedor'));
    this.steps.forEach((step, i) => {
      if (i === FornecedorNumeroSteps.tarifas) {
        step.url = `/fornecedor/tarifas`;
        step.cursor = 'pointer';
        step.class = 'active';
      } else if (i < FornecedorNumeroSteps.tarifas) {
        step.class = 'activated';
      } else {
        step.class = '';
      }
    });
    sessionStorage.setItem('wizardFornecedor', JSON.stringify(this.steps));
  }

  adicionaTaxaCessao(taxa = null) {
    let lastValorFim = 0.0;

    if (this.valoresCessaoInvalid()) {
      this.notification.showAlertMessage('Preencha todos os campos de valores de cessão');
      return;
    }

    if (this.valorInicioCessaoMaior()) {
      this.notification.showErrorMessage(
        'Valor de Cessão Inicial não pode ser superior que o Valor de Cessão Final',
      );
      return;
    }
    if (this.taxasCessao.length) {
      if (
        this.taxasCessao[this.taxasCessao.length - 1].get('valorFim').value >= this.valorFinalMaximo
      ) {
        this.notification.showAlertMessage('Valor Máximo de Cessão disponível atingido');
        return;
      }
    }
    if (!taxa && this.taxasCessao.length) {
      const ultimoControl = this.taxasCessao[this.taxasCessao.length - 1].get('valorFim');
      ultimoControl.disable();
      const strValor = (+ultimoControl.value + 0.01).toFixed(2);
      lastValorFim = parseFloat(strValor);
    }

    const formTarifasCessao = new FormGroup({
      participanteTaxaId: new FormControl(
        taxa ? { value: taxa.id || taxa.participanteTaxaId, disabled: true } : null,
      ),
      usuarioCriacao: new FormControl(taxa ? { value: taxa.usuarioCriacao, disabled: true } : null),
      dataInclusao: new FormControl(
        taxa ? { value: taxa.createdAt || taxa.participanteTaxaId, disabled: true } : null,
      ),
      valorInicio: new FormControl(
        taxa ? { value: taxa.valorInicio, disabled: true } : lastValorFim,
        Validators.required,
      ),
      valorFim: new FormControl(
        taxa ? { value: taxa.valorFim, disabled: true } : '',
        Validators.required,
      ),
      taxa: new FormControl(taxa ? { value: taxa.taxa, disabled: true } : '', Validators.required),
      participanteTaxaTipo: new FormControl(
        taxa ? { value: taxa.participanteTaxaTipo, disabled: true } : '',
      ),
    });
    if (taxa && !(taxa.id || taxa.participanteTaxaId)) formTarifasCessao.controls.taxa.enable();
    this.taxasCessao.push(formTarifasCessao);
    const ultimoValorInicio = this.taxasCessao[this.taxasCessao.length - 1].get('valorInicio');
    ultimoValorInicio.disable();
  }

  excluirTaxaCessao(taxa, i) {
    if (taxa.disabled) {
      this.prompt
        .confirm('A taxa cadastrada será excluída. Deseja continuar?', 'Aviso')
        .then(yes => {
          if (yes) {
            this.taxasCessao.splice(i, 1);
            if (this.taxasCessao.length) {
              const ultimo = this.taxasCessao[this.taxasCessao.length - 1];
              if (!ultimo.disabled) ultimo.get('valorFim').enable();
            }
            this.taxasExcluidas.push(taxa.value);
            if (!i) this.adicionaTaxaCessao();
          }
        });
    } else {
      this.taxasCessao.splice(i, 1);
      const ultimo = this.taxasCessao[this.taxasCessao.length - 1];
      if (!ultimo.disabled) ultimo.get('valorFim').enable();
    }
  }

  hideButton(index, taxa) {
    if (!index && taxa.disabled && this.taxasCessao.length === 1) return false;
    return !index || index !== this.taxasCessao.length - 1;
  }

  valoresCessaoInvalid() {
    for (let taxa = 0; taxa < this.taxasCessao.length; taxa++) {
      Object.keys(this.taxasCessao[taxa]['controls']).forEach(k =>
        this.taxasCessao[taxa]['controls'][k].markAsDirty(),
      );
      if (this.taxasCessao[taxa].invalid) {
        return true;
      }
    }
    return false;
  }

  valorInicioCessaoMaior() {
    return this.taxasCessao.some(
      taxa => +taxa.controls.valorInicio.value > +taxa.controls.valorFim.value,
    );
  }

  goBack() {
    this.router.navigate(['fornecedor/domicilio-bancario', { back: true }]);
  }

  /**
   * Verifica se o email existe para algum usuário.
   * Se sim, verifica se o usuário já tem vínculo com algum participante.
   * Retornará true se for permitido continuar a (edição/inclusão) do email.
   */
  verificaUsuarioEmail = async (email: string) => {
    const alterando = this.fornecedor.id;

    return await this.usuariosService
      .checaParticipantesDoUsuario(email, alterando, this.fornecedor.id)
      .then(result => {
        if (alterando && result === VerificacaoUsuarioEnum.existente) {
          return true;
        }
        return result === VerificacaoUsuarioEnum.novo || result === VerificacaoUsuarioEnum.vincular;
      });
  }

  submitForm() {
    if (!this.validateForm()) {
      return;
    }

    if (+sessionStorage.getItem('stepsValidationErrorsForn') > 0) {
      this.notification.showAlertMessage('Preencha as informações corretas em todos os passos');
      return;
    }

    const fornecedor = this.mapFornecedor();
    this.service.saveFornecedorSessionStorage(fornecedor);

    this.verificaUsuarioEmail(this.fornecedor.contato.email).then(emailOk => {
      if (!emailOk) return;

      this.service.salvar(fornecedor).subscribe(() => {
        const modo = this.fornecedor.id ? 'alterado' : 'cadastrado';
        this.notification.showSuccessMessage('Fornecedor ' + modo + ' com sucesso!');
        this.router.navigateByUrl('/fornecedor/gerenciamento/cadastrados');
        this.service.resetFornecedor();
      });
    });
  }

  validateForm(): any {
    this.taxa.markAsDirty();

    if (this.formTarifasAntecipacao.invalid || this.valoresCessaoInvalid()) {
      if (this.valorInicioCessaoMaior()) {
        this.notification.showErrorMessage(
          'Valor de Cessão Inicial não pode ser superior que o Valor de Cessão Final',
        );
        return false;
      }

      this.notification.showErrorMessage('Verifique os campos obrigatórios antes de prosseguir!');
      return false;
    }
    return true;
  }

  mapFornecedor() {
    let fornecedor = {
      taxas: {},
      taxasHistorico: {},
    };
    if (this.taxasEdicaoAntecipacao) {
      if (this.taxasEdicaoAntecipacao.taxa !== this.formTarifasAntecipacao.controls.taxa.value) {
        this.taxasEdicaoAntecipacao.participanteTaxaId = this.taxasEdicaoAntecipacao.id;
        this.taxasEdicaoAntecipacao.dataInclusao = this.taxasEdicaoAntecipacao.createdAt;
        delete this.taxasEdicaoAntecipacao.id;
        delete this.taxasEdicaoAntecipacao.createdAt;
        delete this.taxasEdicaoAntecipacao.updatedAt;
        if (
          !this.taxasExcluidas.some(
            t =>
              t.participanteTaxaTipo === participanteTaxaTipo.antecipacao &&
              t.taxa === this.taxasEdicaoAntecipacao.taxa,
          )
        ) {
          this.taxasExcluidas.push(this.taxasEdicaoAntecipacao);
        }
      } else {
        this.formTarifasAntecipacao.addControl(
          'id',
          new FormControl(this.taxasEdicaoAntecipacao.id),
        );
      }
    }

    fornecedor.taxas = {
      antecipacao: this.formTarifasAntecipacao.value,
      cessao: this.taxasCessao.map(form => form.getRawValue()),
    };

    fornecedor.taxasHistorico = [...this.taxasExcluidas];
    if (this.fornecedor) {
      fornecedor = Object.assign({}, this.fornecedor, fornecedor);
    }

    return fornecedor;
  }
}
