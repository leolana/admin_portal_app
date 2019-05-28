import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/auth.service';
import { DialogService } from '../core/dialog/dialog.service';
import { UsuarioExistenteComponent } from './/gerenciamento/dialog-existente.component';
import { UsuarioViewModel, ConviteViewModel } from './gerenciamento/gerenciamento.component';
import { Observable } from 'rxjs';
import { NotificationService } from '../core/notification/notification.service';

export enum VerificacaoUsuarioEnum {
  novo = 1,
  existente = 2,
  vincular = 3,
  vinculoAbortado = 4,
}

@Injectable({
  providedIn: 'root',
})
export class UsuariosService {
  constructor(
    private http: HttpClient,
    private dialogService: DialogService,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  checaExisteParticipante(emails: string[]) {
    const url = `${environment.apiUrl}/check-memberships`;
    const data = { emails };
    return this.http.post(url, data);
  }

  criaVinculo(dados: any) {
    const url = `${environment.apiUrl}/create-membership`;
    return this.http.post(url, dados);
  }

  checaParticipantesDoUsuario = async (
    email: string,
    isEditing: boolean,
    participanteId: number,
  ): Promise<VerificacaoUsuarioEnum> => {
    if (!email) {
      this.notificationService.showErrorMessage('Email não informado');
      return VerificacaoUsuarioEnum.vinculoAbortado;
    }

    if (!participanteId) {
      participanteId = this.authService.user.participante;
    }

    const url = environment.apiUrl + '/memberships';
    const data = { email: email };

    const participantes = await this.http.post<any[]>(url, data).toPromise();
    if (!participantes.length) {
      return VerificacaoUsuarioEnum.novo;
    }

    console.log('------- participante id ------------');
    console.log(participanteId);
    console.log('------- participantes ------------');
    console.log(JSON.stringify(participantes));
    console.log('------- isEditing ------------');
    console.log(JSON.stringify(isEditing));
    console.log('------- email ------------');
    console.log(JSON.stringify(email));

    const participante = participantes.find((participant: any) => {
      return +participant.id === +participanteId;
    });

    if (participante) {
      if (!isEditing) {
        const message = `Este e-mail já está relacionado com o participante "${participante.nome}".`;
        this.notificationService.showErrorMessage(message);
      }
      return VerificacaoUsuarioEnum.existente;
    }

    const yes = await this.dialogService.open(UsuarioExistenteComponent, participantes);

    return yes ? VerificacaoUsuarioEnum.vincular : VerificacaoUsuarioEnum.vinculoAbortado;
  }

  obterUsuarios(filter, pageSize?, pageIndex?, sortColumn?, sortOrder?) {
    const url = `${environment.apiUrl}/usuarios`;
    return this.http.post<any>(url, filter, {
      params: {
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
      },
    });
  }

  obterConvites(filter, pageSize?, pageIndex?, sortColumn?, sortOrder?) {
    const url = `${environment.apiUrl}/convites`;
    return this.http.post<any>(url, filter, {
      params: {
        pageSize,
        pageIndex,
        sortColumn,
        sortOrder,
      },
    });
  }

  obterResumoUsuario(id) {
    const url = `${environment.apiUrl}/usuario/detalhe/${id}`;
    return this.http.get<any[]>(url);
  }

  salvarUsuario(usuario) {
    return usuario.id
      ? this.http.put(`${environment.apiUrl}/usuarios`, usuario)
      : this.http.post(`${environment.apiUrl}/usuarios/convites`, usuario);
  }

  inativarUsuario(usuarioId) {
    return this.http.put(`${environment.apiUrl}/usuario/status`, {
      id: usuarioId,
      ativo: false,
    });
  }

  reativarUsuario(usuarioId) {
    return this.http.put(`${environment.apiUrl}/usuario/status`, {
      id: usuarioId,
      ativo: true,
    });
  }

  recriarUsuarioKeycloak(usuario) {
    return this.http.put(`${environment.apiUrl}/recriar-keycloak`, usuario);
  }

  registrarUsuario(usuario) {
    return this.http.post(`${environment.apiUrl}/register`, usuario);
  }

  reenviarConvite(usuario) {
    return this.http.put(`${environment.apiUrl}/usuarios/reenviar-convite`, usuario);
  }

  validaStatusUsuario(idUsuario: string): Observable<any> {
    const params = {
      idUsuario: idUsuario,
    };
    return this.http.get<any>(`${environment.apiUrl}/usuario/status`, { params });
  }

  checaUsernameExistente(idUsuario: string, username: string): Observable<any> {
    const params = {
      id: idUsuario,
      username: username,
    };
    return this.http.get<any>(`${environment.apiUrl}/checkUsername`, { params });
  }

  obterInfoKeycloak(idUsuario: string) {
    return this.http.get<any>(`${environment.apiUrl}/info/keycloak/${idUsuario}`);
  }
}
