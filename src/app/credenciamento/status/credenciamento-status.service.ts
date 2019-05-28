import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class CredenciamentoStatusService {
  constructor(private http: HttpClient) {}

  obterUsuariosDoEstabelecimento(idEstabelecimento) {
    const url = `${environment.apiUrl}/usuarios/participante/${idEstabelecimento}`;
    return this.http.get<any[]>(url);
  }

  obterConvitesDoEstabelecimento(idEstabelecimento) {
    const url = `${environment.apiUrl}/convites/participante/${idEstabelecimento}`;
    return this.http.get<any[]>(url);
  }
}
