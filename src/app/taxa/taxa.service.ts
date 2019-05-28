import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FiltroTaxa, Taxa, ItemListagemTaxas, Prazo, TaxaRange } from './../interfaces/taxa';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TaxaService {
    constructor(
        private http: HttpClient
    ) { }

    list(filtro: FiltroTaxa): Observable<ItemListagemTaxas[]> {
        const url = environment.apiUrl + '/taxas' + query_string(filtro);
        return this.http.get<ItemListagemTaxas[]>(url);
    }

    getTaxaRanges(): Observable<TaxaRange[]> {
        const url = environment.apiUrl + '/taxa/ranges';
        return this.http.get<TaxaRange[]>(url);
    }

    getTaxaPrazos(): Observable<Prazo[]> {
        const url = environment.apiUrl + '/taxa/prazos';
        return this.http.get<Prazo[]>(url);
    }

    getById(id: number): Observable<Taxa> {
        const url = environment.apiUrl + '/taxa?id=' + id;
        return this.http.get<Taxa>(url);
    }

    getByFilter(filtro: FiltroTaxa): Observable<any> {
        const url = environment.apiUrl + '/taxa' + query_string({ ...filtro, ignoreerror: true });
        return this.http.get<any>(url);
    }

    post(json: Taxa): Observable<any> {
        const url = `${environment.apiUrl}/taxa/${json.id ? 'edit' : 'add'}`;
        return this.http.post(url, json);
    }

}

function query_string(filtro): string {
    return Object.keys(filtro).filter(key => filtro[key]).map((key, i) => {
        return (i ? '&' : '?') + key + '=' + encodeURIComponent(filtro[key]);
    }).join('');
}
