import { Directive, ElementRef, Input } from '@angular/core';

declare const $: any;

@Directive({
    selector: '[appTrigger]'
})
export class TriggerDirective {
    @Input() appTrigger: string;

    constructor(private el: ElementRef) {
        const $el = $(this.el.nativeElement);

        $el.on('click', (e) => {
            if ($(e.target).closest(this.appTrigger).length) {
                return 'already target';
            }

            $el.find(this.appTrigger).trigger('click');
        });
    }
}
