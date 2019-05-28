import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { PromptService } from '../prompt/prompt.service';

declare const $: any;

@Component({ templateUrl: './recover-password.component.html' })
export class RecoverPasswordComponent implements OnInit {
  constructor(
    private authService: AuthService,
    private router: Router,
    private promptService: PromptService,
  ) {}

  // FORM CONTROLS
  email = new FormControl('', [Validators.required, Validators.email]);

  // FORM GROUPS
  formRecover = new FormGroup({
    email: this.email,
  });

  ngOnInit() {
    $('body').addClass('login-page');
  }

  recover() {
    this.email.markAsDirty();

    if (!this.formRecover.valid) return;

    this.authService
      .requestPasswordReset({
        email: this.email.value,
      })
      .subscribe(() => {
        this.promptService
          .inform('Você receberá um e-mail contendo as instruções de redefinição de senha!')
          .then(() => this.router.navigate(['/login']));
      });
  }
}
