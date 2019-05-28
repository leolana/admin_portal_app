import { OnInit, Component, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { NotificationService } from '../../core/notification/notification.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { DominioService } from '../../dominio/dominio.service';
import { AntecipacaoService } from '../antecipacao.service';
import { IdText } from '../../interfaces';
import { tags } from '../../core/tags';
import { Datatable } from '../../core/datatable/datatable.interface';
import { CurrencyPipe } from '@angular/common';

@Component({
    templateUrl: './antecipar-estabelecimento.component.html',
    styleUrls: ['./antecipar-estabelecimento.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class AnteciparEstabelecimentoComponent implements OnInit {
    constructor(
        private antecipacaoService: AntecipacaoService,
        private dominioService: DominioService,
        private toastr: NotificationService,
        private prompt: PromptService,
    ) { }

    // PROPERTIES
    mobile: boolean;
    limitHour: string;
    valores = {
        valorSaldo: 0,
        valorDisponivel: 0,
        valorDisponivelNegativo: 0,
        valorSolicitado: 0,
        valorDescontado: 0,
        valorAntecipado: 0,
    };

    resultados = new Datatable<any>({
        table: [
            {
                property: 'selecionado', description: '', disableSort: true, checkbox:
                {
                    isAllChecked: true,
                    canCheck: row => this.hasCredit(row),
                    onCheck: () => this.calcValuesAndTotals(),
                    onThCheck: () => this.calcValuesAndTotals()
                }
            },
            { property: 'dataVenda', hideSort: true, description: 'Data da\nvenda', pipe: 'date' },
            { property: 'bandeira', hideSort: true, description: 'Bandeira' },
            { property: 'modalidade', hideSort: true, description: 'Modalidade' },
            { property: 'plano', hideSort: true, description: 'Plano' },
            { property: 'autorizacao', hideSort: true, description: 'Autorização' },
            { property: 'valorVenda', hideSort: true, description: 'Valor da venda (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorParcela', hideSort: true, description: 'Valor da parcela (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorDescontoMdr', hideSort: true, description: 'Valor do desconto (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorPagar', hideSort: true, description: 'Valor líquido da parcela (R$)', pipe: 'noSymbolCurrency' },
            { property: 'previsaoPagamento', hideSort: true, description: 'Previsão de pagamento', pipe: 'date' },
            { property: 'diasAntecipacao', hideSort: true, description: 'Dias de antecipação' },
            { property: 'taxaAntecipacao', hideSort: true, description: '% Taxa de antecipação' },
            { property: 'descontoAntecipacao', hideSort: true,
                description: 'Valor do desconto antecipação (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorAntecipado', hideSort: true, description: 'Valor líquido à antecipar (R$)', pipe: 'noSymbolCurrency' },
        ],
        data: []
    });
    combos = {
        meses: [] as IdText[],
        bandeiras: [] as any[],
        produtos: [] as any[],
    };

    controls = {
        bandeirasId: new FormControl(null),
        produtoId: new FormControl(null),
        dataVendaInicio: new FormControl(null),
        dataVendaFim: new FormControl(null),
    };
    form = new FormGroup(this.controls);

    hasError = {
        dataVendaInicio: () => {
            if (!this.form.value.dataVendaInicio && this.controls.dataVendaInicio.touched) {
                return 'A data de venda inicial é obrigatória';
            }
            if (this.form.value.dataVendaInicio && this.form.value.dataVendaFim) {
                if (this.form.value.dataVendaFim < this.form.value.dataVendaInicio) {
                    return 'A data final deve ser maior que a data inicial.';
                }
            }
        },
        dataVendaFim: () => {
            if (this.form.value.dataVendaInicio && this.form.value.dataVendaFim) {
                if (this.form.value.dataVendaFim < this.form.value.dataVendaInicio) {
                    return 'A data final deve ser maior que a data inicial.';
                }
            }
        },
    };

    // METHODS

    ngOnInit(): void {
        this.solveLayout();
        this.getBandeiras();
        this.getProdutos();
        this.getLimitHour();
    }

    calcValuesAndTotals() {
        this.calculateValues();
    }

    calculateValues(): void {
        this.valorSaldo();
        this.valorDisponivel();
        this.valorDisponivelNegativo();
        this.valorSolicitado();
        this.valorDescontado();
        this.valorAntecipado();
    }

    sum(args) {
        return args.reduce((num, tot) => tot + num, 0);
    }

    getBandeiras() {
        this.dominioService
            .obterBandeiras()
            .subscribe(arr => this.combos.bandeiras = arr);
    }

    getProdutos() {
        this.antecipacaoService
            .getComboProdutos()
            .subscribe(arr => {
                this.combos.produtos = arr;
            });
    }

    getLimitHour() {
        this.antecipacaoService
            .getLimitHour()
            .subscribe(hour => {
                this.limitHour = hour.hora;
            });
    }

    filter(): void {
        this.controls.dataVendaInicio.markAsTouched();

        const parameters = this.form.value;

        const errors = Object.keys(this.hasError)
            .map(key => (this.form.controls[key].markAsDirty(), this.hasError[key]()))
            .filter(error => error);

        if (errors.length) {
            errors.forEach(e => this.toastr.showErrorMessage(e));
            return;
        }

        this.antecipacaoService
            .pesquisarRecebiveisParaAntecipacao(parameters)
            .subscribe(arr => {
                arr.forEach((item: any) => {
                    item.selecionado = this.hasCredit(item);
                    item.bandeira = item.bandeiraId ? item.bandeira.nome : '';
                    item.modalidade = item.eventoId ? item.evento.nome : '';
                    item.plano = item.parcelaAtual + '/' + item.qtdeParcelas;
                    item.previsaoPagamento = item.dataPagamento;
                    item.taxaAntecipacao = item.taxaAntecipacao !== '-' ? item.taxaAntecipacao  + '%' : item.taxaAntecipacao;
                });
                this.resultados.updateData(arr);
                this.calculateValues();
            });
    }

    valorSaldo(): void {
        const table = this.resultados.internal.data;
        const val = table.reduce((acc, item) => {
            return acc + (item.valorPagar > 0 ? item.valorPagar : 0);
        }, 0);
        this.valores.valorSaldo = val;
    }

    valorDisponivelNegativo(): number {
        const table = this.resultados.internal.data;
        const val = table.reduce((acc, item) => {
            return acc + (item.selecionado ?
                item.valorPagar < 0 ? item.valorPagar : 0
                : 0);
        }, 0);
        this.valores.valorDisponivelNegativo = val;
        return val;
    }

    valorSolicitado(): number {
        const val = this.valorDisponivel() - this.valorDisponivelNegativo();
        this.valores.valorSolicitado = val;
        return val;
    }

    valorDescontado(): number {
        const table = this.resultados.internal.data;
        const val = table.reduce((acc, item) => {
            return acc + (item.selecionado ? item.descontoAntecipacao : 0);
        }, 0);
        this.valores.valorDescontado = val;
        return val;
    }

    valorDisponivel(): number {
        const table = this.resultados.internal.data;
        const val = table.reduce((acc, item) => {
            return acc + (item.selecionado ? item.valorPagar : 0);
        }, 0);
        this.valores.valorDisponivel = val;
        return val;
    }

    valorAntecipado(): number {
        const val = this.valorSolicitado() - this.valorDescontado();
        this.valores.valorAntecipado = val;
        return val;
    }

    reset(): void {
        this.form.reset();
        this.controls.dataVendaInicio.setValue(null);
        this.resultados.updateData([]);
        this.valores.valorSaldo = 0;
        this.valores.valorDisponivel = 0;
        this.valores.valorDisponivelNegativo = 0;
        this.valores.valorSolicitado = 0;
        this.valores.valorDescontado = 0;
        this.valores.valorAntecipado = 0;
    }

    solicitar(): void {
        if (this.invalidWeekDay()) {
            this.toastr.showErrorMessage(tags['anticipation-blocked-day']);
            return;
        }
        if (this.invalidHour()) {
            this.toastr.showErrorMessage(tags['anticipation-time-limit-exceeded']);
            return;
        }
        if (this.valorAntecipado() < 0) {
            this.toastr.showAlertMessage('O valor Antecipado não pode ser negativo');
            return;
        }

        const selecionados = this.resultados.internal.data.filter(row => row.selecionado || row.valorPagar < 0);
        if (!selecionados.length) {
            this.toastr.showAlertMessage('Selecione ao menos um Recebível para Efetuar Solicitação.');
            return;
        }

        this.antecipacaoService
            .anteciparRecebiveis(selecionados.map(s => s.rowId))
            .subscribe(x => {
                this.toastr.showSuccessMessage('Antecipação solicitada com sucesso.');
                this.prompt.inform(
                    'O pagamento da antecipação será realizada no domicilio bancário cadastrado na Alpe.',
                    'Antecipação solicitada com sucesso'
                );
                this.reset();
            });
    }

    invalidHour() {
        const now = new Date();
        const hour = `0${now.getHours()}`.slice(-2);
        const min = `0${now.getMinutes()}`.slice(-2);
        const current = `${hour}:${min}`;

        return current >= this.limitHour;
    }

    invalidWeekDay() {
        const blockedDays = {
            0: 'sunday',
            6: 'saturday',
        };

        return new Date().getDay() in blockedDays;
    }

    hasCredit(recebivel) {
        return recebivel.valorPagar > 0;
    }

    solveLayout(): void {
        const checkScreenSize = () => {
            this.mobile = document.body.offsetWidth < 700;
        };

        window.onresize = checkScreenSize;
        checkScreenSize();
    }

}
