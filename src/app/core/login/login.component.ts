import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth/auth.service';

declare const $: any;

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['login.component.css']
})
export class LoginComponent implements OnInit {
    constructor(
        private authService: AuthService,
        private router: Router,
        private route: ActivatedRoute
    ) { }

    return = '';
    choosingMembership = false;
    participantes = [];

    // FORM CONTROLS
    email = new FormControl('', [Validators.required, Validators.email]);
    password = new FormControl('', [Validators.required, Validators.minLength(8)]);
    participante = new FormControl('', Validators.required);

    // FORM GROUPS
    login = new FormGroup({
        email: this.email,
        password: this.password
    });

    formChooseParticipante = new FormGroup({
        participante: this.participante
    });

    ngOnInit() {
        $('body').addClass('login-page');

        this.route.queryParams
            .subscribe(params => this.return = params['returnUrl'] || '/');
    }

    signin() {
        this.email.markAsDirty();
        this.password.markAsDirty();

        if (!this.login.valid) { return; }

        this.authService
            .signin(this.login.value)
            .subscribe(participantes => {
                if (participantes.length > 1) {
                    this.participantes = participantes;
                    this.choosingMembership = true;
                    return;
                }

                if (participantes.length)
                    this.participante.setValue(participantes[0].id);

                this.getSessionToken();
            });
    }

    choose() {
        if (!this.participante.valid) { return; }

        this.getSessionToken();
    }

    getSessionToken() {
        this.authService
            .getSessionToken(this.participante.value)
            .subscribe(() => {
                const user = this.authService.user;

                if (user.participante && user.acceptedTerms === false) {
                    this.router.navigate(['/termo-aceite'], { queryParams: { returnUrl: this.return } });
                    return;
                }

                this.router.navigateByUrl(this.return);
            });
    }
}
