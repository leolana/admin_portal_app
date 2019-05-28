import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, Input } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { NotificationService } from '../../../core/notification/notification.service';
import { CessaoPagamentos } from '../../../interfaces/cessao';
import { IVinculo } from '../../../interfaces/participante';
import { CessaoService } from '../../cessao.service';
import { IdText } from '../../../interfaces/index';
import { tags } from '../../../core/tags';
import { Router } from '@angular/router';
import { DateTime } from 'luxon';

@Component({
    selector: 'cessao-parcelado',
    templateUrl: './parcelado.html',
    styleUrls: ['./parcelado.css']
})
export class SolicitarCessaoParceladoComponent implements OnInit {
    constructor(
        private service: CessaoService,
        private notification: NotificationService,
        private router: Router,
    ) { }

    // PROPERTIES
    @Input() pagamentos: IdText[];
    @Input() vinculo: IVinculo;
    calculado: boolean;
    opcoesParcelamento: {
        qtParcelas: number,
        valorParcela: number,
    }[] = [];

    _form = {
        pagamento: new FormControl(CessaoPagamentos.diaVencimento),
        valorCessao: new FormControl(''),
        dataVencimento: new FormControl(''),
        dataExpiracao: new FormControl(''),
        referencia: new FormControl(''),
        parcelamento: new FormControl(null),
    };
    form = new FormGroup(this._form);

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
                return 'Data de Vencimento deve ser maior que a Data de Expiração.';
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
        }
    };

    warnings = {
        dataExpiracao: (newDate) => {
            this.service.warningDataExpiracaoFinalSemana(newDate);
        }
    };

    // METHODS
    ngOnInit(): void {
        this.calculaDataExpiracao();
    }

    calculaDataExpiracao() {
        this._form.dataExpiracao.setValue(this.service.sugestaoDiaExpiracao(this.vinculo.diasAprovacao));
    }

    calcular(): void {
        const errors = Object.keys(this.hasError)
            .map(key => (this.form.controls[key].markAsDirty(), this.hasError[key]()))
            .filter(error => error);

        if (errors.length) {
            errors.forEach(e => this.notification.showErrorMessage(e));
            return;
        }

        const json = {
            valor: this.form.value.valorCessao,
            dataVencimento: this.form.value.dataVencimento
        };

        this.service
            .buscarOpcoesDeParcelamento(json, this.vinculo.id)
            .subscribe(opcoes => {
                this.opcoesParcelamento = opcoes.map(o => ({
                    qtParcelas: o.month,
                    valorParcela: o.value.toFixed(2),
                }));

                if (!opcoes.length) {
                    this.notification.showErrorMessage(
                        'Não existem Opções de Parcelamento para o valor de ' +
                        new CurrencyPipe('pt').transform(json.valor, 'BRL') +
                        ' com vencimento a partir de ' +
                        new DatePipe('pt').transform(json.dataVencimento, 'dd/MM/yyyy')
                    );
                    return;
                }

                this._form.parcelamento.setValue(this.opcoesParcelamento[0].qtParcelas);
                this.calculado = true;
            });
    }

    limpar(): void {
        this._form.parcelamento.setValue(null);
        this.opcoesParcelamento = [];
        this.calculado = false;
    }

    submit(): void {
        const json = this.form.value;

        if (!json.parcelamento) {
            this.notification.showErrorMessage('Selecione uma Opção de Parcelamento');
            return;
        }

        this.service
            .solicitarCessaoParcelada(json, this.vinculo.id)
            .subscribe(cessao => {
                if (cessao.id) {
                    this.notification.showSuccessMessage('Solicitação de Cessão Parcelada efetuada com sucesso');
                    this.router.navigateByUrl('/cessao/detalhe/' + cessao.id);
                } else {
                    this.notification.showErrorMessage('Não foi possível solicitar. Tente novamente mais tarde');
                }
            });
    }

}
