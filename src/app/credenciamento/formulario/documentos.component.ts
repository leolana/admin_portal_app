import { Component, OnInit } from '@angular/core';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormGroup, FormControl, FormArray, Validators, AbstractControl } from '@angular/forms';
import { CredenciamentoService } from '../credenciamento.service';
import { IDocumento, CredenciamentoSteps, MaxUploadSize, Wizard, CredenciamentoNumeroSteps } from '../../interfaces/credenciamento/';
import { TiposPessoa } from '../../interfaces';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { DominioService } from 'src/app/dominio/dominio.service';


@Component({
    templateUrl: './documentos.component.html',
    styleUrls: ['./documentos.component.css']
})
export class CredenciamentoDocumentosComponent implements OnInit {
    constructor(private location: Location,
        private route: ActivatedRoute,
        private credenciamentoService: CredenciamentoService,
        private dominioService: DominioService,
        private notification: NotificationService) {
        this.route.params.subscribe(params => {
            this.credenciamentoService.verificarCredenciamentoCorrente(params.pessoa);
        });
    }

    // FORM CONTROLS
    identidade = new FormControl(null);
    comprovanteDeResidencia = new FormControl(null);
    contratoSocial = new FormControl(null);
    extratosBancarios = new FormArray([]);

    // FORM GROUPS
    formDocumentos = new FormGroup({
        identidade: this.identidade,
        comprovanteDeResidencia: this.comprovanteDeResidencia,
        contratoSocial: this.contratoSocial,
        extratosBancarios: this.extratosBancarios
    });

    // PROPERTIES
    tiposPessoa = TiposPessoa;
    tipoPessoa = TiposPessoa.fisica;
    arquivosEdicao;
    steps;
    isSupported = true;
    loaded = false;

    domicilioBancario: any[] = [];

    wizardConfig = {
        stepValidation: () => this.validForm(),
        adjustmentSessionStorage: () => { }
    };

    get identidadeFileName() { return this.getFileName('identidade'); }
    get comprovanteDeResidenciaFileName() { return this.getFileName('comprovanteDeResidencia'); }
    get contratoSocialFileName() { return this.getFileName('contratoSocial'); }

    // METHODS
    ngOnInit() {
        const tiposPessoaStorage = +sessionStorage.getItem('tipoPessoa');
        this.tipoPessoa = tiposPessoaStorage;

        if (this.tipoPessoa === TiposPessoa.fisica) {
            this.identidade.setValidators(Validators.required);
            this.comprovanteDeResidencia.setValidators(Validators.required);
            this.contratoSocial.clearValidators();
        } else {
            this.identidade.clearValidators();
            this.comprovanteDeResidencia.clearValidators();
            this.contratoSocial.setValidators(Validators.required);
        }

        this.criaControlsParaArquivos();
        this.verificaArquivosExistentes();
        this.loaded = true;
        this.setSteps();
    }

    chaveDomicilio(d) { return `${d.banco.id}#${d.agencia}#${d.conta}-${d.digito}`; }

    criaControlsParaArquivos(): void {
        const agrupado = {};

        JSON.parse(sessionStorage.getItem('domicilioBancario') || '[]').forEach(domicilio => {
            if (domicilio.banco) {
                const key = this.chaveDomicilio(domicilio);

                const listaIds: any[] = (agrupado[key] || {}).domiciliosId || [];
                listaIds.push(domicilio.id);
                agrupado[key] = {
                    ...domicilio,
                    domiciliosId: listaIds
                };
            }
        });

        this.domicilioBancario = Object.values(agrupado).map((domicilio: any, i) => {
            const control = new FormControl(null, Validators.required);
            this.extratosBancarios.push(control);

            if (domicilio.existing) {
                control.setValue({
                    tipo: `extratosBancarios${i}`,
                    arquivo: domicilio.arquivo,
                    nomeArquivo: this.formatarNomeArquivo(domicilio.arquivo),
                    edicao: true
                });
            }

            return {
                id: this.chaveDomicilio(domicilio),
                idTabela: domicilio.id,
                descricao: `${domicilio.banco.text} - Ag. ${domicilio.agencia} / Conta ${domicilio.conta}-${domicilio.digito}`,
                control: control
            };
        });
        this.getDocumentosExistentes();

    }

    getDocumentosExistentes() {
        this.arquivosEdicao = JSON.parse(sessionStorage.getItem('documentosExistentes'));
        if (this.arquivosEdicao) {
            this.arquivosEdicao.filter(d => !d.id.startsWith('extratosBancarios') && d.id !== 'analise')
                .forEach(documento => {
                    this[documento.id].setValue({
                        tipo: documento.id,
                        tipoFormatado: this.formatarTipoDocumento(documento.id),
                        arquivo: documento.arquivo,
                        nomeArquivo: this.formatarNomeArquivo(documento.arquivo),
                        edicao: true
                    });
                });
        }
    }

    setSteps() {
        this.steps = JSON.parse(sessionStorage.getItem('wizard'));
        this.steps.forEach((step, i) => {
            if (i === CredenciamentoNumeroSteps.documentos) {
                step.url = `/credenciamento/${TiposPessoa.urls[this.tipoPessoa]}/documentos`;
                step.cursor = 'pointer';
                step.class = 'active';
            } else if (i < CredenciamentoNumeroSteps.documentos) {
                step.class = 'activated';
            } else {
                step.class = '';
            }
        });
        sessionStorage.setItem('wizard', JSON.stringify(this.steps));
    }

