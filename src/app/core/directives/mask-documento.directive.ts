import { OnInit, Directive, ElementRef, Input } from '@angular/core';

declare var $: any;

@Directive({
    selector: '[appMaskDocumento]'
})
export class MaskDocumentoDirective implements OnInit {
    constructor(
        private element: ElementRef,
    ) { }

    @Input() appMaskDocumento: any;

    ngOnInit(): void {
        const input = $(this.element.nativeElement);

        const masks = {
            cpf: '000.000.000-000?0?0?',
            cnpj: '00.000.000/0000-00',
        };

        const options = {
            onKeyPress: function (val) {
                input.mask(masks[(!val || val.length <= 14) ? 'cpf' : 'cnpj'], options);
            }
        };

        input.mask(masks.cpf, options);
    }
}
