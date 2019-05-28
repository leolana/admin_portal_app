import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { NumberFunctions } from '../functions/number.functions';

export const documentoStatus = {
  documentoNaoCadastrado: 0,
  credenciamentoProposta: 1,
  credenciamentoPendente: 2,
  credenciamentoEmAnalise: 3,
  credenciamentoAprovado: 4,
  credenciamentoRecusado: 5,
  estabelecimentoAtivo: 6,
  estabelecimentoInativo: 7,
  fornecedorAtivo: 8,
  fornecedorInativo: 9,
  participanteAtivo: 10,
  participanteInativo: 11,
  indicadoPorEstabelecimento: 12,
  indicadoPorFornecedor: 13,
};

@Injectable({
  providedIn: 'root',
})
export class DocumentoService {
  constructor(private http: HttpClient) {}

  checkDocumentExistence(documento): Observable<any[]> {
    documento = NumberFunctions.removeNonDigits(documento);
    const url = `${environment.apiUrl}/checa-existencia-documento`;
    return this.http.get<any[]>(url, { params: { documento } });
  }
}
