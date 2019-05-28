import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { IExportacao, IFileResponse, IVisaoExportacao } from '../interfaces/exportacao';
import { getFileNameFromResponseContentDisposition, saveFile } from '../core/services/download.service';

@Injectable({
    providedIn: 'root'
})
export class ExportacaoService {
    constructor(
        private http: HttpClient
    ) { }

    verificarPermissao(): Observable<IVisaoExportacao> {
        return this.http.get<IVisaoExportacao>(`${environment.apiUrl}/exportacao/verificacao`);
    }

    listar(): Observable<IExportacao[]> {
        return this.http.get<IExportacao[]>(`${environment.apiUrl}/exportacao`);
    }

    download(id: number, dataOperacaoInicial: Date, dataOperacaoFinal: Date) {
        const params = new HttpParams()
        .set('dataOperacaoInicial', dataOperacaoInicial.toISOString())
        .set('dataOperacaoFinal', dataOperacaoFinal.toISOString());

        this.http.get(
            `${environment.apiUrl}/exportacao/${id}`,
            {
                params: params,
                responseType: 'blob',
                observe: 'response',
            },
        )
            .subscribe((response: HttpResponse<Blob>) => {
                const fileName = getFileNameFromResponseContentDisposition(response);
                saveFile(response.body, fileName);
            });
    }

}
