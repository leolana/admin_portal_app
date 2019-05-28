import { Component, OnInit } from '@angular/core';
import { Datatable } from '../../../../core/datatable/datatable.interface';
import { EstabelecimentoService } from '../../../estabelecimento.service';
import { IVinculo, VinculoStatus } from 'src/app/interfaces/participante';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { DocumentoPipe } from 'src/app/pipes/documento.pipe';

@Component({
    selector: 'alpe-fornecedor-cancelado',
    templateUrl: './fornecedor-cancelado.component.html',
    // styleUrls: ['./fornecedor-cancelado.component.css']
})
export class FornecedorCanceladoComponent implements OnInit {
    constructor(
        private service: EstabelecimentoService,
        private prompt: PromptService,
        private notification: NotificationService,
    ) { }

    vinculos: IVinculo[];
    fornecedoresCancelados = new Datatable<IVinculo>({
        table: [
            { property: 'nome', description: 'Nome' },
            { property: 'documento', description: 'CNPJ' },
            { property: 'dataCadastro', description: 'Data Cadastro', pipe: 'date' },
            { property: 'prazoAprovacao', description: 'Prazo Aprovação' },
            {
                property: 'exibeValorDisponivel',
                description: 'Exibir Valor Disponível',
                slideToggle: {
                    textTrue: 'Sim',
                    textFalse: 'Não',
                    disableSlideToggle: true,
                }
            },
            { property: 'valorMaximoDisponivel', description: 'Valor Máximo Disponível', pipe: 'currency' },
            {
                property: 'buttons',
                description: 'Ações',
                buttons: [
                    {
                        btnClass: 'btn-success btn-xs m-5',
                        iconClass: 'fa-handshake-o',
                        text: 'Reativar',
                        fnAction: row => this.reativar(row)
                    },
                ]
            }
        ],
        data: []
    });

    ngOnInit() {
        this.getVinculos();
    }

    getVinculos(): void {
        this.service.obterVinculos(VinculoStatus.cancelado).subscribe(vinculos => {
            this.vinculos = vinculos;

            const data = vinculos.map(v => ({
                id: v.id,
                nome: v.participante.nome,
                documento: new DocumentoPipe().transform(v.participante.documento),
                dataCadastro: v.dataCadastro,
                prazoAprovacao: this.diasText(v.diasAprovacao),
                exibeValorDisponivel: v.exibeValorDisponivel,
                valorMaximoDisponivel: v.valorMaximoExibicao || '-',
                participante: v.participante,
            }));

            this.fornecedoresCancelados.updateData(data);
        });
    }

    reativar(item: IVinculo): void {
        const message = `Deseja reativar o vínculo com o Fornecedor "${item.participante.nome}"?`;

        this.prompt.confirm(message, 'Confirmação').then(ans => ans &&
            this.service.reativarVinculo(item).subscribe(() => {
                item.status = VinculoStatus.aprovado;

                const fornecedor = item.participante.nome;
                const successMessage = `O vínculo com o fornecedor "${fornecedor}" foi reativado com sucesso`;

                this.getVinculos();

                this.notification.showSuccessMessage(successMessage);
            })
        );
    }

    diasText(dias) {
        if (dias == 1) {
            return `${dias} dia útil`;
        }
        return `${dias} dias úteis`;
    }
}
