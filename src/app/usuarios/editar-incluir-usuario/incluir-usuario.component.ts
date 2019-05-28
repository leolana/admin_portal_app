import { FormGroup, FormControl, Validators, EmailValidator } from '@angular/forms';
import { Component, ElementRef, OnInit, Input } from '@angular/core';

import { DialogComponent } from '../../core/dialog/dialog.component';
import { NotificationService } from '../../core/notification/notification.service';
import { AuthService } from '../../core/auth/auth.service';
import { UsuariosService } from '../usuarios.service';
import { Roles } from '../../core/auth/auth.roles';
import { UsuarioStatus } from '../../interfaces';
import { funcionalidadesPorPerfil } from '../../core/auth/funcionalidades.roles';
import { PromptService } from 'src/app/core/prompt/prompt.service';
import { CpfFunctions } from 'src/app/core/functions/cpf.functions';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './incluir-usuario.component.html',
  styleUrls: ['./incluir-usuario.component.css'],
})
export class UsuarioEditarComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private usuariosService: UsuariosService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private promptService: PromptService,
  ) {}

  showInformation = false;

  showECRoles = false;
  showFornRoles = false;
  showBORoles = false;
  usernameValid = true;

  funcionalidades = funcionalidadesPorPerfil;

  perfis: Array<any> = [];

  auth = this.authService;
  roles = Roles;
  id = null;
  inativo = false;
  user;

  // FORM CONTROLS
  nome = new FormControl('', Validators.required);
  username = new FormControl('');
  documento = new FormControl('');
  email = new FormControl('', Validators.required);
  celular = new FormControl('', Validators.required);
  roleBackoffice = new FormControl(null);
  roleEstabelecimento = new FormControl(null);
  roleFornecedor = new FormControl(null);

  // FORM GROUP
  formUsuario = new FormGroup({
    nome: this.nome,
    username: this.username,
    documento: this.documento,
    email: this.email,
    celular: this.celular,
    roleBackoffice: this.roleBackoffice,
    roleEstabelecimento: this.roleEstabelecimento,
    roleFornecedor: this.roleFornecedor,
  });
  checkCampos = {
    documento: () => {
      if (this.documento.value || this.user.documento) {
        this.documento.setValidators([Validators.required, CpfFunctions.validator]);
      } else {
        this.documento.clearValidators();
      }
    },
    username: () => {
      if (this.username.value || this.user.username) {
        this.username.setValidators([Validators.required]);
      } else {
        this.username.clearValidators();
      }
    },
  };

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.usuariosService.obterResumoUsuario(idParam).subscribe(user => {
        this.user = user;
        this.user.roles.join(', ');
        this.checkTypeEditUser(user);
      });
    } else {
      this.checkTypeLoggedUser();
    }
  }

  checkTypeEditUser(usuario: any): void {
    this.id = usuario.id;
    this.nome.setValue(usuario.nome);
    this.email.setValue(usuario.email);
    this.celular.setValue(usuario.celular);
    this.documento.setValue(usuario.documento);
    this.username.setValue(usuario.username);

    if (usuario.username) {
      this.username.setValidators([Validators.required]);
    }
    if (usuario.documento) {
      this.documento.setValidators([Validators.required, CpfFunctions.validator]);
    }

    const roleBackoffice = usuario.roles.find(
      r => r == Roles.boAdministrador || r == Roles.boOperacoes,
    );

    const roleEstabelecimento = usuario.roles.find(
      r => r == Roles.ecAdministrador || r == Roles.ecFinanceiro || r == Roles.ecCompras,
    );

    const roleFornecedor = usuario.roles.find(
      r => r == Roles.fcAdministrador || r == Roles.fcFinanceiro || r == Roles.fcComercial,
    );

    this.roleBackoffice.setValue(roleBackoffice);
    this.roleEstabelecimento.setValue(roleEstabelecimento);
    this.roleFornecedor.setValue(roleFornecedor);

    const isBKO = this.loggedUserIsBKO();
    const isEc = this.loggedUserIsEc();
    const isFc = this.loggedUserIsFc();

    if (isBKO) {
      if (this.roleBackoffice.value) {
        this.addRolesGroup('bko');
        this.roleBackoffice.setValidators(Validators.required);
        this.showBORoles = true;
      }
      if (this.roleEstabelecimento.value) {
        this.addRolesGroup('ec');
        this.roleEstabelecimento.setValidators(Validators.required);
        this.showECRoles = true;
      }
      if (this.roleFornecedor.value) {
        this.addRolesGroup('fc');
        this.roleFornecedor.setValidators(Validators.required);
        this.showFornRoles = true;
      }
    } else {
      if (isEc) {
        this.addRolesGroup('ec');
        this.roleEstabelecimento.setValidators(Validators.required);
        this.showECRoles = true;
      }

      if (isFc) {
        this.addRolesGroup('fc');
        this.roleFornecedor.setValidators(Validators.required);
        this.showFornRoles = true;
      }
    }

    this.inativo = usuario.ativo === false;
  }

  addRolesGroup(grupo: string) {
    this.perfis = this.perfis.concat(this.funcionalidades.filter(role => role.group === grupo));
  }

  checkTypeLoggedUser(): void {
    if (this.loggedUserIsBKO()) {
      this.perfis = this.funcionalidades.filter(role => role.group === 'bko');
      this.roleBackoffice.setValidators(Validators.required);
      this.showBORoles = true;
    }

    if (this.loggedUserIsEc()) {
      this.perfis = this.funcionalidades.filter(role => role.group === 'ec');
      this.roleEstabelecimento.setValidators(Validators.required);
      this.showECRoles = true;
    }

    if (this.loggedUserIsFc()) {
      this.perfis = this.funcionalidades.filter(role => role.group === 'fc');
      this.roleFornecedor.setValidators(Validators.required);
      this.showFornRoles = true;
    }
  }

  loggedUserIsBKO(): boolean {
    return (
      this.authService.hasRole(this.roles.boAdministrador) &&
      !this.authService.user.participanteEstabelecimento &&
      !this.authService.user.participanteFornecedor
    );
  }

  loggedUserIsEc(): boolean {
    return (
      this.authService.hasRole(this.roles.boAdministrador, this.roles.ecAdministrador) &&
      this.authService.user.participanteEstabelecimento
    );
  }

  loggedUserIsFc(): boolean {
    return (
      this.authService.hasRole(this.roles.boAdministrador, this.roles.fcAdministrador) &&
      this.authService.user.participanteFornecedor
    );
  }

  async validate() {
    Object.keys(this.formUsuario.controls).forEach(control => {
      this.formUsuario.controls[control].markAsDirty();
    });

    if (this.formUsuario.invalid) {
      const erros = this.obterErrosFormulario(this.formUsuario);

      if (this.id && erros.cpf) {
        this.notificationService.showAlertMessage('Verifique o campo CPF antes de prosseguir!');
        return;
      }

      if (erros.email) {
        this.notificationService.showAlertMessage('Verifique o campo E-mail antes de prosseguir!');
        return;
      }

      this.notificationService.showAlertMessage(
        'Verifique os campos obrigatórios antes de prosseguir!',
      );
      return;
    }

    if (this.id && !this.usernameValid) {
      this.notificationService.showAlertMessage('Verifique o campo username');
      return;
    }

    if (this.id) {
      const result = await this.usuariosService.validaStatusUsuario(this.id).toPromise();

      if (result.status) {
        this.salvar();
      } else {
        const messageAwareOfActivation =
          'Ao editar um usuário Inativo, ele será Ativado. Deseja continuar?';
        const yes = await this.promptService.confirm(messageAwareOfActivation);
        if (yes) this.salvar();
      }
    } else {
      this.salvar();
    }
  }

  salvar(): void {
    const roles = [
      this.roleBackoffice.value,
      this.roleEstabelecimento.value,
      this.roleFornecedor.value,
    ].filter(role => role);

    if (!roles.length) {
      this.notificationService.showErrorMessage('Selecione ao menos um perfil.');
      return;
    }

    const usuario: any = {
      id: this.id,
      nome: this.nome.value,
      email: this.email.value,
      celular: this.celular.value,
      roles: roles,
    };

    if (this.id) {
      usuario.username = this.username.value;
      usuario.documento = this.documento.value;
    }

    this.usuariosService.salvarUsuario(usuario).subscribe(() => {
      const messageSuccess = this.id
        ? 'Usuário alterado com sucesso!'
        : 'Um email será enviado para definir a senha do Usuário.';

      this.notificationService.showSuccessMessage(messageSuccess);
      this.voltar();
    });
  }

  inativar(): void {
    this.usuariosService.inativarUsuario(this.id).subscribe(() => {
      this.voltar();
      this.notificationService.showSuccessMessage('Usuário inativado com sucesso!');
    });
  }

  reativar(): void {
    this.usuariosService.reativarUsuario(this.id).subscribe(() => {
      this.voltar();
      this.notificationService.showSuccessMessage('Usuário reativado com sucesso!');
    });
  }

  showInfoTable(perfil: string): void {
    this.perfis = this.funcionalidades.filter(role => role.group === perfil);
    this.showInformation = true;
  }

  hideInfoTable(): void {
    this.showInformation = false;
  }

  obterErrosFormulario = (form: any) => {
    const errors: any = {};

    Object.keys(form.controls).forEach(control => {
      const controlErrors = form.controls[control].errors;

      if (controlErrors) {
        Object.keys(controlErrors).forEach(errorName => {
          errors[errorName] = controlErrors[errorName];
        });
      }
    });

    return errors;
  }

  voltar() {
    this.router.navigateByUrl('/usuarios/ativos');
  }

  checarUsernameExistente(username) {
    this.usuariosService.checaUsernameExistente(this.id, username).subscribe(result => {
      this.usernameValid = result.length === 0;
    });
  }
}
