import { Component, OnInit, Input } from '@angular/core';
import { of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ParticipanteService } from '../../participante.service';
import { TiposPessoa } from 'src/app/interfaces';


@Component({
    selector: 'app-dados-domicilio',
    templateUrl: './domicilios.component.html',
    styleUrls: ['../../participante.styles.css'],
})
export class ParticipanteDomiciliosComponent implements OnInit {
    constructor(
        private participanteService: ParticipanteService
    ) { }

    domicilios: any;
    arquivos: any;
    tiposPessoa = TiposPessoa;

    ngOnInit() {
        this.preenche();
    }

    preenche() {
        this.participanteService.getDomiciliosBancarios()
            .pipe(catchError(data => {
                this.domicilios = [];
                return of(data);
            }))
            .subscribe(dados => {
                this.domicilios = dados.domiciliosBancarios || [];

                const mapaExtratos = {};

                const getKey = (d) => `${d.banco}${d.agencia}${d.conta}${d.conta}`;

                this.domicilios.forEach(d => {
                    mapaExtratos[getKey(d)] = {
                        nome: this.formatarNomeArquivo(d.arquivo),
                        id: d.id
                    };
                });

                this.arquivos = Object.values(mapaExtratos);
            });
    }

    formatarNomeArquivo(arquivo) {
        if (!arquivo) {
            return arquivo;
        }

        return arquivo.substring(arquivo.lastIndexOf('/') + 1, arquivo.length);
    }

    downloadExtrato(file, reportId) {
        this.participanteService.downloadExtrato(reportId, file);
    }

}
