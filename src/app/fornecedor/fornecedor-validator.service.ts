import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FornecedorService } from './fornecedor.service';
import { hasLifecycleHook } from '@angular/compiler/src/lifecycle_reflector';
import { HasErrorPipe } from '../pipes/has-error.pipe';
import { TiposPessoa } from '../interfaces';
import { Horarios } from './../interfaces/credenciamento/index';
import { DominioService } from '../dominio/dominio.service';

@Injectable({
  providedIn: 'root',
})
export class FornecedorValidatorService {
  private hasError = {
    dadosCadastrais: false,
    dadosBancarios: false,
    tarifas: false,
  };
  private fornecedorSession;

  private errorHandler = new BehaviorSubject(this.hasError);
  errorSender = this.errorHandler.asObservable();

  constructor(private service: FornecedorService, private dominioService: DominioService) {}

  async validaSteps() {
    this.fornecedorSession = this.service.getFornecedorSessionStorage();
    if (this.fornecedorSession.id) {
      const hasErrorLocale = Object.assign({}, this.hasError);
      hasErrorLocale.dadosBancarios = await this.validaDadosBancarios();

      this.errorHandler.next(hasErrorLocale);
      return;
    }

    this.errorHandler.next(this.hasError);
  }

  async validaDadosBancarios() {
    const hasError = [await this.validaBancos()];

    return hasError.filter(error => error).length > 0;
  }

  validaBancos() {
    return new Promise(r => {
      this.dominioService.obterBancos().subscribe(bancosDisponiveis => {
        const bancosSelecionados = this.fornecedorSession.domiciliosBancarios;
        const bancosInvalidos = bancosSelecionados.some(bancoSelecionado => {
          return !bancosDisponiveis.some(bancoDisponivel => {
            return bancoDisponivel.id == bancoSelecionado.bancoId;
          });
        });
        r(bancosInvalidos);
      });
    });
  }
}
