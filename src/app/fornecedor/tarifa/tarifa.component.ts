import { Component, OnInit } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FornecedorService } from '../fornecedor.service';

@Component({
    templateUrl: './tarifa.component.html',
    styleUrls: ['./tarifa.component.css'],
    providers: [CurrencyPipe]
})
export class FornecedorTarifaComponent implements OnInit {
    info: {
        taxasCessao: [{ valorInicio: number, valorFim: number, taxa: number }],
        taxaAntecipacao: number
    };

    constructor(
        private currencyPipe: CurrencyPipe,
        private service: FornecedorService
    ) { }

    ngOnInit(): void {
        this.info = { taxasCessao: null, taxaAntecipacao: null };
        this.getFornecedorTarifa();
    }

    getFornecedorTarifa(): void {
        this.service
            .getFornecedorTarifa()
            .subscribe(item => this.info = item);
    }

    formatarMoeda(valor: number): string {
        return this.currencyPipe.transform(valor, 'BRL', 'symbol', '1.2-2');
    }

    formatarRange(valorInicio: number, valorFim: number): string {
        if (valorInicio == null) {
            return `até ${this.formatarMoeda(valorFim)}`;
        }
        if (valorFim == null) {
            return `acima de ${this.formatarMoeda(valorInicio)}`;
        }
        return `de ${this.formatarMoeda(valorInicio)} a ${this.formatarMoeda(valorFim)}`;
    }

}
