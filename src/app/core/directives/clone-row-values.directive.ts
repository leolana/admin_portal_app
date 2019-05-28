import { Directive, ElementRef, OnInit } from '@angular/core';

declare const $: any;

@Directive({
  selector: '[cloneRowValues]',
})
export class CloneRowValuesDirective implements OnInit {
  constructor(private el: ElementRef) {}

  ngOnInit() {
    const table = $(this.el.nativeElement);
    if (!table.is('table')) {
      throw String('[cloneRowValues] works only on <table>s');
    }

    table.on('input', 'input[mask]', function(e) {
      const input = $(e.target);
      const td = input.closest('td');
      const tr = td.closest('tr');

      const pos = [].indexOf.call(tr.children(), td[0]) + 1;
      tr.nextAll('tr')
        .find(`td:nth-child(${pos}) input`)
        .each((_, nextInput) => {
          nextInput.value = e.target.value;
          nextInput.dispatchEvent(new Event('input'));
        });
    });
  }
}
