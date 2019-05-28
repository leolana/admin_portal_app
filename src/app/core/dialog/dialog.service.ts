import { Injectable, ComponentFactoryResolver } from '@angular/core';

declare const $: any;

@Injectable({
  providedIn: 'root',
})
export class DialogService {
  static appViewRef = null;

  constructor(private componentFactoryResolver: ComponentFactoryResolver) {}

  open(component, options): Promise<any> {
    return new Promise((resolve, reject) => {
      const factory = this.componentFactoryResolver.resolveComponentFactory(component);
      const componentRef = DialogService.appViewRef.createComponent(factory);

      setTimeout(
        () =>
          $(componentRef.instance.element.nativeElement)
            .find('button:visible')
            .last()
            .focus(),
        0,
      );

      componentRef.instance.initialize(options, value => {
        componentRef.destroy();
        resolve(value);
      });
    });
  }
}
