import { ElementRef } from '@angular/core';

declare const $: any;

export class DialogComponent {
	constructor(private _e: ElementRef) {}

	result = null;

	onInit(options) {}

	initialize(options, closeCallback) {
		this.onInit(options);

		const modal = $(this._e.nativeElement).find('.modal').modal();
		let closeHandled = false;

		this.result = (value) => {
			closeHandled = true;
			modal.modal('hide');
			closeCallback(value);
		};

		modal.on('hidden.bs.modal', e => {
			if (!closeHandled)
				closeCallback();
		});
	}
}
