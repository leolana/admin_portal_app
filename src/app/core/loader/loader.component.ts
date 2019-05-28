import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

import { LoaderService } from './loader.service';
import { LoaderState } from './loader';

declare const $: any;

@Component({
    selector: 'app-loader',
    templateUrl: 'loader.component.html',
    styleUrls: ['loader.component.css']
})
export class LoaderComponent implements OnInit, OnDestroy {

    // Tempo até a tela escurecer
    waitTime = 1000;

    blocked = false;
    loadingSubscription: Subscription;

    buttons = $();

    constructor(
        private loaderService: LoaderService
    ) {
    }

    ngOnInit() {
        this.loadingSubscription = this.loaderService.onLoadingChanged()
            .subscribe((isLoading) => this.handlerLoaderState(isLoading));
    }

    ngOnDestroy() {
        this.loadingSubscription.unsubscribe();
    }

    handlerLoaderState(isLoading: boolean) {
        if (isLoading) {
            this.buttons = this.buttons.add('button:not(:disabled)');
            this.buttons.prop('disabled', true);

            if (!this.blocked) {
                $.blockUI({
                    message: null,
                    css: { border: 'none' },
                    overlayCSS: { opacity: 0 },
                    fadeIn: 0
                });

                setTimeout(() => {
                    if (this.blocked) {
                        const newMessage = $('.loading-wrap');
                        if (newMessage.length) {
                            $.blockUI({
                                message: newMessage,
                                css: { border: 'none' },
                                fadeIn: 200
                            });
                        }
                    }
                }, this.waitTime);
            }
        } else {
            if (this.blocked) {
                this.buttons.prop('disabled', false);
                this.buttons = $();

                $.unblockUI();
            }
        }

        this.blocked = isLoading;
    }
}
