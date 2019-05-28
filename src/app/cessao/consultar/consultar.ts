import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { CessaoStatus } from '../../interfaces/cessao';
import { CessaoService } from '../cessao.service';
import { IdText } from '../../interfaces/index';
import { tap } from 'rxjs/operators';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
    templateUrl: './consultar.html',
    styleUrls: ['./consultar.css']
})
export class CessaoConsultarComponent implements OnInit {
    constructor(
        private service: CessaoService,
        private auth: AuthService,
        private router: Router,
    ) { }

    // PROPERTIES
    mobile: boolean;
    statuses: IdText[] = [
        { id: CessaoStatus.aguardandoAprovacao, text: 'Pendentes' },
        { id: CessaoStatus.aprovado, text: 'Aprovadas' },
        { id: CessaoStatus.recusado, text: 'Recusadas' },
        { id: CessaoStatus.expirada, text: 'Expiradas' }
    ];
    cessoes: any;
    statusSelecionado = this.statuses[0];

    // METHODS
    ngOnInit() {
        this.solveLayout();
        this.listar().subscribe();
    }

    temDataResposta(id): boolean {
        return id === CessaoStatus.aprovado || id === CessaoStatus.recusado;
    }

    listar() {
        return this.service.listar().pipe(
            tap(cessoes => this.cessoes = cessoes)
        );
    }

    solveLayout(): void {
        const checkScreenSize = () => {
            this.mobile = document.body.offsetWidth < 992;
        };

        window.onresize = checkScreenSize;
        checkScreenSize();
    }

    abrirDetalhe(cessao) {
        this.router.navigateByUrl('/cessao/detalhe/' + cessao.codigo);
    }

    temCessoes(id) {
        return this.cessoes && this.cessoes[id];
    }

    isEstablishment() {
        return this.auth.user.participanteEstabelecimento;
    }

}
