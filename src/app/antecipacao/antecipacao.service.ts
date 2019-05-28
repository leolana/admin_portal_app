import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { IRecebivel } from '../interfaces/recebivel';
import { IdText } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AntecipacaoService {
  constructor(private http: HttpClient) {}

  pesquisarAntecipacoesRealizadas(parametros): Observable<any[]> {
    const url = `${environment.apiUrl}/antecipacao/realizadas`;
    return this.http.post<any[]>(url, parametros);
  }

  pesquisarRecebiveisParaAntecipacao(filtros): Observable<IRecebivel[]> {
    const url = `${environment.apiUrl}/antecipacao/recebiveis`;
    return this.http.post<IRecebivel[]>(url, filtros);
  }

  anteciparRecebiveis(recebiveis: string[]) {
    const url = `${environment.apiUrl}/antecipacao/solicitar`;
    return this.http.post(url, { recebiveis });
  }

  getComboMeses(): Observable<IdText[]> {
    const url = `${environment.apiUrl}/antecipacao/meses`;
    return this.http.get<IdText[]>(url);
  }

  getComboProdutos(): Observable<IdText[]> {
    const url = `${environment.apiUrl}/antecipacao/produtos`;
    return this.http.get<IdText[]>(url);
  }

  getComboProdutosAntecipacaoRealizada(): Observable<IdText[]> {
    const url = `${environment.apiUrl}/antecipacao/produtos-antecipacao-realizada`;
    return this.http.get<IdText[]>(url);
  }

  getLimitHour(): Observable<any> {
    const url = `${environment.apiUrl}/antecipacao/hora-limite`;
    return this.http.get<any>(url);
  }
}
