import { Component, OnInit } from '@angular/core';
import { FormControl, Validators, FormGroup } from '@angular/forms';
import { ExportacaoService } from './exportacao.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { IExportacao } from '../interfaces/exportacao';
import { tags } from '../core/tags';

@Component({
    templateUrl: './exportacao.component.html',
    styleUrls: ['./exportacao.component.css']
})
export class ExportacaoComponent implements OnInit {
    constructor(
        private exportacaoService: ExportacaoService,
        private notification: NotificationService
    ) { }

    controls = {
        dataOperacaoInicial: new FormControl('', Validators.required),
        dataOperacaoFinal: new FormControl('', Validators.required),
    };
    form = new FormGroup(this.controls);

    arquivos: IExportacao[];

    hasError = {
        dataOperacaoInicial: () => {
            if (!this.controls.dataOperacaoInicial.value) {
                return tags['data-inicio-nao-especificada'];
            }
        },
        dataOperacaoFinal: () => {
            if (!this.controls.dataOperacaoFinal.value) {
                return tags['data-fim-nao-especificada'];
            }
        },
        range: () => {
            const inicio = this.controls.dataOperacaoInicial.value;
            const fim = this.controls.dataOperacaoFinal.value;

            if ((inicio && fim) && inicio > fim) {
                return tags['periodo-data-invalido'];
            }
        },
    };

    ngOnInit(): void {
        this.exportacaoService.listar().subscribe(exportacoes => {
            this.arquivos = exportacoes;
        });
    }

    download(id: number): void {
        this.controls.dataOperacaoInicial.markAsDirty();
        this.controls.dataOperacaoFinal.markAsDirty();

        const validations = [
            this.hasError.dataOperacaoFinal(),
            this.hasError.dataOperacaoInicial(),
            this.hasError.range(),
        ];

        const errors = validations.filter(v => v != null);

        if (errors.length > 0) {
            errors.forEach(error => {
                this.notification.showAlertMessage(error);
            });
            return;
        }

        this.exportacaoService.download(
            id,
            this.controls.dataOperacaoInicial.value,
            this.controls.dataOperacaoFinal.value
        );
    }
}
