import { format, parseISO } from 'date-fns';

/**
 * Formats a date string or Date object into the Indian standard DD/MM/YYYY format.
 * Returns empty string or default fallback if date is invalid or null.
 */
export function formatDate(
  dateInput: Date | string | number | null | undefined,
  fallback = ''
): string {
  if (!dateInput) return fallback;

  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, 'dd/MM/yyyy');
  } catch {
    return fallback;
  }
}

/**
 * Formats a date string or Date object into DD/MM/YYYY HH:mm format for timestamps.
 */
export function formatDateTime(
  dateInput: Date | string | number | null | undefined,
  fallback = ''
): string {
  if (!dateInput) return fallback;

  try {
    const date = typeof dateInput === 'string' ? parseISO(dateInput) : new Date(dateInput);
    if (isNaN(date.getTime())) {
      return fallback;
    }
    return format(date, 'dd/MM/yyyy HH:mm');
  } catch {
    return fallback;
  }
}
