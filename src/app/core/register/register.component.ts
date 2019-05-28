import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { UsuariosService } from '../../usuarios/usuarios.service';
import { PromptService } from '../prompt/prompt.service';
import { strengthPasswordValidator } from './strength-password.validator';

declare const $: any;

@Component({ templateUrl: './register.component.html' })
export class RegisterComponent implements OnInit {
  constructor(
    private usuariosService: UsuariosService,
    private router: Router,
    private route: ActivatedRoute,
    private promptService: PromptService,
  ) {}

  codigo = null;
  email = null;

  // FORM CONTROLS
  newPassword = new FormControl('', strengthPasswordValidator);
  confirmNewPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    (control: FormControl) => {
      return this.newPassword.value !== control.value ? { passwordMismatch: 'miss' } : null;
    },
  ]);

  // FORM GROUPS
  formRegister = new FormGroup({
    newPassword: this.newPassword,
    confirmNewPassword: this.confirmNewPassword,
  });

  ngOnInit() {
    $('body').addClass('login-page');

    this.route.params.subscribe(params => {
      this.codigo = params.codigo;
      this.email = params.email;

      if (!this.codigo || !this.email)
        this.promptService.alert('Parâmetros inválidos!').then(() => this.router.navigate['/login']);
    });
  }

  setValuePassword(event) {
    this.newPassword.setValue(event);
    this.newPassword.markAsDirty();
  }

  setValueConfirmPassword(event) {
    this.confirmNewPassword.setValue(event);
    this.confirmNewPassword.markAsDirty();
  }

  change() {
    this.newPassword.markAsDirty();
    this.confirmNewPassword.markAsDirty();

    if (!this.formRegister.valid) return;

    this.usuariosService
      .registrarUsuario({
        codigo: this.codigo,
        email: this.email,
        password: this.newPassword.value,
      })
      .subscribe(() => {
        this.promptService
          .inform('Senha criada com sucesso!')
          .then(() => this.router.navigate(['/login']));
      });
  }
}
