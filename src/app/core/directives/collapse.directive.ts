import { Directive, ElementRef, Input, HostListener } from '@angular/core';

declare const $: any;

@Directive({
  selector: '[collapse]'
})
export class CollapseDirective {
    @Input('collapse') target;

    constructor(private el: ElementRef) { }

    @HostListener('click', ['$event'])
    public onClick(event: any): void
    {
        $(this.el.nativeElement).parents('.box-group').find(`.collapse:not(${this.target})`).collapse('hide');
        $(this.target).collapse('toggle');
    }
}
