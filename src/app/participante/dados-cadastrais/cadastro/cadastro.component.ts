import { Component, OnInit, Input } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParticipanteService } from '../../participante.service';
import { TiposPessoa } from 'src/app/interfaces';


@Component({
    selector: 'app-dados-cadastrais',
    templateUrl: './cadastro.component.html',
    styleUrls: ['../../participante.styles.css'],
})
export class ParticipanteCadastroComponent implements OnInit {
    constructor(
        private participanteService: ParticipanteService
    ) { }

    dados: any;
    tiposPessoa = TiposPessoa;

    ngOnInit() {
        this.preenche();
    }

    preenche() {
        this.participanteService.getDadosCadastrais()
            .pipe(catchError(data => {
                this.dados = {};
                return of(data);
            }))
            .subscribe(participante => {
                this.dados = participante;
            });
    }
}
