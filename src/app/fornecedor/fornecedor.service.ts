import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IParticipantes } from '../interfaces/participante';
import { AuthService } from '../core/auth/auth.service';
import { map } from 'rxjs/operators';
import { TiposDocumentos } from '../interfaces';
import { IVinculo } from '../interfaces/participante';
import { catchError } from 'rxjs/operators';
import { tags } from '../core/tags';
import { NotificationService } from '../core/notification/notification.service';
import { WizardFornecedor } from '../interfaces/fornecedor';
import { IParametrosPesquisa } from 'src/app/interfaces/participante/indicacao';
import { saveFile } from '../core/services/download.service';

@Injectable({
  providedIn: 'root',
})
export class FornecedorService {
  constructor(
    private http: HttpClient,
    private auth: AuthService,
    private notification: NotificationService,
  ) {}

  subject = new Subject<any>();

  listarCadastrados(parametros: any): Observable<any> {
    const url = `${environment.apiUrl}/fornecedores/cadastrados`;
    return this.http.get(url, { params: { ...parametros } });
  }

  listarPendentes(parametros: IParametrosPesquisa): Observable<any[]> {
    const url = `${environment.apiUrl}/fornecedores/pendentes`;
    return this.http.get<any[]>(url, { params: { ...(parametros as any) } });
  }

  listarCancelados(parametros: IParametrosPesquisa): Observable<any> {
    const url = `${environment.apiUrl}/fornecedores/cancelados`;
    return this.http.get(url, { params: { ...(parametros as any) } });
  }

