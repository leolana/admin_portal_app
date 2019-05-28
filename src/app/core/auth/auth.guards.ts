import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';
import { Roles } from './auth.roles';

import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthenticationGuardService implements CanActivate {
    constructor(public auth: AuthService,
        public router: Router) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (!this.auth.isAuthenticated()) {
            this.router.navigate(['login'], { queryParams: { returnUrl: state.url }});
            return false;
        }

        return true;
    }
}

@Injectable({ providedIn: 'root' })
export class AuthorizationGuardService implements CanActivate {
    constructor(public auth: AuthService, public router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        if (route.data.roles) {
            if (!this.auth.hasRole(...route.data.roles)) {
                this.router.navigate(['/acesso-bloqueado']);
                return false;
            }
        }

        return true;
    }
}

@Injectable({ providedIn: 'root' })
export class ParticipanteGuardService implements CanActivate {
    constructor(public auth: AuthService, public router: Router) { }

    canActivate(route: ActivatedRouteSnapshot): boolean {
        const estabelecimentoDenied = route.data.somenteEstabelecimentos && !this.auth.user.participanteEstabelecimento;
        const fornecedorDenied = route.data.somenteFornecedores && !this.auth.user.participanteFornecedor;

        const denied = route.data.somenteEstabelecimentos && route.data.somenteFornecedores
            ? (estabelecimentoDenied && fornecedorDenied)
            : (estabelecimentoDenied || fornecedorDenied);

        if (denied) {
            this.router.navigate(['/acesso-bloqueado']);
            return false;
        }

        return true;
    }
}
