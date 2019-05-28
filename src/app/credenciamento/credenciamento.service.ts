import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, Subject, of } from 'rxjs';
import { DominioService } from '../dominio/dominio.service';
import { environment } from '../../environments/environment';
import {
    Credenciamento, CredenciamentoSteps, IDadosInstalacao,
    ICaptura, IDocumento, ICondicaoComercial, Wizard, CredenciamentoStatus
} from '../interfaces/credenciamento/';
import { TiposPessoa } from '../interfaces';
import { IParametrosPesquisa, IIndicacao } from '../interfaces/participante/indicacao';
import { catchError } from 'rxjs/operators';
import { NotificationService } from '../core/notification/notification.service';
import { tags } from '../core/tags';
import { getFileNameFromResponseContentDisposition, saveFile } from '../core/services/download.service';

@Injectable({
    providedIn: 'root'
})
export class CredenciamentoService {
    credenciamento: Credenciamento = null;
    subject = new Subject<any>();

    constructor(
        private http: HttpClient,
        private router: Router,
        private dominio: DominioService,
        private notification: NotificationService,
    ) {
        this.credenciamento = new Credenciamento(TiposPessoa.fisica);
    }

    enviarProposta(proposta) {
        return this.http.post(`${environment.apiUrl}/credenciamento/pre-cadastro`, proposta);
    }

    pesquisar(parametros: any, hideLoading: boolean = false): Observable<any[]> {
        return this.http.get<any[]>(`${environment.apiUrl}/credenciamento`, {
            params: { hideLoading: hideLoading, ...parametros },
        });
    }

    pesquisarCredenciamentoIndicacao(documento): Observable<any> {
        return this.http.get<any[]>(`${environment.apiUrl}/credenciamentoIndicacao/${documento}`);
    }


    export(parametros: any): void {
        this.http.get(`${environment.apiUrl}/credenciamento/export`, {
            params: parametros,
            responseType: 'blob',
            observe: 'response',
        }).subscribe((response: HttpResponse<Blob>) => {
            const fileName = getFileNameFromResponseContentDisposition(response);
            saveFile(response.body, fileName);
        });
    }

    pesquisarIndicacoes(parametros: IParametrosPesquisa): Observable<IIndicacao[]> {
        return this.http.get<IIndicacao[]>(`${environment.apiUrl}/estabelecimento/indicacoes`, {
            params: { ...parametros as any },
        });
    }

    download(resource, documento, tipo, indice, file) {
        this.http
            .get(`${environment.apiUrl}/${resource}/${documento}/arquivos/${tipo}/${indice}`, { responseType: 'blob' })
            .pipe(catchError(err => {
                this.notification.showErrorMessage(tags['download-' + tipo], {
                    progressBar: false,
                    tapToDismiss: true,
                    autoDismiss: false,
                    disableTimeOut: true
                });
                return err;
            }))
            .subscribe((blob: Blob) => {
                saveFile(blob, file);
            });
    }

    downloadExtrato(reportId, file) {
        this.http
            .get(`${environment.apiUrl}/credenciamento/extratos/${reportId}`, { responseType: 'blob' })
            .pipe(catchError(err => {
                this.notification.showErrorMessage(tags['download-extratosBancarios'], {
                    progressBar: false,
                    tapToDismiss: true,
                    autoDismiss: false,
                    disableTimeOut: true
                });
                return err;
            }))
            .subscribe((blob: Blob) => {
                saveFile(blob, file);
            });
    }

    obterTaxas(): Observable<any[]> {
        return this.http.get<any>(`${environment.apiUrl}/dominio/taxas`, {
            params: {
                tipoPessoa: `${+(sessionStorage.getItem('tipoPessoa'))}`,
                ramoAtividade: `${JSON.parse(sessionStorage.getItem('dadosCadastrais')).ramoAtividade}`,
                faturamentoCartao: `${JSON.parse(sessionStorage.getItem('faturamento')).faturamentoAnual.id}`
            }
        });
    }

