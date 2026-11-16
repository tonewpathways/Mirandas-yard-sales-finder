/**
 * Returns today's calendar date in the user's local timezone as "YYYY-MM-DD".
 * Using local components avoids UTC timezone shifts near midnight.
 */
export function getTodayLocalDateStr(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Adds a positive or negative number of days to a "YYYY-MM-DD" string
 * and returns the resulting local date string.
 */
export function addDaysToDateStr(baseDateStr: string, days: number): string {
  const [y, m, d] = baseDateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + days);
  const ny = date.getFullYear();
  const nm = String(date.getMonth() + 1).padStart(2, '0');
  const nd = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

/**
 * Parses a "YYYY-MM-DD" string into a Date object at local midnight.
 */
export function parseLocalDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Checks whether a given "YYYY-MM-DD" date is strictly before today.
 * Used both for form validation and auto-expiring past listings.
 */
export function isPastDate(dateStr: string): boolean {
  return dateStr < getTodayLocalDateStr();
}

/**
 * Returns true when the given date matches today's local date.
 */
export function isTodayDate(dateStr: string): boolean {
  return dateStr === getTodayLocalDateStr();
}

/**
 * Determines whether a date falls on the current/upcoming Saturday or Sunday.
 * If today is Sunday, only today counts (yesterday's Saturday is already past).
 */
export function isThisWeekendDate(dateStr: string): boolean {
  const todayStr = getTodayLocalDateStr();
  if (dateStr < todayStr) return false;

  const today = parseLocalDate(todayStr);
  const dayOfWeek = today.getDay(); // 0 = Sunday, 6 = Saturday

  let saturdayOffset = 6 - dayOfWeek;
  let sundayOffset = 7 - dayOfWeek;
  if (dayOfWeek === 0) {
    saturdayOffset = -1;
    sundayOffset = 0;
  }

  const saturdayStr = addDaysToDateStr(todayStr, saturdayOffset);
  const sundayStr = addDaysToDateStr(todayStr, sundayOffset);

  return dateStr === saturdayStr || dateStr === sundayStr;
}

/**
 * Returns true if the given date falls between today and 7 days from now (inclusive).
 */
export function isWithinNext7Days(dateStr: string): boolean {
  const todayStr = getTodayLocalDateStr();
  const maxStr = addDaysToDateStr(todayStr, 7);
  return dateStr >= todayStr && dateStr <= maxStr;
}

/**
 * Formats a date string into a concise card label (e.g., "Today, Nov 15" or "Sat, Nov 21").
 */
export function formatDisplayDate(dateStr: string): string {
  if (isTodayDate(dateStr)) {
    const d = parseLocalDate(dateStr);
    const short = d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    return `Today, ${short}`;
  }
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Formats a date string into a full human-readable label for the detail modal.
 */
export function formatLongDate(dateStr: string): string {
  const d = parseLocalDate(dateStr);
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Converts a 24-hour "HH:mm" string into 12-hour format with AM/PM.
 */
export function formatTime12h(time24: string): string {
  if (!time24 || !time24.includes(':')) return time24;
  const [hStr, mStr] = time24.split(':');
  let h = parseInt(hStr, 10);
  const m = mStr.padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}

/**
 * Builds a clean time-range string (e.g., "8:00 AM – 2:00 PM") for cards and modals.
 */
export function formatTimeRange(startTime: string, endTime: string): string {
  if (startTime && endTime) {
    return `${formatTime12h(startTime)} – ${formatTime12h(endTime)}`;
  }
  if (startTime) {
    return `Starts ${formatTime12h(startTime)}`;
  }
  return 'All day';
}
