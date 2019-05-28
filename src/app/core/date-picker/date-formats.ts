import { NativeDateAdapter } from '@angular/material';
import { DateTime } from 'luxon';

export class AppDateAdapter extends NativeDateAdapter {
  parse(value: any): Date | null {
    if (typeof value === 'string') {
      if (/^\d{4}(-\d\d){2}/.test(value)) {
        return DateTime.fromISO(value)
          .setZone('GMT')
          .toJSDate();
      }

      value = value.replace(/\D/g, '');
      if (value.length === 8) {
        value = value.replace(/(..)(..)(....)/, '$3-$2-$1');
        return DateTime.fromISO(value)
          .setZone('GMT')
          .toJSDate();
      }

      return null;
    }

    const timestamp = typeof value === 'number' ? value : Date.parse(value);
    return isNaN(timestamp) ? null : new Date(timestamp);
  }

  format(date: Date, displayFormat: string): string {
    const value = DateTime.fromJSDate(date)
      .setZone('GMT')
      .toISODate();

    if (displayFormat == 'input') {
      return value.replace(/(....).(..).(..)/, '$3/$2/$1');
    }

    if (displayFormat == 'inputMonth') {
      return value.replace(/(....).(..).../, '$2/$1');
    }

    return date.toDateString();
  }
}

export const APP_DATE_FORMATS = {
  parse: {
    dateInput: { month: 'short', year: 'numeric', day: 'numeric' },
  },
  display: {
    dateInput: 'input',
    monthYearLabel: 'inputMonth',
    dateA11yLabel: { year: 'numeric', month: 'long', day: 'numeric' },
    monthYearA11yLabel: { year: 'numeric', month: 'long' },
  },
};