    verificarCredenciamentoCorrente(pessoa) {
        if (!this.credenciamento) {
            this._navegar(CredenciamentoSteps.dadosCadastrais, pessoa);
        }
    }

    iniciarCredenciamento() {
        this.credenciamento.tipoPessoa = +sessionStorage.getItem('tipoPessoa');

        const passo = this.credenciamento.tipoPessoa === TiposPessoa.fisica
            ? CredenciamentoSteps.dadosInstalacao
            : CredenciamentoSteps.dadosSocietarios;

        this._navegar(passo);
    }

    prosseguirCredenciamento(passoAtual, values = null) {
        if (passoAtual === CredenciamentoSteps.dadosSocietarios) {
            this._navegar(CredenciamentoSteps.dadosInstalacao);
        }

        if (passoAtual === CredenciamentoSteps.dadosInstalacao) {
            this._navegar(CredenciamentoSteps.domicilioBancario);
        }

        if (passoAtual === CredenciamentoSteps.domicilioBancario) {
            this._navegar(CredenciamentoSteps.captura);
        }

        if (passoAtual === CredenciamentoSteps.captura) {
            this._navegar(CredenciamentoSteps.documentos);
        }

        if (passoAtual === CredenciamentoSteps.documentos) {
            this._navegar(CredenciamentoSteps.condicoesComerciais);
        }
    }

    retrocederCredenciamento(passoAtual, juridica = null) {
        if (juridica != null) {
            this._navegar(CredenciamentoSteps.dadosSocietarios, TiposPessoa.juridica);
        }
        else if (passoAtual === CredenciamentoSteps.dadosInstalacao) {
            this._navegar(CredenciamentoSteps.dadosCadastrais, null, 'back');
        }
        if (passoAtual === CredenciamentoSteps.dadosSocietarios) {
            this._navegar(CredenciamentoSteps.dadosCadastrais, TiposPessoa.juridica);
        }
        if (passoAtual === CredenciamentoSteps.domicilioBancario) {
            this._navegar(CredenciamentoSteps.dadosInstalacao);
        }
        if (passoAtual === CredenciamentoSteps.captura) {
            this._navegar(CredenciamentoSteps.domicilioBancario);
        }
        if (passoAtual === CredenciamentoSteps.documentos) {
            this._navegar(CredenciamentoSteps.captura);
        }
        if (passoAtual === CredenciamentoSteps.condicoesComerciais) {
            this._navegar(CredenciamentoSteps.documentos);
        }
    }

    enviarCredenciamento(condicaoComercial: ICondicaoComercial) {
        this.credenciamento.condicaoComercial = condicaoComercial;

        this.getSessionStorage();
        this.converteArquivos();

        const formData = new FormData();

        const unchangedFiles = [];
        this.credenciamento.documentos.forEach(documento => {
            if (typeof (documento.arquivo) === 'string') {
                unchangedFiles.push({
                    id: documento.id,
                    arquivo: documento.arquivo
                });
            } else {
                formData.append(
                    documento.id,
                    documento.arquivo,
                    (documento as any).nomeArquivo
                );
            }
        });

        if (unchangedFiles.length > 0) {
            formData.append('unchangedFiles', JSON.stringify(unchangedFiles));
        }

        formData.append('data', JSON.stringify(this.credenciamento));

        let url = environment.apiUrl;
        if (Boolean(sessionStorage.getItem('credenciamentoEmAnalise'))) {
            url += '/credenciamento/analise';
        } else {
            url += '/credenciamento';
        }

        return this.http.post(url, formData);
    }

    getSessionStorage() {
        this.credenciamento.tipoPessoa = JSON.parse(sessionStorage.getItem('tipoPessoa'));
        this.credenciamento.dadosCadastrais = JSON.parse(sessionStorage.getItem('dadosCadastrais'));
        this.credenciamento.dadosCadastrais.informacoesFinanceiras = JSON.parse(sessionStorage.getItem('faturamento'));
        this.credenciamento.dadosCadastrais.contato = JSON.parse(sessionStorage.getItem('contato'));
        this.credenciamento.dadosCadastrais.socios = JSON.parse(sessionStorage.getItem('dadosSocietarios'));
        this.credenciamento.instalacao = JSON.parse(sessionStorage.getItem('dadosInstalacao'));
        this.credenciamento.dadosCadastrais.domiciliosBancarios = JSON.parse(sessionStorage.getItem('domicilioBancario'));
        this.credenciamento.captura = JSON.parse(sessionStorage.getItem('captura'));
    }

