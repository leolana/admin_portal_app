import { Router } from '@angular/router';
import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
  HttpResponse,
} from '@angular/common/http';
import { NotificationService } from './notification/notification.service';
import { LoaderService } from './loader/loader.service';
import { AuthService } from './auth/auth.service';
import { tap, finalize } from 'rxjs/operators';
import { Observable, EMPTY } from 'rxjs';
import { tags } from './tags';
import { PromptService } from './prompt/prompt.service';
import { DateTime } from 'luxon';

@Injectable()
export class RequestInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private auth: AuthService,
    private loaderService: LoaderService,
    private notification: NotificationService,
    private prompt: PromptService,
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authenticated = this.auth.isAuthenticated();
    const authenticating = request.url.indexOf('signin') >= 0;
    const changingPassword = request.url.indexOf('change-password') >= 0;
    const recoveringPassword = request.url.indexOf('/recover-password') >= 0;
    const resetingPassword = request.url.indexOf('/reset-password') >= 0;
    const registering = request.url.indexOf('/register') >= 0;

    if (
      !authenticated &&
      !authenticating &&
      !changingPassword &&
      !registering &&
      !recoveringPassword &&
      !resetingPassword
    ) {
      this.router.navigate(['/login']);
      return EMPTY;
    }

    const hideLoading = !!request.params.get('hideLoading');
    const refreshingToken = request.url.indexOf('refresh-token') > -1;

    if (!(hideLoading || refreshingToken)) {
      // console.log(request.url);
      this.loaderService.onStarted(request);
    }

    if (!authenticating) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${this.auth.accessToken}`,
          SessionToken: `${this.auth.sessionToken}`,
        },
      });
    }

    return next.handle(request).pipe(
      tap(
        (event: HttpEvent<any>) => {},
        (event: any) => {
          if (event instanceof HttpErrorResponse) {
            getErrorFromResponse(event)
              .then(getMessageFromError)
              .then(message => {
                this.notification.showErrorMessage(message);
                console.error(message);
              });

            console.log(event);
          }
        },
      ),
      finalize(() => {
        this.loaderService.onFinished(request);
      }),
    );
  }
}

@Injectable()
export class ISODatesHttpInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      tap((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const body = event.body;
          mapISODates(body);
        }
      }),
    );
  }
}

function mapISODates(body: any): any {
  if (!body) {
    return body;
  }

  if (body instanceof Array) {
    body.forEach((x, i) => {
      body[i] = mapISODates(x);
    });
    return body;
  }

  if (Object(body) === body) {
    Object.keys(body).forEach(key => {
      body[key] = mapISODates(body[key]);
    });
    return body;
  }

  if (/^\d{4}(\-\d\d){2}$/.test(body)) {
    const date = new Date(body);
    date.setMinutes(date.getTimezoneOffset());
    return DateTime.fromJSDate(date).toISO();
  }

  return body;
}

function getMessageFromError(error: any): string {
  if (error) {
    const treatedMessage = tags[error.message];
    if (treatedMessage) {
      return treatedMessage;
    }
    if (error.status !== 500) {
      return error.message;
    }
  }
  return tags['internal-server-error'];
}

function getErrorFromResponse(event: any): Promise<any> {
  if (event.error instanceof Blob) {
    return getJsonFromBlob(event.error).then(error => {
      event.error = error;
      return error;
    });
  }
  return Promise.resolve(event.error);
}

function getJsonFromBlob(blob: any): Promise<any> {
  return new Promise(send => {
    const reader = new FileReader();
    reader.addEventListener('load', () => send(JSON.parse(<string>reader.result)));
    reader.readAsText(blob);
  });
}
