import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IParticipante } from '../interfaces/participante';
import { catchError } from 'rxjs/operators';
import { tags } from '../core/tags';
import { NotificationService } from '../core/notification/notification.service';
import { saveFile } from '../core/services/download.service';

@Injectable({
  providedIn: 'root',
})
export class ParticipanteService {
  constructor(private http: HttpClient, private notification: NotificationService) {}

  getDadosCadastrais(): Observable<IParticipante> {
    const url = `${environment.apiUrl}/participante/detalhe/cadastro`;
    return this.http.get<IParticipante>(url);
  }

  getContato(): Observable<any> {
    const url = `${environment.apiUrl}/participante/detalhe/contato`;
    return this.http.get<any>(url);
  }

  getDomiciliosBancarios(): Observable<any> {
    const url = `${environment.apiUrl}/participante/detalhe/domiciliosbancarios`;
    return this.http.get<any>(url);
  }

  getCondicoesComerciais(): Observable<any> {
    const url = `${environment.apiUrl}/participante/detalhe/condicoescomerciais`;
    return this.http.get<any>(url);
  }

  downloadExtrato(reportId, file) {
    this.http
      .get(`${environment.apiUrl}/participante/extrato/${reportId}`, { responseType: 'blob' })
      .pipe(
        catchError(err => {
          this.notification.showErrorMessage(tags['download-extratosBancarios'], {
            progressBar: false,
            tapToDismiss: true,
            autoDismiss: false,
            disableTimeOut: true,
          });
          return err;
        }),
      )
      .subscribe((blob: Blob) => {
        saveFile(blob, file);
      });
  }
}
