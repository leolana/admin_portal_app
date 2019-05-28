import { Directive, ElementRef, OnInit } from '@angular/core';

declare const $: any;

@Directive({
  selector: '[tooltip]',
})
export class TooltipDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit(): void {
    $(this.el.nativeElement).tooltip();
  }
}
