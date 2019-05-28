import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PromptService } from '../prompt/prompt.service';

declare const $: any;

@Component({ templateUrl: './reset-password.component.html' })
export class ResetPasswordComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private promptService: PromptService,
  ) {}

  codigo = null;
  email = null;

  // FORM CONTROLS
  newPassword = new FormControl('', [Validators.required, Validators.minLength(8)]);
  confirmNewPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    (control: FormControl) => {
      return this.newPassword.value !== control.value ? { passwordMismatch: 'miss' } : null;
    },
  ]);

  // FORM GROUPS
  formReset = new FormGroup({
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

  change() {
    this.newPassword.markAsDirty();
    this.confirmNewPassword.markAsDirty();

    if (!this.formReset.valid) return;

    this.authService
      .resetPassword({
        codigo: this.codigo,
        email: this.email,
        newPassword: this.newPassword.value,
      })
      .subscribe(() => {
        this.promptService
          .inform('Senha alterada com sucesso!')
          .then(() => this.router.navigate(['/login']));
      });
  }
}
