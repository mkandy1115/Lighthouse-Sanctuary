import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getCookieConsent, saveCookieConsent, type CookieConsentMode } from '@/lib/cookies'

export default function CookieConsentBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(getCookieConsent() === null)

    function handleOpenPreferences() {
      setIsVisible(true)
    }

    window.addEventListener('imari:open-cookie-preferences', handleOpenPreferences)
    return () => {
      window.removeEventListener('imari:open-cookie-preferences', handleOpenPreferences)
    }
  }, [])

  function handleConsent(mode: CookieConsentMode) {
    saveCookieConsent(mode)
    setIsVisible(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50">
      <div className="mx-auto max-w-4xl rounded-2xl border border-brand-border bg-white shadow-2xl">
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-widest text-brand-bronze mb-2">
                Cookie Preferences
              </p>
              <h2 className="font-serif text-2xl text-brand-charcoal mb-2">
                Your privacy choices matter.
              </h2>
              <p className="text-sm leading-relaxed text-brand-muted">
                We use essential cookies and local storage to keep the site working, remember your cookie choice,
                and support account sign-in. If you choose &quot;Accept all,&quot; we may also use analytics-style website
                measurement features as they are added later. Read our{' '}
                <Link to="/privacy" className="font-semibold text-brand-bronze hover:underline">
                  Privacy Policy
                </Link>.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:min-w-[220px]">
              <button
                type="button"
                onClick={() => handleConsent('all')}
                className="rounded-lg bg-brand-charcoal px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Accept All
              </button>
              <button
                type="button"
                onClick={() => handleConsent('essential')}
                className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm font-semibold text-brand-charcoal transition-colors hover:bg-brand-stone"
              >
                Essential Only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
