const htmlLike = /<[^>]+>/i
const scriptLike = /(javascript:|on\w+\s*=|<\s*script|<\/\s*script)/i
const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export function sanitizeText(value: string, maxLength: number, allowNewLines = false): string {
  const trimmed = value.trim().replace(controlChars, '')
  const normalized = allowNewLines
    ? trimmed
    : trimmed.replace(/\r/g, ' ').replace(/\n/g, ' ').replace(/\s{2,}/g, ' ')
  return normalized.slice(0, maxLength)
}

export function looksUnsafe(value: string): boolean {
  if (!value.trim()) return false
  return htmlLike.test(value) || scriptLike.test(value)
}

export function validateEmail(value: string): boolean {
  return emailPattern.test(value.trim())
}

/** Matches API AuthController: minimum length only */
export function validatePasswordMeetsPolicy(value: string): boolean {
  return value.trim().length >= 14
}

/** @deprecated Use validatePasswordMeetsPolicy */
export function validateStrongPassword(value: string): boolean {
  return validatePasswordMeetsPolicy(value)
}

export function inRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max
}
