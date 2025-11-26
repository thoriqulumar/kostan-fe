/**
 * Format number with thousand separators (Indonesian format)
 * Example: 1500000 -> "1.500.000"
 */
export const formatNumber = (value) => {
  if (!value && value !== 0) return '';

  // Convert to string and remove non-digits
  const numStr = value.toString().replace(/\D/g, '');

  // Add thousand separators
  return numStr.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Parse formatted number string to number
 * Example: "1.500.000" -> 1500000
 */
export const parseFormattedNumber = (value) => {
  if (!value) return 0;

  // Remove dots and parse to number
  const numStr = value.toString().replace(/\./g, '');
  const parsed = parseInt(numStr, 10);

  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Handle input change for formatted number inputs
 * Returns the formatted display value
 */
export const handleNumberInput = (value) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');

  // Format with thousand separators
  return formatNumber(digits);
};
