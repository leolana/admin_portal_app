import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { DominioService } from '../dominio/dominio.service';
import { getFileNameFromResponseContentDisposition, saveFile, } from '../core/services/download.service';
import { saveAs } from 'file-saver';

@Injectable({
    providedIn: 'root'
})
export class RelatoriosService {
    constructor(
        private http: HttpClient,
        private dominio: DominioService,
    ) { }

    getFinanceiroBandeiras(): Observable<any[]> {
        const url = `${environment.apiUrl}/financeiro/bandeiras`;
        return this.http.get<any[]>(url);
    }

    getFinanceiroTiposOperacao(): Observable<any[]> {
        const url = `${environment.apiUrl}/financeiro/tipos-operacao`;
        return this.http.get<any[]>(url);
    }

    getExtratoResumido(): Observable<any> {
        const url = `${environment.apiUrl}/financeiro/resumo`;
        return this.http.get<any>(url);
    }

    getExtratoDetalhado(filters: any = null): Observable<any> {
        const url = `${environment.apiUrl}/financeiro/analitico`;
        return this.http.post<any>(url, filters);
    }

    getRelatorioConsolidadoFornecedor(filters): Observable<any> {
        const url = `${environment.apiUrl}/financeiro/relatorio-consolidado-fornecedor`;
        return this.http.get<any>(url, { params: filters });
    }

    exportReport(data: any[]) {
        this.http.post(`${environment.apiUrl}/relatorio/export`, data, {
            responseType: 'blob',
            observe: 'response',
        }).subscribe((response) => {
            const fileName = getFileNameFromResponseContentDisposition(response);
            saveFile(response.body, fileName);
        });
    }
}
