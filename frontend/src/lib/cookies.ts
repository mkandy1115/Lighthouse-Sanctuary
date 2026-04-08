export type CookieConsentMode = 'essential' | 'all'
export type ThemePreference = 'light' | 'dark'

const COOKIE_CONSENT_KEY = 'imari_cookie_consent'
const THEME_COOKIE_KEY = 'imari_theme'

export function getCookieConsent(): CookieConsentMode | null {
  const value = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (value === 'essential' || value === 'all') {
    return value
  }

  const fromCookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_CONSENT_KEY}=`))
    ?.split('=')[1]
  if (fromCookie === 'essential' || fromCookie === 'all') {
    return fromCookie
  }

  return null
}

export function saveCookieConsent(mode: CookieConsentMode) {
  localStorage.setItem(COOKIE_CONSENT_KEY, mode)
  const maxAgeDays = 365
  document.cookie = `${COOKIE_CONSENT_KEY}=${mode}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax`
}

export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent('imari:open-cookie-preferences'))
}

export function getThemePreference(): ThemePreference {
  const fromStorage = localStorage.getItem(THEME_COOKIE_KEY)
  if (fromStorage === 'light' || fromStorage === 'dark') return fromStorage

  const fromCookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${THEME_COOKIE_KEY}=`))
    ?.split('=')[1]

  return fromCookie === 'dark' ? 'dark' : 'light'
}

export function saveThemePreference(value: ThemePreference) {
  localStorage.setItem(THEME_COOKIE_KEY, value)
  const maxAgeDays = 365
  document.cookie = `${THEME_COOKIE_KEY}=${value}; path=/; max-age=${maxAgeDays * 24 * 60 * 60}; SameSite=Lax`
}
