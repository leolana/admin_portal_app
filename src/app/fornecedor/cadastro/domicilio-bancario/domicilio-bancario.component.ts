import { OnInit, Component } from '@angular/core';
import { FormArray, Validators, FormGroup, FormControl } from '@angular/forms';
import { tap } from 'rxjs/operators';
import { zip } from 'rxjs';
import { Router } from '@angular/router';
import { FornecedorService } from '../../fornecedor.service';
import { DominioService } from 'src/app/dominio/dominio.service';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { NotificationService } from 'src/app/core/notification/notification.service';
import { MaxUploadSize } from 'src/app/interfaces/credenciamento';
import { FornecedorNumeroSteps } from 'src/app/interfaces/fornecedor';

@Component({
    styleUrls: ['../cadastro-fornecedor.component.css'],
    templateUrl: './domicilio-bancario.component.html',
})
export class DomicilioBancarioFornecedorComponent implements OnInit {
    constructor(
        private router: Router,
        private service: FornecedorService,
        private dominioService: DominioService,
        private prompt: PromptService,
        private notification: NotificationService,
    ) { }


    // PROPERTIES
    fornecedor;
    isSupported = true;
    bandeiras: any[] = [];
    bancos: any[] = [];
    domicilioConfirmado = false;
    domicilioArquivos = [];
    arquivosEdicao = [];
    steps;
    wizardConfig = {
        stepValidation: () => this.validateForm(),
        adjustmentSessionStorage: () => this.saveObject()
    };

    // FORMS
    domicilio = new FormArray([], Validators.required);
    extratosBancarios = new FormArray([]);

    formDocumentos = new FormGroup({
        extratosBancarios: this.extratosBancarios
    });


    // METHODS
    getBancos() {
        return this.dominioService.obterBancos().pipe(
            tap(bancos => this.bancos = bancos)
        );
    }

    getBandeiras() {
        return this.dominioService.obterBandeiras().pipe(
            tap(bandeiras => this.bandeiras = bandeiras)
        );
    }

    getNomeBancoPorId(control: FormControl): string {
        if (!control) {
            return '';
        }
        const id = control.value;
        const banco = this.bancos.find(b => b.id === id);
        return banco ? banco.text : '';
    }

    criaBandeirasForms() {
        this.bandeiras.forEach(bandeira => {
            const group = new FormGroup({
                bandeira: new FormControl(bandeira),
                banco: new FormControl('', Validators.required),
                agencia: new FormControl('', Validators.required),
                conta: new FormControl('', Validators.required),
                digito: new FormControl('', Validators.required)
            });

            if (this.fornecedor.domiciliosBancarios) {
                const domicilioBandeira = this.fornecedor.domiciliosBancarios.find(f => f.bandeiraId === bandeira.id);
                group.controls.banco.setValue(domicilioBandeira ? domicilioBandeira.bancoId : '');
                group.controls.agencia.setValue(domicilioBandeira ? domicilioBandeira.agencia : '');
                group.controls.conta.setValue(domicilioBandeira ? domicilioBandeira.conta : '');
                group.controls.digito.setValue(domicilioBandeira ? domicilioBandeira.digito : '');
            }

            this.domicilio.push(group);
        });
    }

    ngOnInit() {
        this.setSteps();
        zip(this.getBancos(), this.getBandeiras()).subscribe((data) => {
            this.fornecedor = this.service.getFornecedorSessionStorage();

            this.criaBandeirasForms();
            this.domicilio.controls.forEach((group: FormGroup, i) => {
                group.controls.banco.valueChanges.subscribe(id => {
                    this.domicilio.controls.slice(i + 1).forEach((nextGroup: FormGroup) => {
                        const nextBancoControl = nextGroup.controls.banco;
                        if (nextBancoControl.value !== id) {
                            nextGroup.controls.banco.setValue(id);
                        }
                    });
                });
            });

            if (this.fornecedor.domiciliosBancarios) {
                this.confirmarDomicilio();
                this.verificaArquivosExistentes();
            }

        });
    }