    converteArquivos() {
        const docs = JSON.parse(sessionStorage.getItem('documentos'));
        if (docs) {
            docs.forEach(doc => {
                doc.arquivo = this.base64ToFile(
                    doc.arquivo
                );
            });
            this.credenciamento.documentos = docs;
        }

        const docsExistentes = JSON.parse(sessionStorage.getItem('documentosExistentes'));
        if (docsExistentes) {
            if (docs) {
                docsExistentes.forEach(doc => {
                    this.credenciamento.documentos.push(doc);
                });
            } else {
                this.credenciamento.documentos = docsExistentes;
            }
        }
    }

    base64ToFile(base64) {
        let byteString;
        if (base64.split(',')[0].indexOf('base64') >= 0)
            byteString = atob(base64.split(',')[1]);
        else
            byteString = unescape(base64.split(',')[1]);

        const mimeString = base64.split(',')[0].split(':')[1].split(';')[0];
        const byteArray = new Uint8Array(byteString.length);
        for (let i = 0; i < byteString.length; i++) {
            byteArray[i] = byteString.charCodeAt(i);
        }

        return new Blob([byteArray], { type: mimeString });
    }

    analisar(id: number) {
        return this.http.post(`${environment.apiUrl}/credenciamento/${id}/analisar`, {});
    }

    uploadDocumentoAnalise(id: number, documento: any) {
        const formData = new FormData();

        formData.append('analise', documento.arquivo);

        formData.append('data', JSON.stringify({
            id: documento.id,
            nomeArquivo: documento.nomeArquivo,
            observacao: documento.observacao,
        }));

        return this.http.post(`${environment.apiUrl}/credenciamento/${id}/arquivos/analise`, formData);
    }

    aprovar(id: number) {
        const result = new Observable((observer) => {
            this.http.post(`${environment.apiUrl}/credenciamento/${id}/aprovar`, {}).subscribe(() => {
                this.subject.next();
                observer.next();
            });
        });

        return result;
    }

    recusar(id: number) {
        return this.http.post(`${environment.apiUrl}/credenciamento/${id}/recusar`, {});
    }

