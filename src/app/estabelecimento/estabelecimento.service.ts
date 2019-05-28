import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { IVinculo, IParticipantes } from '../interfaces/participante';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/auth.service';
import { TiposDocumentos } from '../interfaces';
import { NumberFunctions } from '../core/functions/number.functions';

@Injectable({
  providedIn: 'root',
})
export class EstabelecimentoService {
  constructor(private http: HttpClient, private auth: AuthService) {}

  subject = new Subject<any>();

  private alterarStatusVinculo(vinculo: IVinculo, url: string) {
    const params: any = {
      id: vinculo.id,
    };

    const data = vinculo as any;

    if (data.motivoTipoRecusaId) {
      params.motivoTipoRecusaId = data.motivoTipoRecusaId;
    }

    if (data.motivoRecusaObservacao) {
      params.motivoRecusaObservacao = data.motivoRecusaObservacao;
    }

    const result = new Observable(observer => {
      this.http.post(url, data).subscribe(() => {
        this.subject.next();
        observer.next();
      });
    });

    return result;
  }

  checaDocumentoIndicacaoFornecedor(documento: string): Observable<any> {
    documento = NumberFunctions.removeNonDigits(documento);
    let url = '/estabelecimento/checa-documento-indicacao-fornecedor/';
    url = environment.apiUrl + url + documento;
    return this.http.get(url);
  }

  indicarFornecedorParaCadastro(objFornecedor) {
    const url = `${environment.apiUrl}/fornecedores/indicacoes`;
    return this.http.post(url, objFornecedor);
  }

  vincular(fornecedorId: number): Observable<any> {
    const estabelecimentoId = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${estabelecimentoId}/fornecedor`;
    return this.http.post(url, {
      estabelecimentoComercialId: estabelecimentoId,
      fornecedorId: fornecedorId,
    });
  }

  obterIndicacaoes() {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/indicacoes`;
    return this.http.get<any[]>(url);
  }

  obterVinculos(status, hideLoading: boolean = false): Observable<IVinculo[]> {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/fornecedores`;
    return this.http.get<IVinculo[]>(
      url,
      hideLoading
        ? { params: { hideLoading: 'true', status: status } }
        : { params: { status: status } },
    );
  }

  aprovarVinculo(vinculo: IVinculo) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/fornecedor/${
      vinculo.participante.id
    }/aprovar`;
    return this.alterarStatusVinculo(vinculo, url);
  }

  recusarVinculo(vinculo: IVinculo) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/fornecedor/${
      vinculo.participante.id
    }/recusar`;
    return this.alterarStatusVinculo(vinculo, url);
  }

  cancelarVinculo(vinculo: IVinculo) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/fornecedor/${
      vinculo.participante.id
    }/cancelar`;
    return this.http.post(url, vinculo);
  }

  reativarVinculo(vinculo: IVinculo) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/fornecedor/${
      vinculo.participante.id
    }/reativar`;
    return this.alterarStatusVinculo(vinculo, url);
  }

  alterarVinculo(vinculo: IVinculo) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/fornecedor/${
      vinculo.participante.id
    }/vinculo/alterar`;

    return this.http.post(url, {
      vinculoId: vinculo.id,
      exibeValorDisponivel: vinculo.exibeValorDisponivel,
      valorMaximoExibicao: vinculo.valorMaximoExibicao,
      diasAprovacao: vinculo.diasAprovacao,
    });
  }

  alterarIndicacao(indicacao) {
    const id = this.auth.user.participante;
    const url = `${environment.apiUrl}/estabelecimento/${id}/indicacao/${indicacao.id}/alterar`;

    return this.http.post(url, {
      participanteIndicacaoId: indicacao.id,
      documento: indicacao.documento,
      nome: indicacao.nome,
      telefone: indicacao.telefone,
      email: indicacao.email,
    });
  }

  vinculoStatusSubscription(): Observable<any> {
    return this.subject.asObservable();
  }
}
