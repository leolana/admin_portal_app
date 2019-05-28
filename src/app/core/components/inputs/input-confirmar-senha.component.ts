import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'input-confirmar-senha',
  templateUrl: 'input-confirmar-senha.component.html',
})
export class InputConfirmarSenhaComponent {
  constructor() {}

  @Output() typingConfirmPassword = new EventEmitter<string>();
  @Input() valuePassword: FormControl;

  emitirSenha(password) {
    this.typingConfirmPassword.emit(password);
  }
}
