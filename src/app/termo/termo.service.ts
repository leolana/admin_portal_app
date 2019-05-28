import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IRecebivel } from '../interfaces/recebivel';

@Injectable({
    providedIn: 'root'
})
export class TermoService {
    constructor(
        private http: HttpClient,
    ) { }

    aceitarTermo(termoId: number): Observable<any> {
        const url = `${environment.apiUrl}/dominio/termo/${termoId}/aceitar`;
        return this.http.post<IRecebivel[]>(url, { termoId: termoId });
    }
}