    bindFile(property, event, index = null) {
        event.preventDefault();

        let control: AbstractControl = null;
        if (property === 'extratosBancarios') {
            control = this.extratosBancarios.at(index);
            const domicilios = JSON.parse(sessionStorage.getItem('domicilioBancario'));
            domicilios.filter(d => this.chaveDomicilio(d) === this.domicilioBancario[index].id).forEach(d => {
                d.newFile = true;
                d.arquivo = null;
            });
            sessionStorage.setItem('domicilioBancario', JSON.stringify(domicilios));
        } else {
            control = this[property];
        }

        this.saveSessionStorage(property, event, index, control);

    }

    saveSessionStorage(property, event, index, control) {
        const file = event.target.files[0];
        const documento = JSON.parse(sessionStorage.getItem('dadosCadastrais')).documento;
        const fileSaved = this.dominioService.obterFileName(file, property, documento, 'credenciamento');
        const tamMaxStringFile = property === 'extratosBancarios' ? 200 : 250;
        if (fileSaved.length > tamMaxStringFile) {
            this.notification.showErrorMessage('Nome do arquivo excedeu o limite de caracteres!');
            return;
        }
        if (property === 'extratosBancarios') property = property + index;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const docs = JSON.parse(sessionStorage.getItem('documentos') || '[]');
                const updateDoc = docs.find(doc => doc.id === property);
                if (updateDoc) {
                    updateDoc.arquivo = e.target.result;
                    updateDoc.nomeArquivo = file.name;
                    updateDoc.tipoArquivo = file.type;
                } else {
                    docs.push({ id: property, arquivo: e.target.result, nomeArquivo: file.name, tipoArquivo: file.type });
                }
                try {
                    sessionStorage.setItem('documentos', JSON.stringify(docs));
                } catch (e) {
                    this.isSupported = false;
                    this.notification.showAlertMessage('O arquivo selecionado ultrapassa o limite suportado');
                }
                if (this.isSupported) this.setValueControl(event, control);
                this.isSupported = true;
            };
            reader.readAsDataURL(event.target.files[0]);
        }

        if (this.arquivosEdicao) {
            const indexArquivo = this.arquivosEdicao.findIndex(arq => arq.id === property);
            if (indexArquivo !== -1) {
                this.arquivosEdicao.splice(indexArquivo, 1);
                sessionStorage.setItem('documentosExistentes', JSON.stringify(this.arquivosEdicao));
            }
        }
    }

    setValueControl(event, control) {
        const file = event.target.files[0];

        const newValue = {
            nomeArquivo: file.name,
            arquivo: file
        };
        control.setValue(newValue);
        control.markAsDirty();
    }

    verificaArquivosExistentes() {
        const documentosExistentes = JSON.parse(sessionStorage.getItem('documentos'));
        if (documentosExistentes) {
            documentosExistentes.forEach(doc => {
                if (!doc.id.startsWith('extratosBancarios'))
                    this.formDocumentos.controls[doc.id].setValue(doc);
            });
            documentosExistentes.filter(doc => doc.id.indexOf('extratosBancarios') == 0)
                .forEach(doc => {
                    const index = doc.id.slice(17);
                    this.extratosBancarios.controls[index].setValue(doc);
                });
        }
    }

    goBack() {
        this.credenciamentoService.retrocederCredenciamento(CredenciamentoSteps.documentos);
    }

    validForm() {
        Object.keys(this.formDocumentos.controls).forEach(k => this.formDocumentos.controls[k].markAsDirty());
        for (const control of this.extratosBancarios.controls) {
            control.markAsDirty();
        }

        if (!this.formDocumentos.valid) {
            this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
            return false;
        }

        let totalSize = 0;

        if (this.identidade.value) {
            totalSize += this.identidade.value.arquivo.size || 0;
        }

        if (this.comprovanteDeResidencia.value) {
            totalSize += this.comprovanteDeResidencia.value.arquivo.size || 0;
        }

        if (this.contratoSocial.value) {
            totalSize += this.contratoSocial.value.arquivo.size || 0;
        }

        for (const extrato of this.domicilioBancario) {
            totalSize += extrato.control.value.arquivo.size || 0;
        }

        if (totalSize > MaxUploadSize) {
            this.notification.showAlertMessage('Os arquivos selecionados ultrapassam o limite total de 20MB.');
            return false;
        }
        return true;
    }

    submitForm() {
        if (!this.validForm()) return;
        this.credenciamentoService.prosseguirCredenciamento(CredenciamentoSteps.documentos);
    }

    download(source: FormControl, indice = null) {
        const tipo = source.value.tipo;
        const arquivo = source.value.arquivo;
        const file = source.value.nomeArquivo;

        const patternParaRemoverPontosTracos = /[\./-]/g;

        const partes = arquivo.split('/');
        const doc = partes[1] && partes[1].replace(patternParaRemoverPontosTracos, '');

        this.credenciamentoService.download('credenciamento', doc, tipo, indice, file);
    }

    downloadExtrato(source: FormControl, indice = null) {
        const file = source.value.nomeArquivo;

        const extratoId = this.domicilioBancario[indice].idTabela;

        this.credenciamentoService.downloadExtrato(extratoId, file);
    }

    getFileName(property) {
        if (this[property].value) {
            return this[property].value.nomeArquivo;
        }

        return null;
    }

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
        ];

        return NOME_DOCUMENTOS_FORMATADOS.filter(d => d.documento === documento)[0].nomeFormatado;
    }

}
