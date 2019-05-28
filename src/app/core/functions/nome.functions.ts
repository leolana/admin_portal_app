import { AbstractControl } from '@angular/forms';

function validaNomeCompleto(nome: string): boolean {
  return regexValidaNomeCompleto().test(nome);
}

// descrição regex https://regex101.com/r/eebcdu/1
function regexValidaNomeCompleto(): RegExp {
  return /^(?:[-a-zA-Z\u00C0-\u024F]+(?: |$)){2,}$/;
}

function validatorNomeCompleto(control: AbstractControl): { [key: string]: any } | null {
  return validaNomeCompleto(control.value) ? null : { Nome: 'Nome Completo Inválido' };
}

export const NomeFunctions = {
  regexValidaNomeCompleto,
  validaNomeCompleto,
  validatorNomeCompleto,
};