    setSteps() {
        this.steps = JSON.parse(sessionStorage.getItem('wizardFornecedor'));
        this.steps.forEach((step, i) => {
            if (i === FornecedorNumeroSteps.domicilioBancario) {
                step.url = `/fornecedor/domicilio-bancario`;
                step.cursor = 'pointer';
                step.class = 'active';
            } else if (i < FornecedorNumeroSteps.domicilioBancario) {
                step.class = 'activated';
            } else {
                step.class = '';
            }
        });
        sessionStorage.setItem('wizardFornecedor', JSON.stringify(this.steps));
    }

    chaveDomicilio({ banco, agencia, conta, digito }) {
        return `${banco}#${agencia}#${conta}-${digito}`;
    }

    confirmarDomicilio() {
        if (this.validaDomicilioForm()) {

            const agrupado = {};

            this.domicilio.value.forEach((group, i) => {
                const actual = (this.fornecedor.domiciliosBancarios || [])[i] || {};

                const keep = actual.bancoId === (group.bancoId || group.banco)
                    && actual.agencia === group.agencia
                    && actual.conta === group.conta
                    && actual.digito === group.digito;

                const data = {
                    banco: group.bancoId || group.banco,
                    agencia: group.agencia,
                    conta: group.conta,
                    digito: group.digito,
                    bancoNome: null,
                    bandeiras: null,
                    arquivo: keep ? actual.arquivo : null,
                    newFile: keep ? actual.newFile : true,
                    existing: keep ? actual.existing : false,
                    id: actual.id || null
                };
                const chave = this.chaveDomicilio(data);

                data.bandeiras = ((agrupado[chave] || {}).bandeiras || []).concat(group.bandeiraId || group.bandeira.id);
                data.bancoNome = this.bancos.find(b => b.id === data.banco).text;

                agrupado[this.chaveDomicilio(data)] = data;
            });

            while (this.extratosBancarios.length !== 0) {
                this.extratosBancarios.removeAt(0);
            }

            this.domicilioArquivos = Object.values(agrupado).map((domicilio: any) => {
                const control = new FormControl(null, Validators.required);
                this.extratosBancarios.push(control);

                if (domicilio.arquivo) {
                    control.setValue({
                        nomeArquivo: this.formatarNomeArquivo(domicilio.arquivo),
                        arquivo: domicilio.arquivo,
                        edicao: true
                    });
                }

                return {
                    id: this.chaveDomicilio(domicilio),
                    descricao: `${domicilio.bancoNome} - Ag. ${domicilio.agencia} / Conta ${domicilio.conta}-${domicilio.digito}`,
                    control: control,
                    values: domicilio,
                };
            });

            this.domicilioConfirmado = true;
        }
    }

    formatarNomeArquivo(arquivo) {
        if (!arquivo) {
            return arquivo;
        }

        return arquivo.substring(arquivo.lastIndexOf('/') + 1, arquivo.length);
    }

    verificaArquivosExistentes() {
        const documentosExistentes = this.fornecedor.arquivos;
        if (documentosExistentes) {
            documentosExistentes.filter(doc => doc.id.indexOf('extratosBancarios') == 0)
                .forEach(doc => {
                    const index = doc.id.slice(17);
                    this.extratosBancarios.controls[index].setValue(doc);
                });
        }
    }

    alterarDomicilio() {
        let promise = Promise.resolve(true);

        if (this.extratosBancarios.controls.some(control => control.dirty)) {
            promise = this.prompt.confirm('Os arquivos selecionados serão descartados. Deseja continuar?', 'Aviso');
        }

        promise.then(value => {
            if (value) {
                this.domicilioConfirmado = false;
            }
        });
    }

    validaDomicilioForm() {
        const group: any = this.domicilio.controls[0];
        Object.keys(group.controls).forEach(controlName => {
            group.controls[controlName].markAsDirty();
        });

        if (!group.valid) {
            this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
            return false;
        }
        return true;
    }

