import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { CredenciamentoService } from './credenciamento.service';
import { hasLifecycleHook } from '@angular/compiler/src/lifecycle_reflector';
import { HasErrorPipe } from '../pipes/has-error.pipe';
import { TiposPessoa } from '../interfaces';
import { Horarios } from './../interfaces/credenciamento/index';

@Injectable({
    providedIn: 'root'
})
export class CredenciamentoValidatorService {
    private hasError = {
        dadosCadastrais: false,
        dadosSocietarios: false,
        dadosInstalacao: false,
        dadosBancarios: false,
        dadosTecnologicos: false,
        documentos: false,
        dadosComerciais: false
    };

    private errorHandler = new BehaviorSubject(this.hasError);
    errorSender = this.errorHandler.asObservable();

    constructor(
        private service: CredenciamentoService
    ) { }

    async validaSteps() {
        if (sessionStorage.getItem('credenciamentoEdicao')) {
            const hasErrorLocale = Object.assign({}, this.hasError);
            hasErrorLocale.dadosCadastrais = await this.validaDadosCadastrais();
            hasErrorLocale.dadosInstalacao = await this.validaDadosInstalacao();
            hasErrorLocale.dadosBancarios = await this.validaDadosBancarios();

            if (+sessionStorage.getItem('tipoPessoa') == TiposPessoa.fisica) {
                delete hasErrorLocale.dadosSocietarios;
            }

            this.errorHandler.next(hasErrorLocale);
            return;
        }

        this.errorHandler.next(this.hasError);
    }

    async validaDadosCadastrais() {
        const hasError = [
            await this.validaFaturamento(),
            await this.validaTicket()
        ];

        return hasError.filter(error => error).length > 0;
    }

    async validaDadosInstalacao() {
        const hasError = [
            this.validaHorarioInstalacao()
        ];

        return hasError.filter(error => error).length > 0;
    }

    async validaDadosBancarios() {
        const hasError = [
            await this.validaBancos()
        ];

        return hasError.filter(error => error).length > 0;
    }

    validaFaturamento() {
        return new Promise(r => {
            this.service.getFaturamentos()
                .subscribe(faturamentosDisponiveis => {
                    const faturamentoSelecionado = JSON.parse(sessionStorage.getItem('financeiro')).faturamentoAnual;
                    const faturamentoValido = faturamentosDisponiveis
                        .some(faturamento => {
                            return faturamento.id == faturamentoSelecionado;
                        });
                    r(!faturamentoValido);
                });
        });
    }

    validaTicket() {
        return new Promise(r => {
            this.service.getTickets()
                .subscribe(ticketsDisponiveis => {
                    const ticketSelecionado = JSON.parse(sessionStorage.getItem('financeiro')).ticketMedio;
                    const ticketValido = ticketsDisponiveis
                        .some(ticket => {
                            return ticket.id == ticketSelecionado;
                        });
                    r(!ticketValido);
                });
        });
    }

    validaHorarioInstalacao() {
        const horariosDisponiveis = Object.keys(Horarios.descricoes);
        const horarioSelecionado = JSON.parse(sessionStorage.getItem('dadosInstalacao')).horario;
        return !horariosDisponiveis.includes(horarioSelecionado);
    }

    validaBancos() {
        return new Promise(r => {
            this.service.getBancos()
                .subscribe(bancosDisponiveis => {
                    const bancosSelecionados = JSON.parse(sessionStorage.getItem('domicilioBancario'));
                    const bancosInvalidos = bancosSelecionados
                        .some(bancoSelecionado => {
                            return !(bancosDisponiveis
                                .some(bancoDisponivel => {
                                    return bancoDisponivel.id == bancoSelecionado.banco.id;
                                }));
                        });
                    r(bancosInvalidos);
                });
        });
    }
}
