import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { CredenciamentoService } from '../credenciamento.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { TiposPessoa } from '../../interfaces';
import { MaxUploadSize } from '../../interfaces/credenciamento';

@Component({
    templateUrl: './upload.component.html',
    styleUrls: ['../credenciamento.styles.css']
})
export class CredenciamentoUploadComponent implements OnInit {
    constructor(private credenciamentoService: CredenciamentoService,
        private promptService: PromptService) { }

    tiposPessoa = TiposPessoa;

    // FORM CONTROLS
    tipoPessoa = new FormControl(TiposPessoa.fisica, Validators.required);
    documento = new FormControl('', Validators.required);
    nome = new FormControl('', [Validators.required, Validators.maxLength(100)]);
    fichaCadastro = new FormControl(null, Validators.required);
    identidade = new FormControl(null, Validators.required);
    comprovanteDeResidencia = new FormControl(null, Validators.required);
    contratoSocial = new FormControl(null);
    extratosBancarios = new FormArray([], Validators.required);

    // FORM GROUPS
    dadosCredenciado = new FormGroup({
        tipoPessoa: this.tipoPessoa,
        documento: this.documento,
        nome: this.nome
    });

    arquivos = new FormGroup({
        fichaCadastro: this.fichaCadastro,
        identidade: this.identidade,
        comprovanteDeResidencia: this.comprovanteDeResidencia,
        contratoSocial: this.contratoSocial,
        extratosBancarios: this.extratosBancarios
    });

    formCredenciamento = new FormGroup({
        dadosCredenciado: this.dadosCredenciado,
        arquivos: this.arquivos
    });

    // COMPUTED
    get pessoaFisica() { return this.tipoPessoa.value === TiposPessoa.fisica; }
    get fichaCadastroFileName() { return this.getFileName('fichaCadastro'); }
    get identidadeFileName() { return this.getFileName('identidade'); }
    get comprovanteDeResidenciaFileName() { return this.getFileName('comprovanteDeResidencia'); }
    get contratoSocialFileName() { return this.getFileName('contratoSocial'); }
    get extratosBancariosFileName() { return this.getFileName('extratosBancarios'); }

    // METHODS
    ngOnInit() {
        this.tipoPessoa.valueChanges.subscribe(tipo => {
            this.documento.setValue('');
            this.documento.markAsPristine();

            if (tipo === TiposPessoa.fisica) {
                this.identidade.setValidators(Validators.required);
                this.comprovanteDeResidencia.setValidators(Validators.required);
                this.contratoSocial.clearValidators();
            } else {
                this.identidade.clearValidators();
                this.comprovanteDeResidencia.clearValidators();
                this.contratoSocial.setValidators(Validators.required);
            }

            this.identidade.updateValueAndValidity();
            this.comprovanteDeResidencia.updateValueAndValidity();
            this.contratoSocial.updateValueAndValidity();
        });
    }

    getFileName(property) {
        return this[property].value && this[property].value.name;
    }

    bindFile(property, event, index = null) {
        const file = event.target.files[0];

        if (property !== 'extratosBancarios') {
            this[property].setValue(file);
        } else if (index || index === 0) {
            this.extratosBancarios.at(index).setValue(file);
        } else {
            const control = new FormControl(file, Validators.required);
            this.extratosBancarios.push(control);
            event.target.value = null;
        }
    }

    submitForm() {
        Object.keys(this.dadosCredenciado.controls).forEach(k => this.dadosCredenciado.controls[k].markAsDirty());
        Object.keys(this.arquivos.controls).forEach(k => this.arquivos.controls[k].markAsDirty());

        if (!this.formCredenciamento.valid) { return; }

        const formData = new FormData();
        let totalSize = 0;
        formData.append('status', '1');
        formData.append('tipoPessoa', this.tipoPessoa.value);
        formData.append('documento', this.documento.value);
        formData.append('nome', this.nome.value);
        formData.append('fichaCadastro', this.fichaCadastro.value);

        totalSize += this.fichaCadastro.value.size;

        if (this.pessoaFisica) {
            formData.append('identidade', this.identidade.value);
            formData.append('comprovanteDeResidencia', this.comprovanteDeResidencia.value);
            totalSize += this.identidade.value.size;
            totalSize += this.comprovanteDeResidencia.value.size;
        } else {
            formData.append('contratoSocial', this.contratoSocial.value);
            totalSize += this.contratoSocial.value.size;
        }

        for (let i = 0; i < this.extratosBancarios.value.length; i++) {
            formData.append('extratosBancarios' + i, this.extratosBancarios.value[i]);
            totalSize += this.extratosBancarios.value[i].size;
        }

        if (totalSize > MaxUploadSize ) {
            this.promptService.warn('Os arquivos selecionados ultrapassam o limite total de 20MB.');
            return;
        }

        this.credenciamentoService
            .enviarProposta(formData)
            .subscribe(data => {
                this.promptService
                    .inform('Credenciamento enviado com sucesso')
                    .then(() => {
                        this.formCredenciamento.reset();
                        this.tipoPessoa.setValue(1);

                        const controls = this.extratosBancarios.controls.length;
                        for (let i = 0; i < controls; i++) { this.extratosBancarios.removeAt(0); }
                    });
            });
    }
}