    bindFile(event, index) {
        event.preventDefault();
        const control = this.extratosBancarios.at(index);

        const file = event.target.files[0];

        const documento = this.fornecedor.documento;
        const fileSaved = this.dominioService.obterFileName(file, 'extratosBancarios', documento, 'fornecedor');
        if (fileSaved.length > 200) {
            this.notification.showErrorMessage('Nome do arquivo excedeu o limite de caracteres!');
            return;
        }

        const values = this.domicilioArquivos[index].values;

        values.arquivo = null;
        values.newFile = true;

        this.saveSessionStorage(file, index, control);
    }

    saveSessionStorage(file, index, control) {
        const property = `extratosBancarios${index}`;

        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const indexArquivo = (this.fornecedor.arquivos || []).findIndex(doc => doc.id === property);
                if (indexArquivo !== -1) {
                    this.fornecedor.arquivos.splice(indexArquivo, 1);
                    this.fornecedor.arquivos[indexArquivo] = {
                        id: property,
                        arquivo: e.target.result,
                        nomeArquivo: file.name,
                        tipoArquivo: file.type,
                    };
                } else {
                    this.fornecedor.arquivos = this.fornecedor.arquivos || [];
                    this.fornecedor.arquivos
                        .push({
                            id: property,
                            arquivo: e.target.result,
                            nomeArquivo: file.name,
                            tipoArquivo: file.type
                        });
                }
                try {
                    this.service.saveFornecedorSessionStorage(this.fornecedor);
                } catch (e) {
                    this.isSupported = false;
                    this.notification.showAlertMessage('O arquivo selecionado ultrapassa o limite suportado');
                }
                if (this.isSupported) this.setValueControl(file, control);
                this.isSupported = true;
            };
            reader.readAsDataURL(file);
        }
    }

    setValueControl(file, control) {
        const newValue = {
            nomeArquivo: file.name,
            arquivo: file
        };
        control.setValue(newValue);
        control.markAsDirty();
    }

    download(file: string, indice: number) {
        const reportId = this.domicilioArquivos[indice].values.id;
        this.service.downloadExtrato(this.fornecedor.id, reportId, file);
    }


    goBack() {
        this.router.navigate(['fornecedor/dados-cadastrais', { back: true }]);
    }

    submitForm() {
        if (!this.validateForm()) {
            return;
        }

        this.saveObject();
        this.router.navigateByUrl('fornecedor/tarifas');
    }

    validateForm(): any {
        if (!this.validaDomicilioForm()) {
            this.notification.showErrorMessage('Verifique os campos obrigatórios antes de prosseguir!');
            return false;
        }

        if (!this.domicilioConfirmado) {
            this.notification.showAlertMessage('Confirme os dados bancários antes de prosseguir!');
            return false;
        }

        let totalSize = 0;

        for (const extrato of this.extratosBancarios.controls) {
            extrato.markAsDirty();
            if (extrato.value && extrato.value.arquivo) {
                totalSize += extrato.value.arquivo.size || 0;
            }
        }

        if (!this.formDocumentos.valid) {
            this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
            return false;
        }

        if (totalSize > MaxUploadSize) {
            this.notification.showAlertMessage('Os arquivos selecionados ultrapassam o limite total de 20MB.');
            return false;
        }
        return true;
    }

    saveObject() {
        const domiciliosBandeiras = this.domicilioArquivos.map(domicilio =>
            domicilio.values.bandeiras.map(b => ({
                bandeiraId: b,
                bancoId: domicilio.values.banco,
                bancoNome: domicilio.values.bancoNome,
                agencia: domicilio.values.agencia,
                conta: domicilio.values.conta,
                digito: domicilio.values.digito,
                arquivo: domicilio.values.arquivo,
                existing: domicilio.values.existing,
                newFile: domicilio.values.newFile
            }))
        );

        let fornecedor = {
            domiciliosBancarios: [].concat.apply([], domiciliosBandeiras),
            arquivos: this.fornecedor.arquivos || [],
            unchangedFiles: [],
        };

        if (this.fornecedor) {
            fornecedor = Object.assign({}, this.fornecedor, fornecedor);
        }

        this.service.saveFornecedorSessionStorage(fornecedor);
    }
}
