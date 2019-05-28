import { Directive, Input, ElementRef, OnInit } from '@angular/core';

declare const $: any;

@Directive({
  selector: '[alpeExpandable]',
})
export class AlpeExpandableDirective implements OnInit {
  constructor(private el: ElementRef) {}

  handler: any;
  @Input() alpeExpandable: string;
  @Input() closest?: string;
  @Input() speed?: number;

  ngOnInit() {
    if (!this.alpeExpandable) {
      throw 'alpeExpandable: forneça o selector que será collapsado.';
    }

    this.handler = $(this.el.nativeElement);

    this.handler.on('click', () => {
      const container = this.closest ? this.handler.closest(this.closest) : this.handler;

      const target = container.find(this.alpeExpandable);
      if (!target.length) {
        throw 'alpeExpandable: selector não encontrado';
      }

      const speed = isNaN(this.speed) ? 400 : this.speed;
      target.slideToggle(speed);

      container.find('.fa-minus, .fa-plus').toggleClass('fa-minus fa-plus');
    });
  }
}
