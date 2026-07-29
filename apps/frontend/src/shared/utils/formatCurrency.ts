/**
 * Module-scoped formatters to prevent expensive re-instantiation on every function call (Style Guide §11).
 */
const indianCurrencyFormatterNoDecimals = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const indianCurrencyFormatterWithDecimals = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a monetary number into Indian Rupee format (e.g. ₹1,25,000 or ₹1,23,456.50).
 * Handles invalid or null amounts safely with em-dash '—' or custom fallback.
 */
export function formatCurrency(
  amount: number | string | null | undefined,
  fallback = '—'
): string {
  if (amount === null || amount === undefined || amount === '') {
    return fallback;
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return fallback;
  }

  if (numericAmount === 0 && fallback !== '—' && fallback !== '₹0') {
    return fallback;
  }

  const hasDecimals = numericAmount % 1 !== 0;
  return hasDecimals
    ? indianCurrencyFormatterWithDecimals.format(numericAmount)
    : indianCurrencyFormatterNoDecimals.format(numericAmount);
}
