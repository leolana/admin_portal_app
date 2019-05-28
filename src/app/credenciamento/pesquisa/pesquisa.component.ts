import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { DialogService } from '../../core/dialog/dialog.service';
import { CredenciamentoService } from '../credenciamento.service';
import { CredenciamentoArquivosComponent } from './dialog-arquivos.component';
import { CredenciamentoStatus } from '../../interfaces/credenciamento';
import { TiposPessoa } from '../../interfaces';
import { NotificationService } from '../../core/notification/notification.service';
import { DatePipe } from './../../pipes/date.pipe';

@Component({
    templateUrl: './pesquisa.component.html',
    styleUrls: ['./pesquisa.component.css']
})
export class CredenciamentoPesquisaComponent implements OnInit {
    constructor(
        private service: CredenciamentoService,
        private dialog: DialogService,
        private route: ActivatedRoute,
        private router: Router,
        private notification: NotificationService
    ) { }

    credenciamentoStatus = CredenciamentoStatus;

    // CONTROLS
    de = new FormControl('');
    ate = new FormControl('');
    status = new FormControl('');
    nome = new FormControl('');
    codigoEc = new FormControl('');
    documento = new FormControl('');

    // FORM GROUP
    formPesquisa = new FormGroup({
        de: this.de,
        ate: this.ate,
        status: this.status,
        nome: this.nome,
        codigoEc: this.codigoEc,
        documento: this.documento,
    });

    // PROPERTIES
    results: any[] = [];
    statusAprovado: boolean;

    hasError = {
        de: () => {
            if (new Date(this.de.value) > new Date(this.ate.value)) {
                return 'Range de datas inválidas';
            }
        },
        ate: () => this.hasError.de(),
    };

    ngOnInit(): void {
        this.route.queryParams.subscribe(query => {
            if (query.codigoEc) this.codigoEc.setValue(query.codigoEc);
            if (query.documento) this.documento.setValue(query.documento);
            if (query.nome) this.nome.setValue(query.nome);
            // Ajustar para preencher corretamente
            // if (query.de) this.de.setValue(new Date(query.de));
            // if (query.ate) this.ate.setValue(new Date(query.ate));
            if (query.status) this.status.setValue(query.status);

            this.filter();
        });
    }

    // METHODS
    getParams() {
        const errors = [];
        Object.keys(this.hasError).forEach(key => {
            this.formPesquisa.controls[key].markAsDirty();

            const error = this.hasError[key]();
            if (error) {
                errors.push(error);
            }
        });

        if (errors.length) {
            errors.forEach(e => this.notification.showErrorMessage(e));
            return;
        }

        const parameters: any = {};

        if (this.de.value) {
            parameters.de = this.de.value;
        }

        if (this.ate.value) {
            parameters.ate = this.ate.value;
        }

        if (this.status.value < 0) {
            parameters.preCadastro = true;
        } else if (this.status.value > 0) {
            parameters.status = this.status.value;
        }

        if (this.nome.value) {
            parameters.nome = this.nome.value;
        }

        if (this.codigoEc.value) {
            parameters.codigoEc = this.codigoEc.value;
        }

        if (this.documento.value) {
            parameters.documento = this.documento.value;
        }

        return parameters;
    }

    filter() {
        const parameters = this.getParams();

        this.router.navigate(
            [],
            {
                queryParams: parameters,
                replaceUrl: true,
            },
        );

        this.service.pesquisar(parameters).subscribe(credenciamentos => {
            this.statusAprovado = credenciamentos.some(i => i.status === CredenciamentoStatus.aprovado);

            credenciamentos.forEach(credenciamento => {
                credenciamento.dataAprovado = credenciamento.dataAprovado ? new DatePipe().transform(credenciamento.dataAprovado) : '-';
                credenciamento.statusCode = credenciamento.status;
                credenciamento.statusDescricao = CredenciamentoStatus.descricoes[credenciamento.status] || 'Pré-Cadastro';
                credenciamento.tipoPessoaId = credenciamento.tipoPessoa;
                credenciamento.tipoPessoaUrl = TiposPessoa.urls[credenciamento.tipoPessoa];
                credenciamento.tipoPessoaDescricao = TiposPessoa.descricoes[credenciamento.tipoPessoa];
            });

            this.results = credenciamentos;
        });
    }

    export() {
        const parameters = this.getParams();
        this.service.export(parameters);
    }

    clear() {
        this.de.setValue(null);
        this.ate.setValue(null);
        this.codigoEc.setValue(null);
        this.documento.setValue(null);
        this.nome.setValue(null);
        this.status.setValue('');
        this.filter();
    }

    exibirArquivos(documento, arquivos) {
        this.dialog.open(CredenciamentoArquivosComponent, { documento: documento, arquivos: arquivos });
    }

    exibirCredenciamento(id) {
        this.router.navigate([`credenciamento/${id}`]);
    }

    editarCredenciamento(id, status) {
        this.service.editarCredenciamento(id, status);
    }

    naoPodeEditar(item) {
        return !item.statusCode || item.statusCode === CredenciamentoStatus.pendente || item.statusCode === CredenciamentoStatus.reprovado;
    }

}
