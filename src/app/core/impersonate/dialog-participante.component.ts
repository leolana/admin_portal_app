import { Component, ElementRef } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { DialogComponent } from '../dialog/dialog.component';
import { NotificationService } from '../notification/notification.service';

@Component({ templateUrl: './dialog-participante.component.html' })
export class ImpersonateParticipanteComponent extends DialogComponent {
    constructor(
        private element: ElementRef,
        private notificationService: NotificationService
    ) {
        super(element);
    }

    participante = new FormControl(null, Validators.required);

    form = new FormGroup({
        participante: this.participante
    });

    onInit() { }

    definir() {
        if (!this.participante.valid) {
            this.notificationService.showErrorMessage('Escolha um participante!');
            return;
        }

        this.result(this.participante.value);
    }
}
