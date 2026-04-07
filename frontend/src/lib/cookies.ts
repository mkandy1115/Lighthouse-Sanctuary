export type CookieConsentMode = 'essential' | 'all'

const COOKIE_CONSENT_KEY = 'imari_cookie_consent'

export function getCookieConsent(): CookieConsentMode | null {
  const value = localStorage.getItem(COOKIE_CONSENT_KEY)
  if (value === 'essential' || value === 'all') {
    return value
  }

  return null
}

export function saveCookieConsent(mode: CookieConsentMode) {
  localStorage.setItem(COOKIE_CONSENT_KEY, mode)
}

export function openCookiePreferences() {
  window.dispatchEvent(new CustomEvent('imari:open-cookie-preferences'))
}
