import { Pipe, PipeTransform } from '@angular/core';
import { DateTime } from 'luxon';

@Pipe({
  name: 'date'
})
export class DatePipe implements PipeTransform {
  transform(value: string): string {
    const date =  DateTime.fromISO(value);
    if (date.isValid) {
      return  date.toFormat('dd/MM/yyyy');
    }
    return value;
  }
}
