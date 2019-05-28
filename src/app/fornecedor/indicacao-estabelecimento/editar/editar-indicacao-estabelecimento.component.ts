import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup, EmailValidator } from '@angular/forms';
import { TiposDocumentos } from '../../../interfaces';
import { FornecedorService } from '../../fornecedor.service';
import { NotificationService } from '../../../core/notification/notification.service';

@Component({
  templateUrl: './editar-indicacao-estabelecimento.component.html',
  styleUrls: ['./editar-indicacao-estabelecimento.component.css'],
})
export class EditarIndicacaoEstabelecimentoComponent implements OnInit {
  constructor(
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private fornecedorService: FornecedorService,
    private notificationService: NotificationService,
  ) {}

  idIndicacao: number;

  controls = {
    documento: new FormControl(null),
    nome: new FormControl(null),
    email: new FormControl(null),
    telefone: new FormControl(null),
  };
  form = new FormGroup(this.controls);

  hasError = {
    documento: () => {
      if (!TiposDocumentos.isValidCpfCnpj(this.controls.documento.value)) {
        return 'Documento inválido';
      }
    },
    nome: () => {
      if (!this.controls.nome.value) {
        return 'Informe o Nome';
      }
    },
    email: () => {
      if (!this.controls.email.value && !this.controls.telefone.value) {
        return 'Informe ao menos um contato';
      }
      if (this.controls.email.value) {
        if (new EmailValidator().validate(this.controls.email)) {
          return 'Email informado não é válido';
        }
      }
    },
    telefone: () => {
      if (!this.controls.email.value && !this.controls.telefone.value) {
        return 'Informe ao menos um contato';
      }
      if (this.controls.telefone.value) {
        if (String(this.controls.telefone.value).replace(/\D/g, '').length < 10) {
          return 'Telefone informado não é válido';
        }
      }
    },
  };

  ngOnInit() {
    this.idIndicacao = +this.activatedRoute.snapshot.params.idIndicacao;

    this.fornecedorService
      .getIndicacaoEstabelecimento({ id: this.idIndicacao })
      .subscribe(indicacao => {
        this.controls.documento.setValue(indicacao.documento);
        this.controls.nome.setValue(indicacao.nome);
        this.controls.email.setValue(indicacao.email);
        this.controls.telefone.setValue(indicacao.telefone);
      });
  }

  atualizarIndicacao() {
    let ok = true;

    Object.keys(this.hasError).forEach(key => {
      const error = this.hasError[key]();
      if (error) {
        this.notificationService.showErrorMessage(error);
        ok = false;
      }
      this.controls[key].markAsDirty();
    });

    if (ok) {
      const indicacao = this.form.value;
      indicacao.id = this.idIndicacao;

      this.fornecedorService.updateIndicacaoEstabelecimento(indicacao).subscribe(() => {
        const message = 'Indicação de Estabelecimento alterada com sucesso!';
        this.notificationService.showSuccessMessage(message);

        this.voltar();
      });
    }
  }

  voltar() {
    this.router.navigateByUrl('/fornecedor/estabelecimentos/pendentes');
  }
}
