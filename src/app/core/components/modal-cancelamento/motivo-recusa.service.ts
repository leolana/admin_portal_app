import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { recusaTipoEnum } from './recusa-tipo.enum';
import { MotivoRecusaViewModel } from './modal-cancelamento.component';

@Injectable({
    providedIn: 'root'
})
export class MotivoRecusaService {
    constructor(
        private http: HttpClient,
    ) { }

    list(recusaTipoId: recusaTipoEnum): Observable<MotivoRecusaViewModel[]> {
        return this.http.get<MotivoRecusaViewModel[]>(this.getUrl(recusaTipoId));
    }

    getUrl(recusaTipoId: recusaTipoEnum) {
        let route = null;
        switch (recusaTipoId) {
            case recusaTipoEnum.cad_estabelecimento:
                route = 'motivo-recusa/indicacao/ec';
                break;
            case recusaTipoEnum.cad_fornecedor:
                route = 'motivo-recusa/indicacao/fornecedor';
                break;
            case recusaTipoEnum.recusa_vinculo:
                route = 'motivo-recusa/vinculo';
                break;
        }

        return `${environment.apiUrl}/${route}`;
    }
}
