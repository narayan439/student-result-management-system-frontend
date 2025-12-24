import { NativeDateAdapter } from '@angular/material/core';

export class AppDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) {
        return null;
      }

      // DD/MM/YYYY or D/M/YYYY
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(trimmed)) {
        const [dStr, mStr, yStr] = trimmed.split('/');
        const day = Number(dStr);
        const month = Number(mStr);
        const year = Number(yStr);
        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
          return new Date(year, month - 1, day);
        }
      }

      // YYYY-MM-DD
      if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(trimmed)) {
        const [yStr, mStr, dStr] = trimmed.split('-');
        const day = Number(dStr);
        const month = Number(mStr);
        const year = Number(yStr);
        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
          return new Date(year, month - 1, day);
        }
      }
    }

    return super.parse(value);
  }
}

// NativeDateAdapter expects Intl.DateTimeFormatOptions for display formats.
export const APP_DATE_FORMATS = {
  parse: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' }
  },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'short', year: 'numeric' },
    dateA11yLabel: { day: '2-digit', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' }
  }
};
