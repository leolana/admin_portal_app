import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PromptService } from '../prompt/prompt.service';
import { strengthPasswordValidator } from '../register/strength-password.validator';

declare const $: any;

@Component({ templateUrl: './change-password.component.html' })
export class ChangePasswordComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private promptService: PromptService,
  ) {}

  // FORM CONTROLS
  email = new FormControl('', [Validators.required, Validators.email]);
  password = new FormControl('', [Validators.required, Validators.minLength(8)]);
  newPassword = new FormControl('', strengthPasswordValidator);
  confirmNewPassword = new FormControl('', [
    Validators.required,
    Validators.minLength(8),
    (control: FormControl) => {
      return this.newPassword.value !== control.value ? { passwordMismatch: 'miss' } : null;
    },
  ]);

  // FORM GROUPS
  formChangePassword = new FormGroup({
    email: this.email,
    password: this.password,
    newPassword: this.newPassword,
    confirmNewPassword: this.confirmNewPassword,
  });

  ngOnInit() {
    $('body').addClass('login-page');
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
    this.email.markAsDirty();
    this.password.markAsDirty();
    this.newPassword.markAsDirty();
    this.confirmNewPassword.markAsDirty();

    if (!this.formChangePassword.valid) return;

    this.authService.changePassword(this.formChangePassword.value).subscribe(() => {
      this.promptService
        .inform('Senha alterada com sucesso!')
        .then(() => this.router.navigate(['/login']));
    });
  }
}
