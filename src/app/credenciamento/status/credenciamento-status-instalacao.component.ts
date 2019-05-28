import { Component, Input } from '@angular/core';
import { Horarios, IDadosInstalacao } from 'src/app/interfaces/credenciamento';

@Component({
  selector: 'alpe-credenciamento-status-instalacao',
  templateUrl: './credenciamento-status-instalacao.component.html',
})
export class CredenciamentoStatusInstalacaoComponent {
  @Input() dados: IDadosInstalacao;

  horarios = Horarios;
}
