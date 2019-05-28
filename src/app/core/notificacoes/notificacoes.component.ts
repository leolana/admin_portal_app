import { Component, OnInit } from '@angular/core';
import { NotificacoesService } from './notificacoes.service';
import { DateTime } from 'luxon';
import { notificacaoCategoria } from 'src/app/interfaces/notificacao';
@Component({
    selector: 'app-notifications',
    templateUrl: './notificacoes.component.html'
})

export class NotificacoesComponent implements OnInit {

    notificacoes: any;
    qtdNotificacoes: any;
    paginaAtual = 1;
    limite = 20;
    hasMore = true;
    allNotifications: any[] = [];

    constructor(private notificacoesService: NotificacoesService) { }

    ngOnInit() {
        this.recebeNotificacoes();
    }

    recebeNotificacoes() {
        this.notificacoesService
            .getNotifications(this.paginaAtual, this.limite)
            .subscribe(notificacoes => {
                this.hasMore = notificacoes.length === this.limite;
                this.agruparArray(notificacoes);
            });
    }

    carregarMais() {
        this.notificacoesService
            .getNotifications(++this.paginaAtual, this.limite)
            .subscribe(notificacoes => {
                this.hasMore = notificacoes.length === this.limite;
                if (notificacoes.length == 0) return;
                this.agruparArray(notificacoes);
            });
    }

    agruparPorData(notificacoes) {
        const groupData = {};
        for (let i = 0; i < notificacoes.length; i++) {
            const item = notificacoes[i];
            if (!groupData[item.data]) groupData[item.data] = [];
            const obj = {
                mensagem: item.mensagem,
                horario: item.horario,
                icon: item.icon
            };
            groupData[item.data].push(obj);
        }
        this.notificacoes = Object.entries(groupData);
    }

    agruparArray(notificacoes) {
        notificacoes.forEach(notificacao => {
            notificacao.data = DateTime.fromISO(notificacao.createdAt).toISODate();
            notificacao.horario = DateTime.fromISO(notificacao.createdAt).toFormat('HH:mm');
            notificacao.icon = notificacaoCategoria.icons[notificacao.categoriaId];
            this.allNotifications.push(notificacao);
        });

        this.agruparPorData(this.allNotifications);
    }
}
