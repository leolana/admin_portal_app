import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'input-nova-senha',
  templateUrl: 'input-nova-senha.component.html',
})
export class InputNovaSenhaComponent {
  constructor() {}

  @Output() typingPassword = new EventEmitter<string>();
  @Input() valuePassword: FormControl;

  emitirSenha(password) {
    this.typingPassword.emit(password);
  }
}
