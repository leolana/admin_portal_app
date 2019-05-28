import { AbstractControl } from '@angular/forms';
import { DateTime } from 'luxon';

// descrição regex https://regex101.com/r/BeBWa9/2
function regexValidaData(): RegExp {
  return /^([\d]{4})((([\-]{1})([\d]{2})){2})$/;
}

function formatToDate(number: string): Date {
  const date = DateTime.fromFormat(number, 'yyyy-MM-dd').toJSDate();

  return date;
}

function isValid(date: string) {
  if (!date) {
    return false;
  }

  const _date = formatToDate(date);
  let dateValid = true;

  const minDate = new Date(1800, 0, 1);
  const maxDate = new Date(Date.now());

  if (_date < minDate || _date > maxDate) {
    dateValid = false;
  }

  return dateValid;
}

function validator(control: AbstractControl): { [key: string]: any } | null {
  return isValid(control.value) ? null : { data: 'Data Inválida' };
}

function validatorDataRetroativa(control: AbstractControl): { [key: string]: any } | null {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  let valid = true;

  if (control.value < today) valid = false;

  return valid ? null : { data: 'Data Retroativa.' };
}

function validatorDataFutura(control: AbstractControl): { [key: string]: any } | null {
  let value = control.value as Date;
  if (typeof value == 'string') value = DateTime.fromISO(value).toJSDate();

  const today = DateTime.local().toJSDate();

  const valid = value <= today;

  return valid ? null : { dataFutura: 'A data não pode ser futura' };
}

export const DataFunctions = {
  regexValidaData,
  formatToDate,
  isValid,
  validator,
  validatorDataRetroativa,
  validatorDataFutura,
};
