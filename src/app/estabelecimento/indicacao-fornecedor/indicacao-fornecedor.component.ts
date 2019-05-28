import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, EmailValidator } from '@angular/forms';
import { EstabelecimentoService } from '../../estabelecimento/estabelecimento.service';
import { NotificationService } from '../../core/notification/notification.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { TiposDocumentos } from '../../interfaces';
import { NumberFunctions } from '../../core/functions/number.functions';
import { Router } from '@angular/router';
import { VinculoStatus, IVinculo } from 'src/app/interfaces/participante';

@Component({
  templateUrl: './indicacao-fornecedor.component.html',
  styleUrls: ['./indicacao-fornecedor.component.css'],
})
export class IndicacaoFornecedorComponent implements OnInit {
  constructor(
    private estabelecimentoService: EstabelecimentoService,
    private prompt: PromptService,
    private notification: NotificationService,
    private router: Router,
  ) {}

  // PROPERTIES

  filter = {
    documento: new FormControl(null),
  };
  formFilter = new FormGroup(this.filter);

  existente = {
    fornecedorId: new FormControl(null),
    documento: new FormControl(null),
    nome: new FormControl(null),
  };
  formExistente = new FormGroup(this.existente);

  indicacao = {
    documento: new FormControl(null),
    nome: new FormControl(null),
    email: new FormControl(null),
    telefone: new FormControl(null),
  };
  formIndicacao = new FormGroup(this.indicacao);
  checkIndicacao = {
    documento: () => {
      if (!TiposDocumentos.isValidCnpj(this.indicacao.documento.value)) {
        return 'Documento inválido';
      }
    },
    nome: () => {
      if (!this.indicacao.nome.value) {
        return 'Informe o Nome';
      }
    },
    email: () => {
      if (!this.indicacao.email.value && !this.indicacao.telefone.value) {
        return 'Informe Email ou Telefone';
      }
      if (this.indicacao.email.value) {
        if (new EmailValidator().validate(this.indicacao.email)) {
          return 'Email informado não é válido';
        }
      }
    },
    telefone: () => {
      if (!this.indicacao.email.value && !this.indicacao.telefone.value) {
        return 'Informe Email ou Telefone';
      }
      if (this.indicacao.telefone.value) {
        if (NumberFunctions.removeNonDigits(this.indicacao.telefone.value).length < 10) {
          return 'Telefone informado não é válido';
        }
      }
    },
  };

  // METHODS
  ngOnInit() {}

  checaDocumentoIndicacaoFornecedor() {
    const documento = this.formFilter.value.documento;

    if (!documento) {
      this.notification.showErrorMessage('Informe o CNPJ');
      return;
    }

    if (!TiposDocumentos.isValidCnpj(documento)) {
      this.notification.showErrorMessage('CNPJ inválido.');
      return;
    }

    this.estabelecimentoService.checaDocumentoIndicacaoFornecedor(documento).subscribe(found => {
      if (found && found.jaFoiIndicado) {
        this.notification.showAlertMessage(`Este fornecedor já foi indicado para cadastro.`);
        return;
      }

      if (found && found.id) {
        this.prompt.confirm('Fornecedor cadastrado. Deseja solicitar vínculo?').then(yes => {
          if (yes) {
            this.existente.documento.setValue(documento);
            this.existente.nome.setValue(found.nome);
            this.existente.fornecedorId.setValue(found.id);
          }
        });
        return;
      }

      this.prompt.confirm('Fornecedor não cadastrado. Deseja indicar para cadastro?').then(yes => {
        if (yes) {
          this.indicacao.documento.setValue(documento);
        }
      });
    });
  }

  indicarFornecedorParaCadastro() {
    const errors = Object.keys(this.checkIndicacao)
      .map(key => (this.formIndicacao.controls[key].markAsDirty(), this.checkIndicacao[key]()))
      .filter(error => error);

    if (errors.length) {
      errors.forEach(e => this.notification.showErrorMessage(e));
      return;
    }

    const json = this.formIndicacao.value;
    json.documento = NumberFunctions.removeNonDigits(json.documento);

    this.estabelecimentoService.indicarFornecedorParaCadastro(json).subscribe(() => {
      const message =
        'Fornecedor indicado com sucesso, o cadastramento será realizado pelo Backoffice Alpe';
      this.notification.showSuccessMessage(message);
      this.router.navigateByUrl('/estabelecimento/fornecedores/indicacoes');

      this.reset();
    });
  }

  solicitarVinculoComFornecedor() {
    const id = this.formExistente.value.fornecedorId;
    this.fornecedorEstaCancelado(id);
  }

  vincularFornecedor(id: number) {
    this.estabelecimentoService.vincular(id).subscribe(() => {
      const message = 'Solicitação de vínculo enviada';
      this.notification.showSuccessMessage(message);
      this.reset();
    });
  }

  reativarVinculo(vinculo: IVinculo) {
    const message = 'Este fornecedor está com o vínculo cancelado. Deseja reativar?';
    this.prompt.confirm(message, 'Confirmação').then(
      ans =>
        ans &&
        this.estabelecimentoService.reativarVinculo(vinculo).subscribe(() => {
          vinculo.status = VinculoStatus.aprovado;

          const fornecedor = vinculo.participante.nome;
          const successMessage = `O vínculo com o fornecedor "${fornecedor}" foi reativado com sucesso`;
          this.notification.showSuccessMessage(successMessage);

          this.router.navigate(['estabelecimento/fornecedores/aprovado']);
        }),
    );
  }

  fornecedorEstaCancelado(id: number) {
    this.estabelecimentoService.obterVinculos(VinculoStatus.cancelado).subscribe(fornecedores => {
      if (!fornecedores.length) return this.vincularFornecedor(id);
      fornecedores.forEach(vinculo => {
        if (vinculo.participante.id === id) {
          return this.reativarVinculo(vinculo);
        }
        this.vincularFornecedor(id);
      });
    });
  }

  reset() {
    this.formExistente.reset();
    this.formIndicacao.reset();
    this.formFilter.reset();
  }
}
