import { Injectable } from '@angular/core';
import { DialogService } from '../dialog/dialog.service';
import { PromptComponent } from './prompt.component';

@Injectable({
  providedIn: 'root',
})
export class PromptService {
  constructor(private dialogService: DialogService) {}

  inform(message, title = 'Info') {
    return this.dialogService.open(PromptComponent, {
      title: title,
      message: message,
      css: 'btn-primary',
      buttons: { ok: true },
    });
  }

  alert(message, title = 'ERRO') {
    return this.dialogService.open(PromptComponent, {
      title: title,
      message: message,
      css: 'btn-danger',
      buttons: { ok: true },
    });
  }

  warn(message, title = 'Atenção!') {
    return this.dialogService.open(PromptComponent, {
      title: title,
      message: message,
      css: 'btn-warning',
      buttons: { ok: true },
    });
  }

  confirm(message, title = 'Confirmar ...') {
    return this.dialogService.open(PromptComponent, {
      title: title,
      message: message,
      css: 'btn-primary',
      buttons: { yes: true, no: true },
    });
  }
}
