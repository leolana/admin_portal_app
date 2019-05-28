import { Component, OnInit, Input } from '@angular/core';
import { Datatable } from 'src/app/core/datatable/datatable.interface';
import { UsuariosService } from 'src/app/usuarios/usuarios.service';
import { Roles } from 'src/app/core/auth/auth.roles';
import { UsuarioStatus } from 'src/app/interfaces';
import { TelefonePipe } from 'src/app/pipes/telefone.pipe';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { NumberFunctions } from 'src/app/core/functions/number.functions';
import { NotificationService } from 'src/app/core/notification/notification.service';

@Component({
  selector: 'alpe-credenciamento-status-convites',
  templateUrl: './credenciamento-status-convites.component.html',
})
export class CredenciamentoStatusConvitesComponent implements OnInit {
  constructor(
    private prompt: PromptService,
    private toastr: NotificationService,
    private usuariosService: UsuariosService,
  ) {}

  @Input() idEstabelecimento: number;
  @Input() dados: any[];

  convitesDatatable = new Datatable({
    table: [
      { property: 'nome', description: 'Nome' },
      { property: 'email', description: 'E-mail' },
      { property: 'celular', description: 'Celular' },
      {
        property: 'perfil',
        description: 'Perfis',
        hideMobileLabel: true,
        hideSort: true,
        groupButtonToggle: {
          buttons: [
            { text: Roles.ecAdministrador.slice(16), value: Roles.ecAdministrador },
            { text: Roles.ecFinanceiro.slice(16), value: Roles.ecFinanceiro },
            { text: Roles.ecCompras.slice(16), value: Roles.ecCompras },
          ],
        },
      },
      {
        property: 'status',
        description: 'Ações',
        hideMobileLabel: true,
        buttons: [
          {
            btnClass: 'btn-primary',
            text: 'Vincular',
            visible: row => this.vincularVisivel(row),
            fnAction: row => this.criaVinculo(row),
          },
          {
            btnClass: 'btn-primary',
            text: 'Convidar',
            visible: row => this.convidarVisivel(row),
            fnAction: row => this.criaUsuario(row),
          },
        ],
      },
    ],
    data: [],
  });

  ngOnInit() {
    this.defineDadosTabela();
  }

  defineDadosTabela = async () => {
    const telefonePipe = new TelefonePipe();
    const transformTelefone = (telefone: string) => telefonePipe.transform(telefone);

    const usuariosJaVinculados = [];

    const emails = this.dados.map(dado => dado.email);
    this.usuariosService.checaExisteParticipante(emails).subscribe((convitesEMembros: any) => {
      const { memberships, convites } = convitesEMembros;
      this.dados.forEach(novoConvite => {
        const temConvite = convites.find(convite => convite.email === novoConvite.email);
        const conviteRole = temConvite ? this.getEcRole(temConvite.roles) : Roles.ecAdministrador;
        novoConvite.celular = transformTelefone(novoConvite.celular);
        novoConvite.perfil = conviteRole;
        novoConvite.status = UsuarioStatus.inativo;

        if (!memberships || memberships.length <= 0) {
          return;
        }

        memberships.forEach((participante: any) => {
          const usuarioExistente = participante.filter(
            (membro: any) => membro.email === novoConvite.email,
          );

          if (usuarioExistente && usuarioExistente.length) {
            const role = this.getEcRole(usuarioExistente[0].roles);
            novoConvite.perfil = role || Roles.ecAdministrador;
            novoConvite.userId = usuarioExistente[0].userId;
            novoConvite.status = UsuarioStatus.ativo;

            const membroExistente = usuarioExistente.find(
              (membro: any) => membro.memberId === this.idEstabelecimento,
            );
            if (membroExistente) {
              usuariosJaVinculados.push(membroExistente);
            }
          }
        });
      });

      this.dados = this.dados.filter(
        dado => !usuariosJaVinculados.find(user => user.email === dado.email),
      );

      this.convitesDatatable.updateData(this.dados);
    });
  }

  criaVinculo(dados: any) {
    const vinculo = {
      participanteId: this.idEstabelecimento,
      usuarioId: dados.userId,
      role: dados.perfil,
    };
    this.usuariosService.criaVinculo(vinculo).subscribe(() => {
      this.toastr.showSuccessMessage('Vínculo criado com sucesso');
    });
  }

  criaUsuario(dados: any) {
    const usuario = {
      nome: dados.nome,
      email: dados.email,
      celular: NumberFunctions.removeNonDigits(dados.celular),
      participanteId: this.idEstabelecimento,
      roles: [dados.perfil],
    };
    this.usuariosService.salvarUsuario(usuario).subscribe(() => {
      this.toastr.showSuccessMessage('Convite enviado');
    });
  }

  convidarVisivel(row: any): boolean {
    if (row.status === UsuarioStatus.inativo) {
      return true;
    }
    return false;
  }

  vincularVisivel(row: any): boolean {
    if (row.status === UsuarioStatus.ativo) {
      return true;
    }
    return false;
  }

  getEcRole(roles: Roles[]) {
    const ecRoles = [Roles.ecAdministrador, Roles.ecFinanceiro, Roles.ecCompras];
    return roles.find(role => ecRoles.includes(role));
  }
}
