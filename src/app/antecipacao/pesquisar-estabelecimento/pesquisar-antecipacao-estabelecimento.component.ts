import { FormControl, FormGroup } from '@angular/forms';
import { OnInit, Component, ViewEncapsulation } from '@angular/core';
import { DominioService } from '../../dominio/dominio.service';
import { AntecipacaoService } from '../antecipacao.service';
import { Datatable } from '../../core/datatable/datatable.interface';
import { CurrencyPipe } from '@angular/common';

@Component({
    templateUrl: './pesquisar-antecipacao-estabelecimento.component.html',
    styleUrls: ['./pesquisar-antecipacao-estabelecimento.component.css'],
    encapsulation: ViewEncapsulation.None
})
export class PesquisarAntecipacaoEstabelecimentoComponent implements OnInit {
    constructor(
        private antecipacaoService: AntecipacaoService,
        private dominioService: DominioService,
    ) { }

    // PROPERTIES
    mobile: boolean;

    combos = {
        bandeiras: [] as any[],
        produtos: [] as any[],
    };

    controls = {
        dataPagamento: new FormControl(null),
        dataSolicitacao: new FormControl(null),
        bandeirasIds: new FormControl(null),
        produtoId: new FormControl(null),
        codigo: new FormControl(null),
    };

    antecipacoesRealizadas = new Datatable<any>({
        table: [
            { property: 'dataVenda', description: 'Data da\nvenda', pipe: 'date' },
            { property: 'bandeira', description: 'Bandeira' },
            { property: 'modalidade', description: 'Modalidade' },
            { property: 'parcelaAtual', description: 'Plano' },
            { property: 'valorVenda', description: 'Valor da venda (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorParcela', description: 'Valor da parcela (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorDescontoMdr', description: 'Valor do desconto (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorPagar', description: 'Valor líquido da parcela (R$)', pipe: 'noSymbolCurrency' },
            { property: 'autorizacao', description: 'Autorização' },
            { property: 'dataPagarLojaOriginal', description: 'Previsão de pagamento', pipe: 'date' },
            { property: 'taxaAntecipacao', description: '% Taxa de antecipação' },
            { property: 'descontoAntecipacao', description: 'Valor do desconto antecipação (R$)', pipe: 'noSymbolCurrency' },
            { property: 'valorAntecipado', description: 'Valor líquido antecipado (R$)', pipe: 'noSymbolCurrency' },
            { property: 'dataAntecipacao', description: 'Data da antecipação', pipe: 'date' },
            { property: 'codigo', description: 'Código da antecipação' },
            { property: 'domicilioBancario', description: 'Domicílio bancário' },
        ],
        data: []
    });

    form = new FormGroup(this.controls);

    // METHODS
    ngOnInit(): void {
        this.solveLayout();
        this.getBandeiras();
        this.getProdutos();
        this.filter();
    }

    getBandeiras() {
        this.dominioService
            .obterBandeiras()
            .subscribe(arr => {
                this.combos.bandeiras = arr;
            });
    }

    getProdutos() {
        this.antecipacaoService
            .getComboProdutosAntecipacaoRealizada()
            .subscribe(arr => {
                this.combos.produtos = arr;
            });
    }

    reset() {
        this.form.reset();
        this.filter();
    }

    filter(): void {
        const parameters = this.form.value;
        this.antecipacaoService
            .pesquisarAntecipacoesRealizadas(parameters)
            .subscribe(values => {
                values.forEach(value => {
                    value.bandeira = value.bandeira.nome;
                    value.modalidade = value.evento.nome;
                    value.taxaAntecipacao = value.taxaAntecipacao + '%';
                });
                this.antecipacoesRealizadas.updateData(values);
            });
    }

    clearFilter() {
        this.form.reset();
        this.filter();
    }

    solveLayout(): void {
        const checkScreenSize = () => {
            this.mobile = document.body.offsetWidth < 992;
        };

        window.onresize = checkScreenSize;
        checkScreenSize();
    }

    isDebit(antecipacao){
        return antecipacao.valorPagar < 0;
    }
}
