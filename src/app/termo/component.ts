import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DominioService } from '../dominio/dominio.service';
import { TermoTipo, ITermo } from '../interfaces/termo';
import { AuthService } from '../core/auth/auth.service';
import { TermoService } from './termo.service';

@Component({
    templateUrl: './component.html',
    styleUrls: ['./component.css']
})
export class TermoComponent implements OnInit {
    termo: ITermo;
    acceptedTerms: boolean;
    return = '';

    constructor(
        private route: ActivatedRoute,
        private dominio: DominioService,
        private auth: AuthService,
        private router: Router,
        private termoService: TermoService,
    ) { }

    ngOnInit(): void {
        if (this.auth.user.participanteFornecedor) {
            this.dominio.obterTermoPorTipo(TermoTipo.contratoMaeFornecedor).subscribe((termo) => this.termo = termo);
        } else {
            this.dominio.obterTermoPorTipo(TermoTipo.contratoMaeEstabelecimento).subscribe((termo) => this.termo = termo);
        }

        this.route.queryParams
            .subscribe(params => this.return = params['returnUrl'] || '/');
    }

    approve(): void {
        this.termoService
            .aceitarTermo(this.termo.id)
            .subscribe(() => this.router.navigateByUrl(this.return));
    }
}