    editarCredenciamento(id: number, status: number) {
        this.obterResumo(id).subscribe(data => {
            const dadosCadastrais: any = {
                id: data.id,
                nome: data.cadastro.nome,
                documento: data.cadastro.documento,
                tipo: 'Estabelecimento',
                ehFornecedor: false,
                ehEstabelecimento: true,
                tipoPessoa: data.cadastro.tipoPessoa,
                telefone: data.cadastro.telefone,
                aberturaNascimento: data.cadastro.aberturaNascimento,
                dataAbertura: data.cadastro.aberturaNascimento,
                dataNascimento: data.cadastro.aberturaNascimento,
                cep: data.cadastro.cep,
                logradouro: data.cadastro.logradouro,
                numero: data.cadastro.numero,
                complemento: data.cadastro.complemento,
                bairro: data.cadastro.bairro,
                estado: data.cadastro.estado,
                uf: data.cadastro.estado,
                razaoSocial: data.cadastro.razaoSocial,
                inscricaoEstadual: data.cadastro.inscricaoEstadual,
                inscricaoMunicipal: data.cadastro.inscricaoMunicipal,
                participanteId: data.cadastro.participanteId
            };

            const informacoesFinanceiras = {
                faturamentoAnual: data.cadastro.informacoesFinanceiras.faturamentoAnual,
                ticketMedio: data.cadastro.informacoesFinanceiras.ticketMedio
            };

            const contato = {
                nomeContato: data.contato.nome,
                emailContato: data.contato.email,
                telefoneContato: data.contato.telefone,
                celularContato: data.contato.celular
            };

            const financeiroValues = {
                faturamentoAnual: informacoesFinanceiras.faturamentoAnual.id,
                ticketMedio: informacoesFinanceiras.ticketMedio.id
            };

            const socios = data.socios.map(s => ({
                id: s.id,
                aberturaNascimento: s.aberturaNascimento,
                tipoPessoa: s.tipoPessoa,
                nome: s.nome,
                documento: s.documento,
                telefone: s.telefone,
                email: s.email,
                participacao: s.participacao,
                celular: s.celular,
                contato: s.contato,
                razaoSocial: s.razaoSocial,
                inscricaoEstadual: s.inscricaoEstadual,
                inscricaoMunicipal: s.inscricaoMunicipal,
            }));

            const domiciliosBancarios = data.domiciliosBancarios.map(d => ({
                id: d.id,
                bandeira: d.bandeira,
                banco: {
                    id: d.bancoId,
                    text: d.bancoNome
                },
                agencia: d.agencia,
                conta: d.conta,
                digito: d.digito,
                arquivo: d.arquivo,
                existing: true,
                newFile: false,
            })).sort((a, b) => {
                if (a.bandeira.id < b.bandeira.id) return -1;
                if (a.bandeira.id > b.bandeira.id) return 1;
                return 0;
            });

            const dadosInstalacao: IDadosInstalacao = {
                cep: data.instalacao.cep,
                logradouro: data.instalacao.logradouro,
                numero: data.instalacao.numero,
                complemento: data.instalacao.complemento,
                bairro: data.instalacao.bairro,
                cidade: data.instalacao.cidade.id,
                pontoReferencia: data.instalacao.pontoReferencia,
                dias: data.instalacao.dias,
                horario: data.instalacao.horario.toString(),
                nome: data.instalacao.nome,
                email: data.instalacao.email,
                telefone: data.instalacao.telefone,
                celular: data.instalacao.celular
            };

            const captura: ICaptura = {
                capturas: data.captura.capturas.map(c => ({
                    id: c.captura.id,
                    quantidade: c.quantidade,
                    valor: c.valor,
                })),
                url: data.captura.url
            };

            const documentos: IDocumento = data.arquivos.map((a, i) => {
                const tipo = a.tipo === 'extratosBancarios' ? a.tipo + i : a.tipo;
                return {
                    id: tipo,
                    arquivo: a.arquivo
                };
            });

            const condicaoComercial: any = {
                taxaContratual: data.condicoesComerciais.taxaContratual,
                taxasAdministrativas: data.condicoesComerciais.taxasAdministrativas,
                taxasDebito: data.condicoesComerciais.taxasDebito
            };

            // Campos extras para popular a tela
            dadosCadastrais.ramoAtividade = data.cadastro.ramoAtividadeDetalhe.codigo;
            dadosCadastrais.cidade = data.cadastro.cidadeDetalhe.id;
            condicaoComercial.prazoTaxaBase = data.condicoesComerciais.prazoTaxaBase;

            this.reset();

            const wizard: any = Wizard.steps;
            const tipoPessoaUrl = TiposPessoa.urls[dadosCadastrais.tipoPessoa];
            wizard[1].url = `/credenciamento/pessoa-juridica/dados-societarios`;
            wizard[2].url = `/credenciamento/${tipoPessoaUrl}/dados-instalacao`;
            wizard[3].url = `/credenciamento/${tipoPessoaUrl}/domicilio-bancario`;
            wizard[4].url = `/credenciamento/${tipoPessoaUrl}/captura`;
            wizard[5].url = `/credenciamento/${tipoPessoaUrl}/documentos`;
            wizard[6].url = `/credenciamento/${tipoPessoaUrl}/condicoes-comerciais`;
            wizard.forEach(w => w.cursor = 'pointer');

            sessionStorage.setItem('dadosCadastrais', JSON.stringify(dadosCadastrais));
            sessionStorage.setItem('faturamento', JSON.stringify(informacoesFinanceiras));
            sessionStorage.setItem('contato', JSON.stringify(contato));
            sessionStorage.setItem('financeiro', JSON.stringify(financeiroValues));
            sessionStorage.setItem('dadosSocietarios', JSON.stringify(socios));
            sessionStorage.setItem('domicilioBancario', JSON.stringify(domiciliosBancarios));
            sessionStorage.setItem('dadosInstalacao', JSON.stringify(dadosInstalacao));
            sessionStorage.setItem('captura', JSON.stringify(captura));
            sessionStorage.setItem('documentosExistentes', JSON.stringify(documentos));
            sessionStorage.setItem('condicaoComercial', JSON.stringify(condicaoComercial));

            sessionStorage.setItem('emailOriginal', dadosInstalacao.email);
            sessionStorage.setItem('tipoPessoa', dadosCadastrais.tipoPessoa);

            if (status === CredenciamentoStatus.emAnalise) {
                sessionStorage.setItem('credenciamentoEmAnalise', 'true');
                this.router.navigate([`credenciamento/${tipoPessoaUrl}`, { analise: true }]);
            } else if (status === CredenciamentoStatus.aprovado) {
                sessionStorage.setItem('credenciamentoEdicao', 'true');
                this.router.navigate([`credenciamento/${tipoPessoaUrl}`, { edicao: true }]);
            }
        });
    }