  meusEstabelecimentos(params: any) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/fornecedor/${id}/estabelecimentos`;
    return this.http.get<IVinculo[]>(url, { params });
  }

  listarEstabelecimentosPendentes(params: any) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/fornecedor/estabelecimentos/pendentes`;
    return this.http.get<any[]>(url, { params });
  }

  vinculosFornecedor(id: number): Observable<IVinculo[]> {
    const url = `${environment.apiUrl}/fornecedor/${id}/vinculos`;
    return this.http.get<IVinculo[]>(url);
  }

  obterUsuariosDoFornecedor(idFornecedor) {
    const url = `${environment.apiUrl}/usuarios/participante/${idFornecedor}`;
    return this.http.get<any[]>(url);
  }

  obterConvitesDoFornecedor(idFornecedor) {
    const url = `${environment.apiUrl}/convites/participante/${idFornecedor}`;
    return this.http.get<any[]>(url);
  }

  vincular(estabelecimentoId: number): Observable<any> {
    const fornecedorId = this.auth.user.participante;

    return this.http.post(`${environment.apiUrl}/fornecedor/${fornecedorId}/estabelecimento`, {
      estabelecimentoComercialId: estabelecimentoId,
      fornecedorId: fornecedorId,
    });
  }

  checaDocumentoIndicacaoEstabelecimento(documento: string): Observable<any> {
    documento = String(documento).replace(/\D/g, '');
    let url = '/fornecedor/checa-documento-indicacao-estabelecimento/';
    url = environment.apiUrl + url + documento;
    return this.http.get(url);
  }

  obter(id?: number): Observable<any> {
    return this.http.get(`${environment.apiUrl}/fornecedores/getById/${id}`);
  }

  salvar(fornecedor) {
    const files = this.converteArquivos(fornecedor);

    const formData = new FormData();
    files.forEach(file => {
      fornecedor.unchangedFiles = fornecedor.unchangedFiles || [];

      if (typeof file.arquivo === 'string') {
        fornecedor.unchangedFiles.push(file.arquivo);
      } else {
        formData.append(file.id, file.arquivo);
      }
    });

    formData.append('data', JSON.stringify(fornecedor));

    const result = new Observable(observer => {
      this.http.post(`${environment.apiUrl}/fornecedores`, formData).subscribe(() => {
        this.subject.next();
        observer.next();
      });
    });

    return result;
  }

  converteArquivos(fornecedor) {
    let arqs;
    if (fornecedor.arquivos) {
      fornecedor.arquivos.forEach(doc => {
        if (doc.arquivo) {
          doc.arquivo = this.base64ToFile(doc.arquivo, doc.nomeArquivo, doc.tipoArquivo);
        }
      });
      arqs = fornecedor.arquivos.filter(arq => arq.arquivo);
    }

    const docsExistentes = fornecedor.arquivosExistentes;
    if (docsExistentes) {
      if (fornecedor.arquivos) {
        docsExistentes.forEach(doc => {
          arqs.push(doc);
        });
      } else {
        arqs = docsExistentes;
      }
    }
    return arqs;
  }

  base64ToFile(base64, nome, type) {
    let byteString;
    if (base64.split(',')[0].indexOf('base64') >= 0) byteString = atob(base64.split(',')[1]);
    else byteString = unescape(base64.split(',')[1]);

    const mimeString = base64
      .split(',')[0]
      .split(':')[1]
      .split(';')[0];

    const byteArray = new Uint8Array(byteString.length);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([byteArray], { type: mimeString });
    return new File([blob], nome, { type: type });
  }

  alterarVinculo(vinculo: IVinculo) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/fornecedor/${id}/estabelecimento/${
      vinculo.participante.id
    }/vinculo/alterar`;
    return this.http.post(url, {
      vinculoId: vinculo.id,
      diasAprovacao: vinculo.diasAprovacao,
    });
  }

  obterVinculo(vinculoId: number): Observable<any> {
    const url = `${environment.apiUrl}/vinculo/${vinculoId}`;
    return this.http.get<any>(url);
  }

  fornecedoresCadastroSubscription(): Observable<any> {
    return this.subject.asObservable();
  }

  getFornecedorTarifa(): Observable<any> {
    const url = `${environment.apiUrl}/fornecedores/tarifas`;
    return this.http.get<any>(url);
  }

  recusarIndicacao(parametros) {
    return this.http.post(`${environment.apiUrl}/fornecedores/recusarIndicacao`, parametros);
  }

  downloadExtrato(fornecedorId, reportId, file) {
    return this.http
      .get(`${environment.apiUrl}/participante/${fornecedorId}/extrato/${reportId}`, {
        responseType: 'blob',
      })
      .pipe(
        catchError(err => {
          this.notification.showErrorMessage(tags['download-extratosBancarios'], {
            progressBar: false,
            tapToDismiss: true,
            autoDismiss: false,
            disableTimeOut: true,
          });
          return err;
        }),
      )
      .subscribe((blob: Blob) => {
        saveFile(blob, file);
      });
  }

  indicarEstabelecimentoParaCadastro(objEstabelecimento) {
    const url = `${environment.apiUrl}/fornecedor/indicar-estabelecimento`;
    return this.http.post(url, objEstabelecimento);
  }

  getIndicacaoEstabelecimento(params: any): Observable<any> {
    const url = `${environment.apiUrl}/fornecedor/indicacao-estabelecimento`;
    return this.http.get(url, { params });
  }

  updateIndicacaoEstabelecimento(objEstabelecimento: any): Observable<any> {
    const url = `${environment.apiUrl}/fornecedor/indicacao-estabelecimento`;
    return this.http.post(url, objEstabelecimento);
  }

  saveFornecedorSessionStorage(fornecedor) {
    sessionStorage.setItem('fornecedor', JSON.stringify(fornecedor));
  }

  getFornecedorSessionStorage() {
    return JSON.parse(sessionStorage.getItem('fornecedor'));
  }

  resetFornecedor() {
    sessionStorage.removeItem('fornecedor');
    sessionStorage.removeItem('wizardFornecedor');
    WizardFornecedor.steps.forEach(function(step: any) {
      step.url = '';
      step.cursor = '';
    });
  }
}
