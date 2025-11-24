const BRASILIA_TIMEZONE = 'America/Sao_Paulo';
const LOCALE_PT_BR = 'pt-BR';

export function convertUTCToBrasilia(utcDateString: string | Date): Date {
  const utcDate
    = typeof utcDateString === 'string' ? new Date(utcDateString) : utcDateString;

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BRASILIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(utcDate);
  const year = Number.parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
  const month
    = Number.parseInt(parts.find(p => p.type === 'month')?.value || '0', 10) - 1; // Month is 0-indexed
  const day = Number.parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
  const hour = Number.parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = Number.parseInt(
    parts.find(p => p.type === 'minute')?.value || '0',
    10,
  );
  const second = Number.parseInt(
    parts.find(p => p.type === 'second')?.value || '0',
    10,
  );

  return new Date(year, month, day, hour, minute, second);
}

export function convertBrasiliaToUTC(brasiliaDateString: string | Date): string {
  if (typeof brasiliaDateString === 'string') {
    const dateStr = brasiliaDateString.includes('T')
      ? brasiliaDateString
      : `${brasiliaDateString}T00:00:00`;

    const [datePart, timePart] = dateStr.split('T');
    if (!datePart) {
      throw new Error('Invalid date format');
    }

    const dateComponents = datePart.split('-').map(Number);
    const year = dateComponents[0] || 0;
    const month = dateComponents[1] || 0;
    const day = dateComponents[2] || 0;

    const timeComponents = (timePart || '').split(':').map(Number);
    const hour = timeComponents[0] ?? 0;
    const minute = timeComponents[1] ?? 0;
    const second = timeComponents[2] ?? 0;

    const utcDate = new Date(Date.UTC(year, month - 1, day, hour, minute, second));
    const adjustedUTC = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

    return adjustedUTC.toISOString();
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: BRASILIA_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(brasiliaDateString);
  const year = Number.parseInt(parts.find(p => p.type === 'year')?.value || '0', 10);
  const month
    = Number.parseInt(parts.find(p => p.type === 'month')?.value || '0', 10) - 1;
  const day = Number.parseInt(parts.find(p => p.type === 'day')?.value || '0', 10);
  const hour = Number.parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
  const minute = Number.parseInt(
    parts.find(p => p.type === 'minute')?.value || '0',
    10,
  );
  const second = Number.parseInt(
    parts.find(p => p.type === 'second')?.value || '0',
    10,
  );

  const utcDate = new Date(Date.UTC(year, month, day, hour, minute, second));
  const adjustedUTC = new Date(utcDate.getTime() + 3 * 60 * 60 * 1000);

  return adjustedUTC.toISOString();
}

export function getCurrentDateTimeBrasilia(): Date {
  const now = new Date();
  return convertUTCToBrasilia(now);
}

export function getCurrentDateBrasilia(): string {
  const now = getCurrentDateTimeBrasilia();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getCurrentHourBrasilia(): number {
  const now = getCurrentDateTimeBrasilia();
  return now.getHours();
}

export function getCurrentDayBrasilia(): number {
  const now = getCurrentDateTimeBrasilia();
  return now.getDay();
}

export function formatDateTimeBrasilia(
  date: string | Date,
  includeTime: boolean = true,
): string {
  if (!date) {
    return 'Data inválida';
  }

  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (Number.isNaN(dateObj.getTime())) {
      return 'Data inválida';
    }

    const options: Intl.DateTimeFormatOptions = {
      dateStyle: 'short',
      ...(includeTime && { timeStyle: 'short' }),
      timeZone: BRASILIA_TIMEZONE,
    };

    return new Intl.DateTimeFormat(LOCALE_PT_BR, options).format(dateObj);
  } catch {
    return 'Data inválida';
  }
}

export function getCurrentDayAPIFormat(): number {
  const jsDay = getCurrentDayBrasilia();
  return jsDay === 0 ? 6 : jsDay - 1;
}

export function convertDateBrasiliaToUTC(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const dateAtMidnightBrasilia = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  const dateAtMidnightUTC = new Date(
    dateAtMidnightBrasilia.getTime() + 3 * 60 * 60 * 1000,
  );

  const utcYear = dateAtMidnightUTC.getUTCFullYear();
  const utcMonth = String(dateAtMidnightUTC.getUTCMonth() + 1).padStart(2, '0');
  const utcDay = String(dateAtMidnightUTC.getUTCDate()).padStart(2, '0');

  return `${utcYear}-${utcMonth}-${utcDay}`;
}

export function convertDateUTCToBrasilia(dateString: string): string {
  const [year, month, day] = dateString.split('-').map(Number);

  if (!year || !month || !day) {
    throw new Error('Invalid date format. Expected YYYY-MM-DD');
  }

  const dateAtMidnightUTC = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));

  const dateAtMidnightBrasilia = new Date(
    dateAtMidnightUTC.getTime() - 3 * 60 * 60 * 1000,
  );

  const brasiliaYear = dateAtMidnightBrasilia.getUTCFullYear();
  const brasiliaMonth = String(dateAtMidnightBrasilia.getUTCMonth() + 1).padStart(2, '0');
  const brasiliaDay = String(dateAtMidnightBrasilia.getUTCDate()).padStart(2, '0');

  return `${brasiliaYear}-${brasiliaMonth}-${brasiliaDay}`;
}
