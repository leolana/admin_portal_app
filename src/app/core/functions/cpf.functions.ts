import { AbstractControl } from '@angular/forms';

const blacklist = [
  '00000000000',
  '11111111111',
  '22222222222',
  '33333333333',
  '44444444444',
  '55555555555',
  '66666666666',
  '77777777777',
  '88888888888',
  '99999999999',
  '12345678909',
];

function format(documento: string): string {
  const onlyDigits = (documento || '').replace(/\D/g, '');
  const formatted = onlyDigits.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4');

  if (onlyDigits === formatted) {
    return documento;
  }
  return formatted;
}

function isValid(cpf: string) {
  cpf = (cpf || '').replace(/\D/g, '');
  if (!/^\d{11}$/.test(cpf)) {
    return false;
  }

  if (blacklist.indexOf(cpf) !== -1) {
    return false;
  }

  const digito = (atual: string): string => {
    const max = atual.length + 1;
    const soma = atual.split('').reduce((acc, x, i) => acc + +x * (max - i), 0);
    const resto = soma % 11;
    return String(resto < 2 ? 0 : 11 - resto);
  };

  let _cpf = cpf.slice(0, 9);
  _cpf += digito(_cpf);
  _cpf += digito(_cpf);

  return _cpf === cpf;
}

function validator(control: AbstractControl): { [key: string]: any } | null {
  return isValid(control.value) ? null : { cpf: 'CPF Inválido' };
}

export const CpfFunctions = {
  format,
  isValid,
  validator,
};
