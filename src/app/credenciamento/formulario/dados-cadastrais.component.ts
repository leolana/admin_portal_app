import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { NomeFunctions } from '../../core/functions/nome.functions';
import { CnpjFunctions } from '../../core/functions/cnpj.functions';
import { CpfFunctions } from '../../core/functions/cpf.functions';
import { DataFunctions } from './../../core/functions/data.functions';
import { CredenciamentoService } from '../credenciamento.service';
import { PromptService } from '../../core/prompt/prompt.service';
import { IParticipante } from '../../interfaces/participante';
import { DominioService } from '../../dominio/dominio.service';
import { TiposPessoa } from '../../interfaces';
import { Wizard, CredenciamentoNumeroSteps } from '../../interfaces/credenciamento';
import { NotificationService } from '../../core/notification/notification.service';
import { tags } from '../../core/tags';
import { DocumentoService } from '../../core/services/documento.service';

@Component({
    templateUrl: './dados-cadastrais.component.html'
})
export class CredenciamentoDadosCadastraisComponent implements OnInit {
    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private service: CredenciamentoService,
        private dominio: DominioService,
        private prompt: PromptService,
        private notification: NotificationService,
        private documentoService: DocumentoService,
    ) { }

    // PROPERTIES
    tiposPessoa = TiposPessoa;
    tipoPessoa = TiposPessoa.fisica;
    opcoesFaturamentoCartao: any[] = null;
    opcoesTicketMedio: any[] = null;
    inscricaoEstadualIsenta = false;
    inscricaoMunicipalIsenta = false;
    steps;

    jaPodePegarDoSessionStorage = false;
    temPassoAFrente = false;

    customValidators = {
        faturamentoAnual: () => {
            const faturamentoSelecionado = this.faturamentoAnual.value;
            const faturamentosDisponiveis = this.opcoesFaturamentoCartao;
            const faturamentoValido = faturamentosDisponiveis
                .some(faturamento => {
                    return faturamento.id == faturamentoSelecionado;
                });
            return faturamentoValido ? null : { message: 'Selecione um faturamento válido' };
        },
        ticketMedio: () => {
            const ticketSelecionado = +this.ticketMedio.value;
            const ticketsDisponiveis = this.opcoesTicketMedio;
            const ticketValido = ticketsDisponiveis
                .some(ticket => {
                    return ticket.id == ticketSelecionado;
                });
            return ticketValido ? null : { message: 'Selecione um ticket válido' };
        }
    };

    // FORM CONTROLS
    documento = new FormControl('', Validators.required);
    nome = new FormControl('', [Validators.required, NomeFunctions.validatorNomeCompleto]);
    telefone = new FormControl('', Validators.required);
    ramoAtividade = new FormControl('', Validators.required);
    cep = new FormControl('', Validators.required);
    logradouro = new FormControl('', Validators.required);
    numero = new FormControl('', Validators.required);
    complemento = new FormControl('');
    bairro = new FormControl('', Validators.required);
    cidade = new FormControl('', Validators.required);
    dataNascimento = new FormControl('');
    inscricaoEstadual = new FormControl('');
    inscricaoMunicipal = new FormControl('');
    razaoSocial = new FormControl('');
    dataAbertura = new FormControl('');
    faturamentoAnual = new FormControl('', [Validators.required]);
    ticketMedio = new FormControl('', [Validators.required]);
    nomeContato = new FormControl('', NomeFunctions.validatorNomeCompleto);
    emailContato = new FormControl('', [Validators.required, Validators.email]);
    telefoneContato = new FormControl('', Validators.required);
    celularContato = new FormControl('', Validators.required);

    // FORM GROUPS
    formDadosCadastrais = new FormGroup({
        documento: this.documento,
        nome: this.nome,
        telefone: this.telefone,
        ramoAtividade: this.ramoAtividade,
        cep: this.cep,
        logradouro: this.logradouro,
        numero: this.numero,
        complemento: this.complemento,
        bairro: this.bairro,
        cidade: this.cidade,
        dataNascimento: this.dataNascimento,
        inscricaoEstadual: this.inscricaoEstadual,
        inscricaoMunicipal: this.inscricaoMunicipal,
        razaoSocial: this.razaoSocial,
        dataAbertura: this.dataAbertura
    });
    formInformacoesFinanceiras = new FormGroup({
        faturamentoAnual: this.faturamentoAnual,
        ticketMedio: this.ticketMedio
    });
    formContato = new FormGroup({
        nomeContato: this.nomeContato,
        emailContato: this.emailContato,
        telefoneContato: this.telefoneContato,
        celularContato: this.celularContato
    });
    formCredenciamento = new FormGroup({
        dadosCadastrais: this.formDadosCadastrais,
        informacoesFinanceiras: this.formInformacoesFinanceiras,
        contato: this.formContato
    });

    wizardConfig = {
        stepValidation: () => this.validForm(),
        adjustmentSessionStorage: () => this.atualizaDadosSessionStorage()
    };

    // METODOS
    ngOnInit(): void {
        const passosAFrente = ['dadosInstalacao', 'dadosSocietarios', 'domicilioBancario', 'captura'];
        this.temPassoAFrente = Object.keys(sessionStorage).some(key => passosAFrente.indexOf(key) >= 0);

        this.setValidations();
        this.getTickets();
        this.getFaturamentos();
    }

    setValidations() {
        this.route.data.subscribe(data => {
            this.tipoPessoa = +data.tipoPessoa;

            if (this.tipoPessoa === TiposPessoa.fisica) {
                this.documento.setValidators(CpfFunctions.validator);
                this.dataNascimento.setValidators([Validators.required, DataFunctions.validatorDataFutura]);
            } else {
                this.nome.setValidators(Validators.required);
                this.documento.setValidators(CnpjFunctions.validator);
                this.inscricaoEstadual.setValidators(Validators.required);
                this.inscricaoMunicipal.setValidators(Validators.required);
                this.razaoSocial.setValidators(Validators.required);
                this.dataAbertura.setValidators([Validators.required, DataFunctions.validatorDataFutura]);
            }

            this.checkIfEditing();
        });
    }

    checkIfEditing() {
        this.route.params.subscribe(params => {
            const currentUrl = sessionStorage.getItem('currentUrl');
            if (this.temPassoAFrente && !params.back && !params.edicao && !params.analise && currentUrl !== this.route.url.toString()) {
                this.continuarCredenciamentoEmAberto().then(yes => {
                    this.jaPodePegarDoSessionStorage = true;
                    if (yes) {
                        this.manterDadosEspecificos();
                        this.router.navigateByUrl(currentUrl);
                    } else {
                        this.service.reset();
                        this.temPassoAFrente = false;
                    }
                    this.setSteps();
                });
            }
            else {
                this.jaPodePegarDoSessionStorage = true;
                this.setSteps();
                this.manterDadosEspecificos();
            }
        });
    }

    continuarCredenciamentoEmAberto(): Promise<boolean> {
        return new Promise(of => {
            const msg = JSON.parse(sessionStorage.getItem('credenciamentoEdicao')) ?
                `Existe uma alteração de EC em andamento, deseja retomar?` :
                'Existe um credenciamento em andamento, deseja retomar?';
            setTimeout(() => of(this.prompt.confirm(msg)), 0);
        });
    }

    getFaturamentos() {
        this.service.getFaturamentos()
            .subscribe(faturamentosDisponiveis => {
                this.opcoesFaturamentoCartao = faturamentosDisponiveis;
                this.faturamentoAnual.setValidators([Validators.required, this.customValidators.faturamentoAnual]);
                this.faturamentoAnual.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            });
    }

    verificaFaturamento() {
        this.route.params
            .subscribe(params => {
                const isEdicao = sessionStorage.getItem('credenciamentoEdicao');
                if (isEdicao && params.edicao && !!this.customValidators.faturamentoAnual()) {
                    this.notification.showAlertMessage(tags['faturamento-anual-desatualizado']);
                }
            });
    }

    getTickets() {
        this.service.getTickets()
            .subscribe(ticketsDisponiveis => {
                this.opcoesTicketMedio = ticketsDisponiveis;
                this.ticketMedio.setValidators([Validators.required, this.customValidators.ticketMedio]);
                this.ticketMedio.updateValueAndValidity({ onlySelf: true, emitEvent: false });
            });
    }

    manterDadosEspecificos() {
        const dados = JSON.parse(sessionStorage.getItem('dadosCadastrais'));

        if (dados) {
            if (this.tipoPessoa === TiposPessoa.juridica) {
                this.inscricaoEstadualIsenta = dados.inscricaoEstadual === 'ISENTO';
                this.desabilitarInscricaoEstadual();

                this.inscricaoMunicipalIsenta = dados.inscricaoMunicipal === 'ISENTO';
                this.desabilitarInscricaoMunicipal();
            }
            setTimeout(() => {
                this.cidade.setValue(dados.cidade);
                this.ramoAtividade.setValue(dados.ramoAtividade);
            }, 0);
        }
    }

    desabilitarInscricaoEstadual() {
        const value = this.inscricaoEstadualIsenta ? 'ISENTO' : '';
        this.inscricaoEstadual.setValue(value);
    }

    desabilitarInscricaoMunicipal() {
        const value = this.inscricaoMunicipalIsenta ? 'ISENTO' : '';
        this.inscricaoMunicipal.setValue(value);
    }

    setSteps() {
        const wizardSessionStorage = JSON.parse(sessionStorage.getItem('wizard'));
        let pessoa = +sessionStorage.getItem('tipoPessoa');
        if (!this.temPassoAFrente || !pessoa) pessoa = this.tipoPessoa;
        wizardSessionStorage ? this.steps = wizardSessionStorage : this.steps = Wizard.steps;
        this.steps.forEach((step, i) => {
            if (i > CredenciamentoNumeroSteps.dadosCadastrais) {
                step.class = '';
            } else {
                step.cursor = 'pointer';
                step.class = 'active';
                step.url = `/credenciamento/${TiposPessoa.urls[pessoa]}/`;
            }
            step.param = true;
        });
        sessionStorage.setItem('wizard', JSON.stringify(this.steps));
    }

    obterEndereco(cep) {
        if (cep) {
            this.dominio.obterEndereco(cep).subscribe(endereco => {
                this.logradouro.setValue(endereco.end);
                this.bairro.setValue(endereco.bairro);
                this.cidade.setValue(endereco.cidadeId);
            });
        }
    }

    validForm(): boolean {
        Object.keys(this.formDadosCadastrais.controls).forEach(k => this.formDadosCadastrais.controls[k].markAsDirty());
        Object.keys(this.formInformacoesFinanceiras.controls).forEach(k => this.formInformacoesFinanceiras.controls[k].markAsDirty());
        Object.keys(this.formContato.controls).forEach(k => this.formContato.controls[k].markAsDirty());

        this.formInformacoesFinanceiras.updateValueAndValidity({ emitEvent: false });

        if (this.formCredenciamento.invalid) {
            const controlsErrors = Object.keys(this.formCredenciamento.controls.dadosCadastrais['controls'])
                .map(key => this.formCredenciamento.controls.dadosCadastrais['controls'][key])
                .filter(control => control.errors)
                .map(control => control.errors)
                .reduce((errors, error, index) => {
                    const property = Object.keys(error)[0];
                    errors[property] = error[property];
                    return errors;
                }, {});

            if (controlsErrors['Nome']) {
                this.notification.showAlertMessage(controlsErrors['Nome']);
                return false;
            }
            if (controlsErrors['cnpj']) {
                this.notification.showAlertMessage('Verifique o campo CNPJ antes de prosseguir!');
                return false;
            }
            if (controlsErrors['cpf']) {
                this.notification.showAlertMessage('Verifique o campo CPF antes de prosseguir!');
                return false;
            }
            if (controlsErrors['data']) {
                this.notification.showAlertMessage('Verifique o campo data antes de prosseguir!');
                return false;
            }
            if (controlsErrors['dataFutura']) {
                this.notification.showAlertMessage(controlsErrors['dataFutura']);
                return false;
            }

            this.notification.showAlertMessage('Verifique os campos obrigatórios antes de prosseguir!');
            return false;
        }
        return true;
    }

    submitForm() {

        if (this.validForm()) {
            this.atualizaDadosSessionStorage();

            this.service.iniciarCredenciamento();
        }
    }

    atualizaDadosSessionStorage(): void {
        const novoCadastro: IParticipante = Object.assign({}, this.formDadosCadastrais.value);

        novoCadastro.informacoesFinanceiras = {
            faturamentoAnual: this.opcoesFaturamentoCartao.find(t => t.id === +this.formInformacoesFinanceiras.value.faturamentoAnual),
            ticketMedio: this.opcoesTicketMedio.find(t => t.id === +this.formInformacoesFinanceiras.value.ticketMedio)
        };

        sessionStorage.setItem('faturamento', JSON.stringify(novoCadastro.informacoesFinanceiras));

        const session = JSON.parse(sessionStorage.getItem('dadosCadastrais'));

        session.aberturaNascimento = this.tipoPessoa === TiposPessoa.fisica ? this.dataNascimento.value : this.dataAbertura.value;

        sessionStorage.setItem('dadosCadastrais', JSON.stringify(session));

        const dadosInstalacao = JSON.parse(sessionStorage.getItem('dadosInstalacao'));
        if (!dadosInstalacao) {
            const instalacao = {
                bairro: this.bairro.value,
                cep: this.cep.value,
                cidade: this.cidade.value,
                logradouro: this.logradouro.value,
                nome: this.nome.value,
                numero: this.numero.value,
                complemento: this.complemento.value,
                telefone: this.telefone.value,
            };

            sessionStorage.setItem('dadosInstalacao', JSON.stringify(instalacao));
        }
    }

    checkDocumentExistence(documento: string) {
        this.documentoService
            .checkDocumentExistence(documento)
            .subscribe(documents => {
                documents.forEach(o => {
                    const msg = tags['status-documento-' + o.statusDocumento];
                    this.notification.showInfoMessage(msg);
                });
            });
    }

}
