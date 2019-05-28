import { Component, Input } from '@angular/core';
import { TiposPessoa } from 'src/app/interfaces';

@Component({
  selector: 'alpe-credenciamento-status-socios',
  templateUrl: './credenciamento-status-socios.component.html',
})
export class CredenciamentoStatusSociosComponent {
  @Input() dados: any[];

  tiposPessoa = TiposPessoa;
}
