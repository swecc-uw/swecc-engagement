/**
 * guidelines:
 *
 * - parse dates immediately when receiving from API
 *     ex: const date = parseAnyDate(storedDate);
 * - only convert to local time when displaying to users
 *     ex: formatDate(date, true);
 * - use tpAPIFormat to convert dates to ISO UTC for API
 *     ex: const storedDate = toAPIFormat(new Date());
 */

const DATE_FORMAT: Intl.DateTimeFormatOptions = {
  month: 'long',
  day: 'numeric',
  year: 'numeric',
};

const TIME_FORMAT: Intl.DateTimeFormatOptions = {
  hour: '2-digit',
  minute: '2-digit',
  timeZoneName: 'short',
};

/**
 * parse a Date object from either ISO UTC or YYYY-MM-DD string
 */
export function parseAnyDate(input: string | Date): Date {
  if (input instanceof Date) return input;

  // yyyy-mm-dd
  if (input.includes('-') && input.length === 10) {
    const [year, month, day] = input.split('-');
    return new Date(+year, +month - 1, +day);
  }

  // ISO
  return new Date(input);
}

/**
 * format date for display to users
 */
export function formatDate(date: string | Date, includeTime = false): string {
  const d = parseAnyDate(date);
  if (includeTime) {
    return d.toLocaleString('en-US', { ...DATE_FORMAT, ...TIME_FORMAT });
  }
  return d.toLocaleDateString('en-US', DATE_FORMAT);
}

export function startOfDayUTC(date: string | Date): Date {
  const d = parseAnyDate(date);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

export function endOfDayUTC(date: string | Date): Date {
  const d = parseAnyDate(date);
  d.setUTCHours(23, 59, 59, 999);
  return d;
}

export function addDays(date: string | Date, days: number): Date {
  const d = parseAnyDate(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

export function isSameUTCDay(
  date1: string | Date,
  date2: string | Date
): boolean {
  const d1 = parseAnyDate(date1);
  const d2 = parseAnyDate(date2);
  return (
    d1.getUTCFullYear() === d2.getUTCFullYear() &&
    d1.getUTCMonth() === d2.getUTCMonth() &&
    d1.getUTCDate() === d2.getUTCDate()
  );
}

/**
 * Convert date to ISO UTC string for API
 * Prefer this over using toISOString() directly for future refactoring
 */
export function toAPIFormat(
  date: string | Date,
  includeTime: boolean = false
): string {
  date = parseAnyDate(date);
  if (includeTime) return date.toISOString();
  return date.toISOString().split('T')[0];
}

/**
 * for date inputs, want to be localized to user's timezone
 */
export function toDateInputFormat(date: string | Date | undefined): string {
  if (date === undefined || date === '') return '';
  return parseAnyDate(date).toISOString().split('T')[0];
}

/**
 * for date inputs
 */
export function fromDateValueFormat(date: string): Date {
  return new Date(date);
}

export const getToday = () => startOfDayUTC(new Date());
export const getTomorrow = () => addDays(getToday(), 1);
export const getYesterday = () => addDays(getToday(), -1);
export const getOneWeekAgo = () => addDays(getToday(), -7);
export const getOneWeekLater = () => addDays(getToday(), 7);
export const getThisUpcomingSunday = () => {
  const today = getToday();
  return addDays(today, (7 - today.getUTCDay()) % 7);
};
export const getLastSunday = () => addDays(getThisUpcomingSunday(), -7);
export const timestampNow = () => new Date().toISOString();
