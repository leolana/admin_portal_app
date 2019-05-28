import { OnInit, Component, Input } from '@angular/core';
import { CessaoStatus } from 'src/app/interfaces/cessao';

@Component({
  selector: 'cessao-status-step',
  templateUrl: './status-step.component.html',
  styleUrls: ['./status-step.component.css'],
})
export class CessaoStatusStepComponent implements OnInit {
  constructor() {}

  // PROPERTIES
  @Input() cessao: any;
  status = CessaoStatus;

  // METHODS
  ngOnInit(): void {}

  pendente(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.aguardandoAprovacao;
  }

  aprovado(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.aprovado;
  }

  recusado(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.recusado;
  }

  falha(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.falha;
  }

  expirada(): boolean {
    if (!this.cessao || !this.status) return false;
    return this.cessao.status === this.status.expirada;
  }
}
