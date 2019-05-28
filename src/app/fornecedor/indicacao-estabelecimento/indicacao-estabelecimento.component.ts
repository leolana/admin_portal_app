import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, EmailValidator } from '@angular/forms';
import { NotificationService } from '../../core/notification/notification.service';
import { FornecedorService } from '../../fornecedor/fornecedor.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { TiposDocumentos } from '../../interfaces';

@Component({
  templateUrl: './indicacao-estabelecimento.component.html',
  styleUrls: ['./indicacao-estabelecimento.component.css']
})
export class IndicacaoEstabelecimentoComponent implements OnInit {
  constructor(
    private fornecedorService: FornecedorService,
    private notification: NotificationService,
    private prompt: PromptService,
    private router: Router
  ) { }

  // PROPERTIES
  filter = {
    documento: new FormControl(null),
  };
  formFilter = new FormGroup(this.filter);

  existente = {
    estabelecimentoId: new FormControl(null),
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
      if (!TiposDocumentos.isValidCpfCnpj(this.indicacao.documento.value)) {
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
        return 'Informe ao menos um contato';
      }
      if (this.indicacao.email.value) {
        if (new EmailValidator().validate(this.indicacao.email)) {
          return 'Email informado não é válido';
        }
      }
    },
    telefone: () => {
      if (!this.indicacao.email.value && !this.indicacao.telefone.value) {
        return 'Informe ao menos um contato';
      }
      if (this.indicacao.telefone.value) {
        if (String(this.indicacao.telefone.value).replace(/\D/g, '').length < 10) {
          return 'Telefone informado não é válido';
        }
      }
    }
  };

  // METHODS
  ngOnInit() { }

  getParticipante() {
    const documento = this.formFilter.value.documento;

    if (!documento) {
      this.notification.showErrorMessage('Informe o CPF/CNPJ');
      return;
    }

    if (!TiposDocumentos.isValidCpfCnpj(documento)) {
      this.notification.showErrorMessage('CPF/CNPJ inválido.');
      return;
    }

    this.fornecedorService.checaDocumentoIndicacaoEstabelecimento(documento).subscribe(found => {
      if (found && found.jaFoiIndicado) {
        this.notification.showAlertMessage(`Vínculo já solicitado para o estabelecimento "${found.nome}"`);
        return;
      }

      if (found && found.id) {
        this.prompt.confirm('Estabelecimento cadastrado. Deseja solicitar vínculo?').then(yes => {
          if (yes) {
            this.existente.documento.setValue(documento);
            this.existente.nome.setValue(found.nome);
            this.existente.estabelecimentoId.setValue(found.id);
          }
        });
        return;
      }

      this.prompt.confirm('Estabelecimento não cadastrado. Deseja indicar para cadastro?').then(yes => {
        if (yes) {
          this.indicacao.documento.setValue(documento);
        }
      });
    });
  }

  indicarEstabelecimentoParaCadastro() {
    const errors = Object.keys(this.checkIndicacao)
      .map(key => (this.formIndicacao.controls[key].markAsDirty(), this.checkIndicacao[key]()))
      .filter(error => error);

    if (errors.length) {
      errors.forEach(e => this.notification.showErrorMessage(e));
      return;
    }

    const json = this.formIndicacao.value;
    json.documento = String(json.documento).replace(/\D/g, '');

    this.fornecedorService.indicarEstabelecimentoParaCadastro(json).subscribe(() => {
      const message = 'Estabelecimento indicado com sucesso, o cadastramento será realizado pelo Backoffice Alpe';
      this.notification.showSuccessMessage(message);
      this.router.navigateByUrl('/fornecedor/estabelecimentos/pendentes');

      this.reset();
    });
  }

  solicitarVinculoComEstabelecimento() {
    const id = this.formExistente.value.estabelecimentoId;

    this.fornecedorService.vincular(id).subscribe(() => {
      const message = 'Solicitação de vínculo enviada';
      this.notification.showSuccessMessage(message);
      this.reset();
      this.router.navigateByUrl('fornecedor/estabelecimentos/pendentes');
    });
  }

  reset() {
    this.formExistente.reset();
    this.formIndicacao.reset();
    this.formFilter.reset();
  }
}
