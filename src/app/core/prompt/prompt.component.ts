import { Component, ElementRef } from '@angular/core';
import { DialogComponent } from '../dialog/dialog.component';

@Component({ templateUrl: './prompt.component.html' })
export class PromptComponent extends DialogComponent {
  constructor(private element: ElementRef) {
    super(element);
  }

  title = '';
  message = '';
  css = '';

  isOkVisible = false;
  isYesVisible = false;
  isNoVisible = false;

  onInit(options) {
    this.title = options.title || '';
    this.message = options.message || '';
    this.css = options.css || 'primary';

    this.isOkVisible = !!options.buttons.ok;
    this.isYesVisible = !!options.buttons.yes;
    this.isNoVisible = !!options.buttons.no;
  }
}
