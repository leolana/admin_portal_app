import { NgControl } from '@angular/forms';
import { Directive, ElementRef, Input, OnInit, OnChanges, Optional } from '@angular/core';
import { environment } from '../../../environments/environment';

declare const $: any;

@Directive({
  selector: '[select2]',
})
export class Select2Directive implements OnInit, OnChanges {
  constructor(@Optional() private ngControl: NgControl, private el: ElementRef) {}

  @Input('select2') source: string;
  @Input('select2-hide-input') hideInput: string;
  @Input('select2-wait') minimumInputLength: number;
  @Input('select2-placeholder') placeholder: string;

  options: any = {
    language: 'pt-BR',
  };

  ngOnInit() {
    if (this.placeholder) {
      this.options.placeholder = this.placeholder;
    }

    if (this.source) {
      this.options.ajax = {
        url: `${environment.apiUrl}/${this.source}`,
        dataType: 'json',
        delay: 400,
        processResults: data => ({ results: data }),
      };

      this.options.minimumInputLength = this.minimumInputLength || 3;
    } else if (typeof this.hideInput !== 'undefined' && this.hideInput !== 'false') {
      this.options.minimumResultsForSearch = -1;
    }

    const select2 = $(this.el.nativeElement).select2(this.options);

    if (this.ngControl) {
      select2.on('change', e => {
        if (this.ngControl.control.value === this.el.nativeElement.value) {
          return;
        }

        this.ngControl.control.setValue(this.el.nativeElement.value);
      });

      const valueChanged = value => {
        if (this.el.nativeElement.value === value) {
          return;
        }

        if (this.source) {
          if (value) {
            const byId = (/\?/.test(this.source) ? '&' : '?') + 'id=' + value;

            $.get(`${environment.apiUrl}/${this.source}${byId}`).success(opts => {
              const option = opts[0];
              if (!option) return;

              const opt = new Option(option.text, option.id, false, true);
              $(this.el.nativeElement)
                .append(opt)
                .val(option.id)
                .trigger('change');
            });
          } else {
            $(this.el.nativeElement).select2(this.options);
          }
        } else {
          $(this.el.nativeElement)
            .val(value)
            .trigger('change');
        }
      };

      this.ngControl.control.valueChanges.subscribe(value => {
        valueChanged(value);
      });
    }
  }

  ngOnChanges(changes) {
    if (changes.placeholder && !changes.placeholder.firstChange) {
      this.options.placeholder = changes.placeholder.currentValue;

      $(this.el.nativeElement).select2(this.options);
    }
  }
}
