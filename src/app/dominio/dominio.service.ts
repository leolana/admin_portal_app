import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ITermo, TermoTipo } from '../interfaces/termo';
import { DateTime } from 'luxon';

@Injectable({
  providedIn: 'root',
})
export class DominioService {
  constructor(private http: HttpClient) {}

  obterBancos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dominio/bancos`);
  }

  obterBandeiras(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dominio/bandeiras`);
  }

  obterEventos(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dominio/eventos`);
  }

  obterOpcoesFaturamentoCartao(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dominio/faturamento-cartao`);
  }

  obterOpcoesTicketMedio(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dominio/ticket-medio`);
  }

  obterCapturas(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/dominio/capturas`);
  }

  obterTermoPorTipo(tipo: TermoTipo): Observable<ITermo> {
    return this.http.get<ITermo>(`${environment.apiUrl}/dominio/termo/${tipo}`);
  }

  obterEndereco(cep: string): Observable<any> {
    cep = cep.replace('-', '');
    return this.http.get<any>(`${environment.apiUrl}/dominio/endereco/${cep}`);
  }

  obterFileName(file: any, type: string, documento: string, processo: string): any {
    const timespan = DateTime.local()
      .toUTC()
      .toString()
      .replace(/[\\:/.]/g, '-');

    const fileType = type.replace(/\d/g, '');

    return `${processo}/${documento}/${fileType}/${timespan}/${file.name}`;
  }
}
