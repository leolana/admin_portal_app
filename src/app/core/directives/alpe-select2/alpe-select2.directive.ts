import { Directive, Input, ElementRef, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

declare const $: any;

@Directive({
    selector: '[alpeSelect2]',
})
export class AlpeSelect2Directive implements OnInit {
    constructor(
        private el: ElementRef,
    ) { }

    instance: any;

    @Input()
    alpeSelect2: FormControl;

    @Input()
    options: any;

    ngOnInit() {
        if (!(this.alpeSelect2 instanceof FormControl)) {
            throw 'Forneça um FormControl. Exemplo: <select [alpeSelect2]="nomeDoControl" ...';
        }

        this.instance = $(this.el.nativeElement).select2(this.options);

        this.instance.on('select2:select', (e: any) => {
            if (this.el.nativeElement.multiple) {
                this.alpeSelect2.setValue((this.alpeSelect2.value || []).concat(e.params.data.id));
            } else {
                this.alpeSelect2.setValue(e.params.data.id);
            }
        });

        this.instance.on('select2:unselect', (e: any) => {
            this.alpeSelect2.setValue(this.alpeSelect2.value.filter(x => x !== e.params.data.id));
        });

        this.instance.on('select2:open', () => {
            this.alpeSelect2.markAsTouched();
        });

        this.alpeSelect2.valueChanges.subscribe(value => {
            this.instance.val(value).trigger('change');
        });
    }

}
