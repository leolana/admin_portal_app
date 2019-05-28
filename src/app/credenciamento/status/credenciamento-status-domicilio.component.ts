import { Component, Input } from '@angular/core';
import { IDadosBancarios } from 'src/app/interfaces/participante';

@Component({
    selector: 'alpe-credenciamento-status-domicilio',
    templateUrl: './credenciamento-status-domicilio.component.html'
})
export class CredenciamentoStatusDomicilioComponent {
    @Input() dados: IDadosBancarios[];
}
