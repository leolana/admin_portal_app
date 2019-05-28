import { Component, Input } from '@angular/core';

declare const $: any;

@Component({
    selector: 'timeline-recebiveis',
    templateUrl: './timeline-recebiveis.component.html',
    styleUrls: ['./timeline-recebiveis.component.css'],
})
export class TimeLineRecebiveisComponent {
    @Input() recebiveis: {
        data: Date,
        recebiveis: {
            bandeira: { id: number, nome: string },
            bandeiraId: number,
            cessaoId: number,
            dataPagarEc: Date,
            dataReserva: Date,
            dataVenda: Date,
            evento: { id: number, nome: string },
            eventoId: number,
            nsu: string,
            numeroParcela: number,
            statusPagamento: number,
            totalParcelas: number,
            valorPagarEc: number,
            valorVenda: number,
        }[],
        total: number,
    }[];

    collapse(event): void {
        const wrapper = $(event.target).closest('.timeline-wrapper');
        const ul = wrapper.find('ul');
        const speed = 400;

        if (ul.is(':visible')) {
            ul.slideUp(speed);
            wrapper.find('i.fa-minus').removeClass('fa-minus').addClass('fa-plus');
        } else {
            ul.slideDown(speed);
            wrapper.find('i.fa-plus').removeClass('fa-plus').addClass('fa-minus');
        }
    }

    colorTextMoney(valorRecebiveis: number): string {
        return valorRecebiveis === 0 ? '' : valorRecebiveis < 0 ? 'text-red' : 'text-green';
    }

    setaDinheiro(valorRecebiveis: number): string {
        return valorRecebiveis === 0 ? '' : valorRecebiveis < 0 ? 'fa-arrow-left' : 'fa-arrow-right';
    }
}
