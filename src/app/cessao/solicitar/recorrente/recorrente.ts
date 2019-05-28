import { Router } from '@angular/router';
import { FormGroup, FormControl } from '@angular/forms';
import { Component, OnInit, Input } from '@angular/core';
import { NotificationService } from '../../../core/notification/notification.service';
import { CessaoPagamentos, CessaoOperacoes } from '../../../interfaces/cessao';
import { PromptService } from '../../../core/prompt/prompt.service';
import { IVinculo } from '../../../interfaces/participante';
import { CessaoService } from '../../cessao.service';
import { IdText } from '../../../interfaces/index';
import { tags } from '../../../core/tags';
import { DateTime } from 'luxon';

export interface PermissaoCessaoRecorrente {
    dataExpiracaoRecorrente: Date;
    permitido: boolean;
    valorMaximoRecorrente: number;
    message: string;
}

@Component({
    selector: 'cessao-recorrente',
    templateUrl: './recorrente.html',
})
export class SolicitarCessaoRecorrenteComponent implements OnInit {
    constructor(
        private service: CessaoService,
        private prompt: PromptService,
        private router: Router,
        private notification: NotificationService,
    ) { }

    // PROPERTIES
    @Input() pagamentos: IdText[];
    @Input() vinculo: IVinculo;

    _form = {
        pagamento: new FormControl(CessaoPagamentos.diaVencimento),
        valorCessao: new FormControl(''),
        dataVencimento: new FormControl(''),
        dataExpiracao: new FormControl(''),
        referencia: new FormControl(''),
        valorMaximo: new FormControl(''),
        dataFinalVigencia: new FormControl(''),
    };
    form = new FormGroup(this._form);

    auth: PermissaoCessaoRecorrente;

    hasError = {
        pagamento: () => {
            if (isNaN(this.form.value.pagamento)) {
                return 'Informe o tipo de pagamento';
            }
        },

        dataExpiracao: () => {
            if (!this.form.value.dataExpiracao) {
                return 'Informe a data de expiração';
            }

            const tomorrow = DateTime.local().plus({ days: 1 }).set({ hour: 0, minute: 0, second: 0, millisecond: 0 }).toJSDate();

            if (this.form.value.dataExpiracao < tomorrow) {
                return 'Data de expiração deve ser a partir do próximo dia.';
            }

            if (this.form.value.dataVencimento && this.form.value.dataExpiracao >= this.form.value.dataVencimento) {
                return 'Data de vencimento deve ser maior que a Data de Expiração.';
            }

            const today = DateTime.local()
                .set({ hour: 0, minute: 0, second: 0, millisecond: 0});
            const atualDate = DateTime.fromJSDate(this.form.value.dataExpiracao)
                .set({ hour: 0, minute: 0, second: 0, millisecond: 0});

            const expirationDaysDiff = atualDate.diff(today, 'days').toObject();
            if (expirationDaysDiff.days < 2) {
                return tags['prazo-aprovacao-dias'];
            }
        },

        valorCessao: () => {
            if (!this.form.value.valorCessao) {
                return 'Informe o valor da cessão';
            }

            if (this.vinculo.valorMaximoExibicao && this.form.value.valorCessao > this.vinculo.valorMaximoExibicao){
                return 'Valor da Cessão solicitado superior ao Valor Disponível para Cessão.';
            }

            if (this.form.value.valorCessao > this.vinculo.valorDisponivel) {
                return 'Valor da Cessão solicitado superior ao Valor Disponível para Cessão.';
            }

            if (this.form.value.valorMaximo && this.form.value.valorCessao > this.form.value.valorMaximo) {
                return 'Valor da Cessão solicitado superior ao Valor Máximo Recorrente.';
            }
        },

        dataVencimento: () => {
            if (!this.form.value.dataVencimento) {
                return 'Informe a data de vencimento';
            }

            const now = new Date();
            const minVencimento = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2);

            if (this.form.value.dataVencimento < minVencimento) {
                return 'Data de Vencimento deve ser superior a 2 dias.';
            }
        },

        valorMaximo: () => {
            if (this.podeEditarCamposRecorrencia()) {
                if (!this.form.value.valorMaximo) {
                    return 'Informe o valor máximo';
                }
            }
        },

        dataFinalVigencia: () => {
            if (this.podeEditarCamposRecorrencia()) {
                if (!this.form.value.dataFinalVigencia) {
                    return 'Informe o limite de recorrência das cessões mensais';
                }

                if (this.form.value.dataFinalVigencia < this.form.value.dataVencimento) {
                    return 'Verifique a data de validade das cessões mensais.';
                }
            }
        }
    };

    warnings = {
        dataExpiracao: (newDate) => {
            this.service.warningDataExpiracaoFinalSemana(newDate);
        }
    };

    // METHODS
    ngOnInit() {
        this._form.dataExpiracao.setValue(this.service.sugestaoDiaExpiracao(this.vinculo.diasAprovacao));

        this.obterDisponibilidadeRecorrente();
    }

    podeEditarCamposRecorrencia() {
        if (!this.auth || !this.auth.permitido) return false;

        if (!this.auth.dataExpiracaoRecorrente && !this.auth.valorMaximoRecorrente) return true;

        return false;
    }

    obterDisponibilidadeRecorrente() {
        this.service
            .checaPermissaoCessaoRecorrente(this.vinculo.id)
            .subscribe(auth => {
                this.auth = auth;

                this._form.dataFinalVigencia.setValue(auth.dataExpiracaoRecorrente);
                this._form.valorMaximo.setValue(auth.valorMaximoRecorrente);

                if (auth.message) {
                    this.notification.showErrorMessage(tags[auth.message]);
                }
            });
    }

    submit() {
        const errors = Object.keys(this.hasError)
            .map(key => (this.form.controls[key].markAsDirty(), this.hasError[key]()))
            .filter(error => error);

        if (errors.length) {
            errors.forEach(e => this.notification.showErrorMessage(e));
            return;
        }

        const json = {
            vinculo: this.vinculo,
            tipo: CessaoOperacoes.cessaoRecorrente,
            pagamento: this.form.value.pagamento,
            valor: this.form.value.valorCessao,
            dataVencimento: this.form.value.dataVencimento,
            dataExpiracao: this.form.value.dataExpiracao,
            dataFinalVigencia: this.form.value.dataFinalVigencia,
            valorMaximoRecorrente: this.form.value.valorMaximo,
            referencia: this.form.value.referencia,
        };

        const solicitacao = () => this.service.solicitarCessao(json).subscribe((cessao) => {
            this.notification.showSuccessMessage('Solicitação de Cessão efetuada.');
            this.router.navigateByUrl('/cessao/detalhe/' + cessao.id);
        });

        const estabelecimento = this.vinculo.estabelecimento.participante.nome;
        this.prompt
            .confirm(`Solicitação de Cessão Recorrente para o Estabelecimento "${estabelecimento}"?`)
            .then(yes => { if (yes) solicitacao(); });
    }

}
