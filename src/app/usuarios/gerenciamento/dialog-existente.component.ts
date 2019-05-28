import { Component, ElementRef } from '@angular/core';
import { DialogComponent } from '../../core/dialog/dialog.component';

@Component({ templateUrl: './dialog-existente.component.html' })
export class UsuarioExistenteComponent extends DialogComponent {
  constructor(private element: ElementRef) {
    super(element);
  }

  participantes: any[] = null;

  onInit(memberships) {
    this.participantes = memberships;
  }
}
