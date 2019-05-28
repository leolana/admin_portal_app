import { Directive, ElementRef, OnInit, Input } from '@angular/core';

declare const $: any;

@Directive({
  selector: '[appPreserveBehavior]',
})
export class PreserveBehaviorDirective implements OnInit {
  constructor(private el: ElementRef) {}

  @Input() appPreserveBehavior: string;

  ngOnInit(): void {
    $(this.el.nativeElement).on(this.appPreserveBehavior, function() {
      return false;
    });
  }
}
