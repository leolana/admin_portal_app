import { Router } from '@angular/router';
import { FormControl, FormGroup } from '@angular/forms';
import { Component, Input, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { ImpersonateParticipanteComponent } from '../impersonate/dialog-participante.component';
import { DialogService } from '../dialog/dialog.service';
import { AuthService } from '../auth/auth.service';
import { Observable, Subscription } from 'rxjs';
import { Roles } from '../auth/auth.roles';
import { NotificacoesService } from '../notificacoes/notificacoes.service';
import { notificacaoCategoria } from 'src/app/interfaces/notificacao';
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrls: ['./theme.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialogService: DialogService,
    private notificacoesService: NotificacoesService,
  ) {
    this.user = this.authService.user;
    this.auth = this.authService;
    this.membership.setValue(this.user.participante);
  }

  roles = Roles;
  user = null;
  auth = null;
  participantSubscription;
  notificationsIntervalId;
  limitNotifications = 5;
  bulletsNotifications: number;
  notifications: any[] = [];
  membership = new FormControl(null);
  formMembership = new FormGroup({
    membership: this.membership,
  });

  ngOnInit(): void {
    this.participantSubscription = this.authService.onParticipantChanged.subscribe(() => {
      if (this.auth.hasRole(this.roles.boAdministrador, this.roles.boOperacoes))
        this.refreshBulletNotification();
    });

    if (this.auth.hasRole(this.roles.boAdministrador, this.roles.boOperacoes)) {
      this.refreshBulletNotification();
      this.notificationsIntervalId = setInterval(() => {
        this.refreshBulletNotification();
      }, 30000);
    }
  }

  getNotifications() {
    this.notificacoesService
      .getNotifications(1, this.limitNotifications)
      .subscribe(notifications => {
        this.notifications = notifications.map(notification => ({
          ...notification,
          icon: notificacaoCategoria.icons[notification.categoriaId],
        }));
      });
  }

  refreshBulletNotification() {
    this.notificacoesService
      .getBullets()
      .subscribe(bullets => (this.bulletsNotifications = bullets.count));
  }

  getSubTitle() {
    if (this.bulletsNotifications == 1) return `Você tem ${this.bulletsNotifications} notificação.`;

    if (this.bulletsNotifications > 1) return `Você tem ${this.bulletsNotifications} notificações.`;

    if (this.bulletsNotifications == 0) return `Você não possui novas notificações.`;
  }

  closeDropdown(e) {
    e.target.closest('.dropdown').classList.remove('open');
  }

  signout() {
    this.authService.signout();
  }

  changeMembership() {
    this.authService.getSessionToken(this.membership.value).subscribe(user => {
      this.user = user;
      this.router.navigate(['/']);
    });
  }

  impersonate() {
    this.dialogService.open(ImpersonateParticipanteComponent, {}).then(participanteId => {
      if (participanteId) {
        this._updateSession(participanteId);
      }
    });
  }

  clearSession() {
    this._updateSession(null);
  }

  _updateSession(participanteId) {
    this.authService.impersonate(participanteId).subscribe(user => {
      this.user = user;
      this.router.navigate(['/']);
    });
  }

  ngOnDestroy() {
    if (this.notificationsIntervalId) {
      clearInterval(this.notificationsIntervalId);
    }

    if (this.participantSubscription) {
      this.participantSubscription.unsubscribe();
    }
  }
}

@Component({
  selector: 'app-content-header',
  templateUrl: './content-header.html',
})
export class ContentHeaderComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() fa: string;
  @Input() size: string;
  @Input() hideBreadCrumb: boolean;

  @Input() subtitle: string;
  @Input() subtitleEvent: Observable<string>;
  private subtitleSubscription: Subscription;

  ngOnInit() {
    if (this.subtitleEvent) {
      this.subtitleSubscription = this.subtitleEvent.subscribe(subtitle => {
        this.subtitle = subtitle;
      });
    }
  }

  ngOnDestroy() {
    if (this.subtitleSubscription) {
      this.subtitleSubscription.unsubscribe();
    }
  }
}

@Component({ templateUrl: './403.html' })
export class NotPermittedComponent {}
