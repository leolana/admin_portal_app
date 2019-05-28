import { Component, OnInit } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { EstabelecimentoService } from '../../../estabelecimento.service';
import { ParticipanteStatus, TiposDocumentos } from '../../../../../app/interfaces';
import { DialogService } from 'src/app/core/dialog/dialog.service';
import { IVinculo, VinculoStatus, IParticipante } from 'src/app/interfaces/participante';
import { PromptComponent } from 'src/app/core/prompt/prompt.component';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';
import { VinculoStatusPipe } from 'src/app/pipes/vinculo-status.pipe';
import { FormControl, FormGroup, EmailValidator } from '@angular/forms';
import { NumberFunctions } from 'src/app/core/functions/number.functions';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { ParticipanteIndicacaoStatusPipe } from 'src/app/pipes/participante-indicacao-status.pipe';
import { DatePipe } from '@angular/common';

declare const $: any;
export interface ViewIndicacaoFornecedor {
    id?: number;
    dataCadastro?: Date;
    status: string;
    documento: string;
    contato: {
        nome: string;
        email?: string;
        telefone?: string;
    };
    motivoCancelamento?: string;
    dataCancelamento?: any;
}

@Component({
    selector: 'alpe-fornecedor-indicacao',
    templateUrl: './fornecedor-indicacao.component.html',
    // styleUrls: ['./fornecedor-indicacao.component.css']
})
export class FornecedorIndicacaoComponent implements OnInit {
    constructor(
        private dialogService: DialogService,
        private service: EstabelecimentoService,
        private notification: NotificationService,
    ) { }

    itemEditing: ViewIndicacaoFornecedor;

    indicacao = {
        documento: new FormControl(null),
        nome: new FormControl(null),
        email: new FormControl(null),
        telefone: new FormControl(null),
    };
    formIndicacao = new FormGroup(this.indicacao);
    checkIndicacao = {
        documento: () => {
            if (!TiposDocumentos.isValidCnpj(this.indicacao.documento.value)) {
                return 'Documento inválido';
            }
        },
        nome: () => {
            if (!this.indicacao.nome.value) {
                return 'Informe o Nome';
            }
        },
        email: () => {
            if (!this.indicacao.email.value && !this.indicacao.telefone.value) {
                return 'Informe Email ou Telefone';
            }
            if (this.indicacao.email.value) {
                if (new EmailValidator().validate(this.indicacao.email)) {
                    return 'Email informado não é válido';
                }
            }
        },
        telefone: () => {
            if (!this.indicacao.email.value && !this.indicacao.telefone.value) {
                return 'Informe Email ou Telefone';
            }
            if (this.indicacao.telefone.value) {
                if (NumberFunctions.removeNonDigits(this.indicacao.telefone.value).length < 10) {
                    return 'Telefone informado não é válido';
                }
            }
        }
    };


    indicacoes: ViewIndicacaoFornecedor[];
    fornecedoresIndicacoes = new Datatable<ViewIndicacaoFornecedor>({
        table: [
            { property: 'documento', description: 'CNPJ' },
            { property: 'dataCadastro', description: 'Solicitação do Cadastro', pipe: 'date' },
            { property: 'nome', description: 'Nome' },
            { property: 'email', description: 'E-mail' },
            { property: 'telefone', description: 'Telefone' },
            { property: 'status', description: 'Status' },
            { property: 'motivoCancelamento', description: 'Motivo' },
            { property: 'dataCancelamento', description: 'Data Cancelamento' },
            {
                property: 'buttons',
                description: 'Ações',
                buttons: [
                    {
                        btnClass: 'btn-warning btn-xs m-5',
                        iconClass: 'fa-edit',
                        text: 'Editar',
                        fnAction: row => this.editar(row),
                        visible: row => this.isPendent(row),
                    },
                ]
            }
        ],
        data: []
    });

    ngOnInit() {
        this.getIndicacaoes();
    }

    getIndicacaoes(): void {
        this.service.obterIndicacaoes().subscribe(indicacoes => {
            this.indicacoes = indicacoes;
            const data = indicacoes.map(i => ({
                id: i.id,
                dataCadastro: i.dataCadastro,
                status: new ParticipanteIndicacaoStatusPipe().transform(i.status),
                documento: new DocumentoPipe().transform(i.documento),
                nome: i.contato.nome || '-',
                email: i.contato.email || '-',
                telefone: i.contato.telefone ? new TelefonePipe().transform(i.contato.telefone) : '-',
                motivoCancelamento: i.motivoCancelamento || '',
                dataCancelamento: i.dataCancelamento ? new DatePipe('pt').transform(i.dataCancelamento, 'shortDate') : '',
                contato: i.contato,
            }));
            this.fornecedoresIndicacoes.updateData(data);
        });
    }

    editar(row) {
        if ($('.modal-editar-indicacao').length) {
            $('.modal-editar-indicacao').first().appendTo('body').modal('show');
        }
        else {
            $('.modal-editar-indicacao').show();
        }
        setTimeout(() => $('#valorMaximoExibicao').select(), 200);

        this.itemEditing = row;
        Object.keys(this.formIndicacao.controls).forEach(control => {
            this.formIndicacao.controls[control].setValue(this.itemEditing[control]);
        });
    }


    isPendent(item) {
        return item.status === VinculoStatus.descricoes[1];
    }

    atualizarIndicacao(): void {
        const errors = Object.keys(this.checkIndicacao)
            .map(key => (this.formIndicacao.controls[key].markAsDirty(), this.checkIndicacao[key]()))
            .filter(error => error);

        if (errors.length) {
            errors.forEach(e => this.notification.showErrorMessage(e));
            return;
        }

        Object.keys(this.formIndicacao.controls).forEach(control => {
            this.itemEditing[control] = this.formIndicacao.controls[control].value;
        });

        this.itemEditing.documento = NumberFunctions.removeNonDigits(this.itemEditing.documento);

        this.service.alterarIndicacao(this.itemEditing).subscribe(() => {
            this.notification.showSuccessMessage('Indicação atualizada');
            $('.modal-editar-indicacao').modal('hide');
            this.itemEditing = null;
            this.getIndicacaoes();
        });
    }

}
