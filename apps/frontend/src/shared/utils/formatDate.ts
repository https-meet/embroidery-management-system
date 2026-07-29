import { format, parseISO } from 'date-fns';

/**
 * Formats a date string or Date object into standard Indian format (e.g. 29 Jul 2026 or dd/MM/yyyy).
 * Handles invalid or null inputs safely with em-dash '—' or custom fallback (Style Guide §11).
 */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  fallback = '—'
): string {
  if (!dateInput) return fallback;

  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, 'dd MMM yyyy');
  } catch {
    return fallback;
  }
}

/**
 * Formats a date string or Date object into DD MMM yyyy HH:mm format for timestamps.
 */
export function formatDateTime(
  dateInput: Date | string | number | null | undefined,
  fallback = '—'
): string {
  if (!dateInput) return fallback;

  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, 'dd MMM yyyy HH:mm');
  } catch {
    return fallback;
  }
}
