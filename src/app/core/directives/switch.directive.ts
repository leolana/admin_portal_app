import { Directive, ElementRef, Input, OnInit, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

declare const $: any;

@Directive({
    selector: '[switch]'
})
export class SwitchDirective implements OnInit {
    static defaultsSettedUp = false;

    @Input('switch') size;
    @Input('switch-on-text') onText;
    @Input('switch-off-text') offText;
    @Input('switch-on-color') onColor;
    @Input('switch-off-color') offColor;

    constructor(private el: ElementRef, @Optional() private ngControl: NgControl) {
        this._setupDefaults();
    }

    ngOnInit() {
        const $el = $(this.el.nativeElement);
        const control = this.ngControl;

        $el.bootstrapSwitch({
            onSwitchChange: (e, state) => {
                if (control) {
                    control.control.setValue(state);
                }
            },
        });

        if (control) {
            control.valueChanges.subscribe(value => {
                $el.bootstrapSwitch('state', value);
            });

            if (control.value) {
                setTimeout(() => $el.bootstrapSwitch('state', true));
            }
        }

        if (this.size) {
            $el.bootstrapSwitch('size', this.size);
        }
    }

    _setupDefaults() {
        if (SwitchDirective.defaultsSettedUp) {
            return;
        }

        $.fn.bootstrapSwitch.defaults.size = 'small';
        $.fn.bootstrapSwitch.defaults.onText = '';
        $.fn.bootstrapSwitch.defaults.offText = '';
        $.fn.bootstrapSwitch.defaults.labelWidth = 10;

        SwitchDirective.defaultsSettedUp = true;
    }
}
