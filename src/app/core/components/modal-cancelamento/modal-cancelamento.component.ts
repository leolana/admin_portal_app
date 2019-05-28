import { Component, ElementRef, Output, EventEmitter, OnDestroy } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { recusaTipoEnum } from './recusa-tipo.enum';
import { MotivoRecusaService } from './motivo-recusa.service';
import { NotificationService } from '../../notification/notification.service';

declare const $: any;

export interface MotivoRecusaViewModel {
    id: number;
    descricao: string;
    requerObservacao: boolean;
}

@Component({
    selector: 'modal-cancelamento',
    templateUrl: './modal-cancelamento.component.html',
    styleUrls: ['./modal-cancelamento.component.css'],
})
export class ModalCancelamentoComponent implements OnDestroy {
    constructor(
        private element: ElementRef,
        private motivoRecusaService: MotivoRecusaService,
        private notificationService: NotificationService,
    ) { }

    // PROPERTIES
    motivosRecusa: MotivoRecusaViewModel[] = [];

    controls = {
        motivoTipoRecusaId: new FormControl(null),
        observacao: new FormControl(null),
    };
    form = new FormGroup(this.controls);

    hasError = {
        motivoTipoRecusaId: () => {
            if (!this.form.value.motivoTipoRecusaId) {
                return 'Selecione um Motivo de Recusa';
            }
        },
        observacao: () => {
            if (this.requerObservacao() && !this.form.value.observacao) {
                return 'Preencha o campo de Observação';
            }
        },
    };

    selectedItem: any;
    @Output() recusado = new EventEmitter();

    // METHODS
    open(recusaTipoId: recusaTipoEnum, selectedItem: any) {
        this.form.reset();
        this.selectedItem = selectedItem;
        this.getMotivosRecusa(recusaTipoId);

        $(this.element.nativeElement).appendTo('body').find('.modal').modal('show');
    }

    getMotivosRecusa(recusaTipoId: recusaTipoEnum) {
        this.motivosRecusa = [];
        this.motivoRecusaService.list(recusaTipoId).subscribe(arr => {
            this.motivosRecusa = arr.sort((a, b) => a.id - b.id);
            this.controls.motivoTipoRecusaId.setValue(arr[0] && arr[0].id);
        });
    }

    requerObservacao(): boolean {
        const option = this.motivosRecusa.find(m => m.id === +this.form.value.motivoTipoRecusaId);
        return option ? option.requerObservacao : false;
    }

    setObservacaoValue(value) {
        this.controls.observacao.setValue(String(value).trim());
    }

    recusar() {
        const errors = Object.keys(this.hasError)
            .map(key => (this.form.controls[key].markAsDirty(), this.hasError[key]()))
            .filter(error => error);

        if (errors.length) {
            errors.forEach(e => this.notificationService.showAlertMessage(e));
            return;
        }

        const value = this.form.value;
        if (!this.requerObservacao()) {
            value.observacao = null;
        }

        this.recusado.emit({
            item: this.selectedItem,
            value,
        });
    }

    close() {
        $(this.element.nativeElement).find('.modal').modal('hide');
    }

    ngOnDestroy() {
        $(this.element.nativeElement).remove();
    }
}