    cancelarIndicacao(id: number, motivoId: number, obervacao: string) {
        const body = {
            motivoId,
            obervacao
        };

        return this.http.post<any>(
            `${environment.apiUrl}/estabelecimento/indicacoes/${id}/reprovar`,
            body
        );
    }

    _navegar(passo, pessoa = null, back = null) {
        if (typeof (pessoa) === 'number') {
            pessoa = TiposPessoa.urls[pessoa];
        } else if (!pessoa) {
            pessoa = TiposPessoa.urls[+sessionStorage.getItem('tipoPessoa')];
        }

        const params = {
            back: true
        };

        if (sessionStorage.getItem('credenciamentoEdicao')) {
            params['edicao'] = true;
        }
        if (sessionStorage.getItem('credenciamentoEmAnalise')) {
            params['analise'] = true;
        }
        this.router.navigate([`/credenciamento/${pessoa}/${passo}`, params]);
    }
    obterResumo(id: number) {

        return this.http.get<any>(`${environment.apiUrl}/credenciamento/${id}`);
    }

    reset() {
        this.credenciamento.reset();
        sessionStorage.removeItem('dadosCadastrais');
        sessionStorage.removeItem('contato');
        sessionStorage.removeItem('faturamento');
        sessionStorage.removeItem('financeiro');
        sessionStorage.removeItem('dadosSocietarios');
        sessionStorage.removeItem('domicilioBancario');
        sessionStorage.removeItem('dadosInstalacao');
        sessionStorage.removeItem('captura');
        sessionStorage.removeItem('documentosExistentes');
        sessionStorage.removeItem('condicaoComercial');
        sessionStorage.removeItem('credenciamentoEdicao');
        sessionStorage.removeItem('credenciamentoEmAnalise');
        sessionStorage.removeItem('emailOriginal');
        sessionStorage.removeItem('tipoPessoa');
        sessionStorage.removeItem('documentos');
        sessionStorage.removeItem('wizard');
        sessionStorage.removeItem('stepValidationErrors');
        sessionStorage.removeItem('currentUrl');
        Wizard.steps.forEach(function (step: any) {
            step.url = '';
            step.cursor = '';
        });
    }

    credenciamentosStatusSubscription(): Observable<any> {
        return this.subject.asObservable();
    }

    getFaturamentos() {
        return this.dominio.obterOpcoesFaturamentoCartao();
    }

    getTickets() {
        return this.dominio.obterOpcoesTicketMedio();
    }

    getBancos() {
        return this.dominio.obterBancos();
    }
}
