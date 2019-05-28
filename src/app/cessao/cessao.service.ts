import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { DateTime } from 'luxon';
import { NotificationService } from '../core/notification/notification.service';
import { ICessao, CessaoOperacoes, CessaoPagamentos } from '../interfaces/cessao';
import { PermissaoCessaoRecorrente } from './solicitar/recorrente/recorrente';
import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/auth.service';
import { Observable, Subject, of } from 'rxjs';
import { IdText } from '../interfaces/index';
import { ITermo } from '../interfaces/termo';

@Injectable({
    providedIn: 'root'
})
export class CessaoService {
    constructor(
        private http: HttpClient,
        private auth: AuthService,
        private notification: NotificationService,
    ) { }

    subject = new Subject<any>();

    weekend = {
        6: 'sabado',
        7: 'domingo'
    };

    blockedDays = [];

    private mudarStatus(id: number, termo, url: string): Observable<any> {
        const participanteId = this.auth.user.participante;

        const result = new Observable((observer) => {
            this.http.post<any[]>(url, { id: id, termoId: termo.id }).subscribe(() => {
                this.subject.next();
                observer.next();
            });
        });

        return result;
    }

    obter(id: number): Observable<any> {
        const participanteId = this.auth.user.participante;
        const participante = this.auth.user.participanteEstabelecimento ? 'estabelecimento' : 'fornecedor';
        return this.http.get<any[]>(`${environment.apiUrl}/${participante}/${participanteId}/cessao/${id}`);
    }

    listar(hideLoading: boolean = false): Observable<any[]> {
        const tipoParticipante = this.auth.user.participanteEstabelecimento
            ? 'estabelecimento'
            : 'fornecedor';

        const url = `${environment.apiUrl}/${tipoParticipante}/cessoes`;
        return this.http.get<any[]>(url, hideLoading ? { params: { hideLoading: 'true' } } : {});
    }

    aprovar(id: number, termo: ITermo): Observable<any> {
        const participanteId = this.auth.user.participante;
        const url = `${environment.apiUrl}/estabelecimento/${participanteId}/cessao/${id}/aprovar`;
        return this.mudarStatus(id, termo, url);
    }

    reprovar(id: number, termo: ITermo): Observable<any> {
        const participanteId = this.auth.user.participante;
        const url = `${environment.apiUrl}/estabelecimento/${participanteId}/cessao/${id}/reprovar`;
        return this.mudarStatus(id, termo, url);
    }

    alterar(cessao: ICessao): Observable<any> {
        const participanteId = this.auth.user.participante;
        const url = `${environment.apiUrl}/estabelecimento/${participanteId}/cessao/${cessao.id}/alterar`;
        return this.http.post<any[]>(url, {
            id: cessao.id,
            dataExpiracao: cessao.dataExpiracao,
            referencia: cessao.referencia
        });
    }

    cessaoStatusSubscription(): Observable<any> {
        return this.subject.asObservable();
    }

    solicitarCessao(json): Observable<any> {
        const cessao: ICessao = {
            vinculoId: json.vinculo.id,
            tipo: json.tipo,
            tipoCessao: json.tipo,
            tipoDiluicaoPagamento: json.pagamento,
            valor: json.valor,
            valorDisponivel: json.vinculo.valorDisponivel,
            dataVencimento: json.dataVencimento,
            dataExpiracao: json.dataExpiracao,
            dataFinalVigencia: json.dataFinalVigencia,
            valorMaximoRecorrente: json.valorMaximoRecorrente,
            referencia: json.referencia,
        };

        return this.http.post(`${environment.apiUrl}/fornecedores/solicitarCessao`, cessao);
    }

    getOperacoes(): Observable<IdText[]> {
        const arr = Object.keys(CessaoOperacoes.descricoes).map(id => ({
            id: id,
            text: CessaoOperacoes.descricoes[id]
        }));
        return of(arr);
    }

    getPagamentos(): Observable<IdText[]> {
        const arr = Object.keys(CessaoPagamentos.descricoes).map(id => ({
            id: id,
            text: CessaoPagamentos.descricoes[id]
        }));
        return of(arr);
    }

    checaPermissaoCessaoRecorrente(vinculoId: number): Observable<PermissaoCessaoRecorrente> {
        const url = `${environment.apiUrl}/fornecedor/${vinculoId}/recorrente`;
        return this.http.get<PermissaoCessaoRecorrente>(url);
    }

    buscarOpcoesDeParcelamento(json, vinculoId) {
        const url = `${environment.apiUrl}/fornecedor/${vinculoId}/opcoesParcelamento`;
        return this.http.get<any[]>(url, { params: json });
    }

    solicitarCessaoParcelada(json, vinculoId): Observable<any> {
        const url = `${environment.apiUrl}/fornecedor/${vinculoId}/cessaoParcelada`;
        return this.http.post(url, json);
    }

    sugestaoDiaExpiracao(diasAprovacao: number): Date {
        let expiracao = DateTime.local();
        let dias = diasAprovacao;
        while (dias > 0) {
            expiracao = expiracao.plus({ days: 1 });
            if (expiracao.weekday in this.weekend) {
                continue;
            }
            if (this.blockedDays.some(blocked => blocked === expiracao.toFormat('yyyy-MM-dd'))) {
                continue;
            }
            dias--;
        }
        return expiracao.toJSDate();
    }

    warningDataExpiracaoFinalSemana(newDate) {
        const expirationDate = DateTime.fromJSDate(newDate);
        if (expirationDate.weekday in this.weekend) {
            this.notification.showAlertMessage('A data de expiração cairá em um final de semana');
            return;
        }
    }
}
