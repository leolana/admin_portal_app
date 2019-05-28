import { Injectable, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';
import { Observable, of } from 'rxjs';
import { flatMap } from 'rxjs/operators';
import { PromptService } from '../prompt/prompt.service';

import { environment } from '../../../environments/environment';
import RavenErrorHandler from '../errorHandler/raven.errorHandler';
import { Roles } from './auth.roles';

declare const $: any;

const accessTokenKey = 'alpe.access_token';
const refreshTokenKey = 'alpe.refresh_token';
const sessionTokenKey = 'alpe.session_token';
const membershipsKey = 'alpe.memberships';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    constructor(
        private http: HttpClient,
        private router: Router,
        private promptService: PromptService
    ) {
        $.ajaxSetup({
            beforeSend: xhr => {
                if (this.isAuthenticated()) {
                    xhr.setRequestHeader('Authorization', `Bearer ${this.accessToken}`);
                    xhr.setRequestHeader('SessionToken', `${this.sessionToken}`);
                } else {
                    router.navigate(['/login']);
                    xhr.abort();
                }
            },
            error: (xhr, status, error) => {
                const raven = new RavenErrorHandler();
                raven.handleError(error);
                throw new Error(error);
            }
        });
    }

    private interval = null;
    private userData = null;

    public onImpersonated = new EventEmitter(true);
    public onParticipantChanged = new EventEmitter(true);

    get memberships() {
        return JSON.parse(localStorage.getItem(membershipsKey) || '');
    }

    get user() {
        if (!this.accessToken || !this.sessionToken) {
            this.router.navigate(['/login']);
            return;
        }

        if (!this.userData) {
            const jwt = new JwtHelperService();

            const accessTokenPayload = jwt.decodeToken(this.accessToken);
            const sessionTokenPayload = jwt.decodeToken(this.sessionToken);

            this.userData =  Object.assign({}, accessTokenPayload, sessionTokenPayload);

            this.userData.nome = decodeURIComponent(this.userData.nome);
        }

        return this.userData;
    }

    get accessToken() {
        return localStorage.getItem(accessTokenKey);
    }

    get sessionToken() {
        return localStorage.getItem(sessionTokenKey);
    }

    invalidateUserData() {
        this.userData = null;
    }

    isAuthenticated() {
        const jwt = new JwtHelperService();
        const token = this.accessToken;

        return !jwt.isTokenExpired(token);
    }

    signin(credentials) {
        return this.http.post<any>(environment.apiUrl + '/signin', credentials).pipe(
            flatMap(result => {
                this.setupTokens(result);

                return this.http.post<any>(environment.apiUrl + '/memberships', credentials);
            }),
            flatMap(result => {
                localStorage.setItem(membershipsKey, JSON.stringify(result));

                return of(result);
            })
        );
    }

    getSessionToken(participanteId) {
        return this.http.post<any>(environment.apiUrl + '/initiate-session', { participanteId: participanteId }).pipe(
            flatMap(result => {
                this.setupTokens(result);
                this.setupRefreshInterval();
                this.invalidateUserData();

                this.onParticipantChanged.emit(this.user);

                return of(this.user);
            })
        );
    }

    signout() {
        if (this.interval) {
            clearInterval(this.interval);
        }

        localStorage.removeItem(accessTokenKey);
        localStorage.removeItem(refreshTokenKey);
        localStorage.removeItem(sessionTokenKey);
    }

    setupTokens(tokens) {
        if (tokens.accessToken)
            localStorage.setItem(accessTokenKey, tokens.accessToken);

        if (tokens.refreshToken)
            localStorage.setItem(refreshTokenKey, tokens.refreshToken);

        if (tokens.sessionToken)
            localStorage.setItem(sessionTokenKey, tokens.sessionToken);
    }

    setupRefreshInterval() {
        if (!this.isAuthenticated()) {
            return;
        }

        if (this.interval) {
            clearInterval(this.interval);
        }

        this.interval = setInterval(() => {
            const refreshToken = localStorage.getItem(refreshTokenKey);

            this.http
                .post<any>(environment.apiUrl + '/refresh-token', { refreshToken: refreshToken })
                .subscribe(result => this.setupTokens(result));
        }, environment.refreshTokenInterval);
    }

    hasRole(..._roles) {
        const roles = this.user ? this.user.resource_access[environment.client].roles : [];
        return roles.includes(Roles.super) || roles.some(r => _roles.some(rr => rr == r));
    }

    changePassword(user) {
        return this.http.post(environment.apiUrl + '/change-password', user);
    }

    requestPasswordReset(parameters) {
        return this.http.post(environment.apiUrl + '/recover-password', parameters);
    }

    resetPassword(parameters) {
        return this.http.post(environment.apiUrl + '/reset-password', parameters);
    }

    impersonate(participanteId) {
        return this.http
            .post<any>(environment.apiUrl + '/impersonate', { participanteId: participanteId })
            .pipe(
                flatMap(result => {
                    this.setupTokens(result);
                    this.invalidateUserData();

                    this.onImpersonated.emit(this.user);

                    return of(this.user);
                })
            );
    }
}
