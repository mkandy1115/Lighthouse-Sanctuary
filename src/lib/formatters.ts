import { format, formatDistanceToNow, parseISO, isValid } from 'date-fns'

/**
 * Format a number as currency.
 * Defaults to USD ($). Pass 'PHP' for Philippine Peso (₱).
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  if (currency === 'PHP') {
    return formatPhilippinePeso(amount)
  }
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format a date string with different display modes.
 * - 'short'    → Jan 12, 2025
 * - 'long'     → January 12, 2025
 * - 'relative' → 3 days ago
 */
export function formatDate(
  dateStr: string,
  mode: 'short' | 'long' | 'relative' = 'short',
): string {
  if (!dateStr) return '—'

  let date: Date
  try {
    date = parseISO(dateStr)
    if (!isValid(date)) {
      date = new Date(dateStr)
    }
    if (!isValid(date)) return '—'
  } catch {
    return '—'
  }

  switch (mode) {
    case 'long':
      return format(date, 'MMMM d, yyyy')
    case 'relative':
      return formatDistanceToNow(date, { addSuffix: true })
    case 'short':
    default:
      return format(date, 'MMM d, yyyy')
  }
}

/**
 * Format a number with thousands separators.
 */
export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n)
}

/**
 * Format a number as a percentage string.
 * @param n        - Value between 0 and 100
 * @param decimals - Decimal places (default 1)
 */
export function formatPercent(n: number, decimals: number = 1): string {
  return `${n.toFixed(decimals)}%`
}

/**
 * Format a number as Philippine Peso (₱).
 */
export function formatPhilippinePeso(amount: number): string {
  return `₱${new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`
}

/**
 * Truncate a string to a given length, appending "…" if cut.
 */
export function truncate(str: string, len: number): string {
  if (!str) return ''
  if (str.length <= len) return str
  return str.slice(0, len).trimEnd() + '…'
}

/**
 * Generate initials from a full name — first letter of first two words, uppercased.
 */
export function initials(name: string): string {
  if (!name) return '?'
  const words = name.trim().split(/\s+/).filter(Boolean)
  const letters = words.slice(0, 2).map((w) => w.charAt(0).toUpperCase())
  return letters.join('')
}
