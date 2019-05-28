import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'dateTime'
})
export class DateTimePipe implements PipeTransform {
  transform(value: any): string {
    if (!value) {
      return '';
    }

    let date: DateTime;
    if (value instanceof Date) {
      date = DateTime.fromJSDate(value);
    } else {
      date = DateTime.fromISO(value);
    }

    return date.toFormat('dd/MM/yyyy HH:mm');
  }
}
