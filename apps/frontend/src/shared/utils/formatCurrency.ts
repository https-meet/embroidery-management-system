/**
 * Module-scoped formatter instance to prevent expensive re-instantiation on every function call (Issue 3 fix)
 */
const indianCurrencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/**
 * Formats a monetary number into Indian Rupee format (e.g. ₹1,23,456.00).
 * Handles invalid or null amounts safely by returning ₹0.00.
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) {
    return '₹0.00';
  }

  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numericAmount)) {
    return '₹0.00';
  }

  return indianCurrencyFormatter.format(numericAmount);
}
