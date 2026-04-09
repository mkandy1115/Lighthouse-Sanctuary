import { FormEvent, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { changePassword, getStoredAuthUser } from '@/lib/auth'
import { getThemePreference, saveThemePreference, type ThemePreference } from '@/lib/cookies'
import { validatePasswordMeetsPolicy } from '@/lib/validation'

export default function ProfilePage() {
  const user = getStoredAuthUser()
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [theme, setTheme] = useState<ThemePreference>(() => getThemePreference())

  const returnPath = useMemo(() => (user?.role === 'Admin' ? '/admin' : '/donor'), [user?.role])

  function handleThemeChange(nextTheme: ThemePreference) {
    setTheme(nextTheme)
    saveThemePreference(nextTheme)
    document.documentElement.setAttribute('data-theme', nextTheme)
  }

  async function handlePasswordSubmit(event: FormEvent) {
    event.preventDefault()
    setPasswordError(null)
    setPasswordMessage(null)

    if (!validatePasswordMeetsPolicy(newPassword)) {
      setPasswordError('Use at least 8 characters.')
      return
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.')
      return
    }

    try {
      setSavingPassword(true)
      const response = await changePassword(currentPassword, newPassword)
      setPasswordMessage(response.message)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to change password.')
    } finally {
      setSavingPassword(false)
    }
  }

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <Link to={returnPath} className="text-sm text-brand-bronze hover:underline" aria-label="Back to dashboard">
          ← Back to dashboard
        </Link>
      </div>

      <h1 className="font-serif text-3xl text-brand-charcoal">User Profile</h1>
      <p className="mt-1 text-sm text-brand-muted">
        Manage your password and choose your preferred appearance for the whole site.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-brand-border bg-white p-6">
          <h2 className="font-semibold text-brand-charcoal">Change Password</h2>
          <p className="mt-1 text-sm text-brand-muted">Use your current password to set a new one.</p>

          <form className="mt-5 space-y-4" onSubmit={(event) => void handlePasswordSubmit(event)}>
            <div>
              <label htmlFor="current-password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-muted">Current password</label>
              <input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-cream px-3 py-2 text-sm text-brand-charcoal"
                required
                aria-required="true"
              />
            </div>
            <div>
              <label htmlFor="new-password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-muted">
                New password
                <span className="ml-1 text-xs text-brand-muted">(minimum 14 characters)</span>
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-cream px-3 py-2 text-sm text-brand-charcoal"
                required
                aria-required="true"
                aria-describedby="password-requirements"
                aria-invalid={passwordError ? 'true' : 'false'}
              />
              <p id="password-requirements" className="mt-1 text-xs text-brand-muted">Minimum 14 characters required</p>
            </div>
            <div>
              <label htmlFor="confirm-password" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-brand-muted">Confirm new password</label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="w-full rounded-lg border border-brand-border bg-brand-cream px-3 py-2 text-sm text-brand-charcoal"
                required
                aria-required="true"
                aria-invalid={passwordError ? 'true' : 'false'}
              />
            </div>

            {passwordError && (
              <div
                className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
              >
                {passwordError}
              </div>
            )}
            {passwordMessage && (
              <div
                className="rounded-lg border border-brand-teal-muted bg-brand-teal-muted/20 p-3 text-sm text-brand-teal"
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {passwordMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={savingPassword}
              className="rounded-lg bg-brand-bronze px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-bronze-light disabled:opacity-70"
              aria-busy={savingPassword}
            >
              {savingPassword ? 'Saving...' : 'Update Password'}
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-brand-border bg-white p-6">
          <h2 className="font-semibold text-brand-charcoal">Appearance</h2>
          <p className="mt-1 text-sm text-brand-muted">Pick light or dark mode for the entire site.</p>

          <fieldset className="mt-5">
            <legend className="sr-only">Choose appearance theme</legend>
            <div className="inline-flex rounded-lg border border-brand-border bg-brand-cream p-1" role="group">
              {(['light', 'dark'] as const).map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleThemeChange(option)}
                  aria-pressed={theme === option}
                  className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                    theme === option
                      ? 'bg-white text-brand-charcoal shadow-sm'
                      : 'text-brand-muted hover:text-brand-charcoal'
                  }`}
                >
                  {option === 'light' ? 'Light mode' : 'Dark mode'}
                </button>
              ))}
            </div>
          </fieldset>
        </section>
      </div>
    </div>
  )
}
