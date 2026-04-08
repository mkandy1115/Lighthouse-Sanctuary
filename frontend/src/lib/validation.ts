const htmlLike = /<[^>]+>/i
const scriptLike = /(javascript:|on\w+\s*=|<\s*script|<\/\s*script)/i
const controlChars = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const lower = /[a-z]/
const upper = /[A-Z]/
const digit = /[0-9]/
const special = /[^a-zA-Z0-9]/

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

export function validateStrongPassword(value: string): boolean {
  return value.length >= 14 && lower.test(value) && upper.test(value) && digit.test(value) && special.test(value)
}

export function inRange(value: number, min: number, max: number): boolean {
  return Number.isFinite(value) && value >= min && value <= max
}
