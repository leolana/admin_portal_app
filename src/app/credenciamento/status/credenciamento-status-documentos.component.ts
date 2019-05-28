import { Component, Input, OnInit } from '@angular/core';
import { CredenciamentoService } from '../credenciamento.service';

@Component({
    selector: 'alpe-credenciamento-status-documentos',
    templateUrl: './credenciamento-status-documentos.component.html'
})
export class CredenciamentoStatusDocumentosComponent implements OnInit {
    constructor(
        private credenciamentoService: CredenciamentoService
    ) { }

    @Input() dados: any[];
    documentos: any[];
    extratosBancarios: any[];
    analises: any[];

    formatarNomeArquivo(arquivo) {
        if (!arquivo) {
            return arquivo;
        }

        return arquivo.substring(arquivo.lastIndexOf('/') + 1, arquivo.length);
    }

    formatarTipoDocumento(documento) {
        const NOME_DOCUMENTOS_FORMATADOS = [
            { documento: 'fichaCadastro', nomeFormatado: 'Ficha de Cadastro' },
            { documento: 'identidade', nomeFormatado: 'Documento de Identidade' },
            { documento: 'comprovanteDeResidencia', nomeFormatado: 'Comprovante de Residência' },
            { documento: 'contratoSocial', nomeFormatado: 'Contrato Social' },
            { documento: 'extratosBancarios', nomeFormatado: 'Extrato Bancário' },
            { documento: 'analise', nomeFormatado: 'Análise' },
        ];

        return NOME_DOCUMENTOS_FORMATADOS.filter(d => d.documento === documento)[0].nomeFormatado;
    }

    ngOnInit(): void {
        this.documentos = this.dados.filter(d => d.tipo !== 'extratosBancarios' && d.tipo !== 'analise')
            .map(documento => {
                return {
                    tipo: documento.tipo,
                    tipoFormatado: this.formatarTipoDocumento(documento.tipo),
                    arquivo: documento.arquivo,
                    nomeArquivo: this.formatarNomeArquivo(documento.arquivo),
                };
            });

        this.extratosBancarios = this.dados.filter(d => d.tipo === 'extratosBancarios')
            .map(documento => {
                return {
                    tipo: documento.tipo,
                    arquivo: documento.arquivo,
                    nomeArquivo: this.formatarNomeArquivo(documento.arquivo),
                    id: documento.domicilios[0]
                };
            });

        this.analises = this.dados.filter(d => d.tipo === 'analise')
            .map(documento => {
                return {
                    tipo: 'analises',
                    arquivo: documento.arquivo,
                    observacao: documento.observacao,
                    nomeArquivo: this.formatarNomeArquivo(documento.arquivo),
                };
            });
    }

    download(tipo, arquivo, file, indice = null) {

        const patternParaRemoverPontosTracos = /[\./-]/g;

        const docIndex = tipo === 'analises' ? 2 : 1;

        const partes = arquivo.split('/');
        const doc = partes[docIndex] && partes[docIndex].replace(patternParaRemoverPontosTracos, '');

        this.credenciamentoService.download('credenciamento', doc, tipo, indice, file);
    }

    downloadExtrato(id, file) {
        this.credenciamentoService.downloadExtrato(id, file);
    }

    downloadAll() {
        this.documentos.forEach(item => {
            this.download(item.tipo, item.arquivo, item.nomeArquivo);
        });

        this.extratosBancarios.forEach((item, i) => {
            this.downloadExtrato(item.id, item.nomeArquivo);
        });

        this.analises.forEach((item, i) => {
            this.download(item.tipo, item.arquivo, item.nomeArquivo, i);
        });
    }
}
