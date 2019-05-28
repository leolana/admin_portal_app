import { Component, OnInit, Input } from '@angular/core';
import { CredenciamentoStatusService } from './credenciamento-status.service';
import { Datatable } from 'src/app/core/datatable/datatable.interface';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';

@Component({
  selector: 'alpe-credenciamento-status-usuarios',
  templateUrl: './credenciamento-status-usuarios.component.html',
})
export class CredenciamentoStatusUsuariosComponent implements OnInit {
  constructor(private credenciamentoStatusService: CredenciamentoStatusService) {}

  @Input() idEstabelecimento: number;

  usuariosDatatable = new Datatable({
    table: [
      { property: 'nome', description: 'Nome' },
      { property: 'email', description: 'E-mail' },
      { property: 'celular', description: 'Celular' },
      { property: 'acessos', description: 'Perfis' },
      { property: 'status', description: 'Status' },
    ],
    data: [],
  });

  ngOnInit() {
    this.credenciamentoStatusService
      .obterUsuariosDoEstabelecimento(this.idEstabelecimento)
      .subscribe(users => {
        const telefonePipe = new TelefonePipe();
        const transformTelefone = (telefone: string) => telefonePipe.transform(telefone);

        users.forEach(user => {
          user.status = user.ativo ? 'Ativo' : 'Inativo';
          user.celular = transformTelefone(user.celular);
          user.acessos = user.perfis.join(', ');
        });

        this.usuariosDatatable.updateData(users);
      });
  }
}
