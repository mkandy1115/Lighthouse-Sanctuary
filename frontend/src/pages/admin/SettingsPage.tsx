import { FormEvent, useEffect, useState } from 'react'
import { validateEmail } from '@/lib/validation'

const STORAGE_KEY = 'imari_org_settings_v1'

type OrgForm = {
  organizationName: string
  primaryEmail: string
  supportHotline: string
  timezone: string
}

const defaults: OrgForm = {
  organizationName: 'Imari: Safe Haven',
  primaryEmail: 'admin@imarighana.org',
  supportHotline: 'Front office — weekday hours',
  timezone: 'Africa/Accra (GMT)',
}

function loadForm(): OrgForm {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    const parsed = JSON.parse(raw) as Partial<OrgForm>
    return {
      organizationName: typeof parsed.organizationName === 'string' ? parsed.organizationName : defaults.organizationName,
      primaryEmail: typeof parsed.primaryEmail === 'string' ? parsed.primaryEmail : defaults.primaryEmail,
      supportHotline: typeof parsed.supportHotline === 'string' ? parsed.supportHotline : defaults.supportHotline,
      timezone: typeof parsed.timezone === 'string' ? parsed.timezone : defaults.timezone,
    }
  } catch {
    return { ...defaults }
  }
}

export default function AdminSettingsPage() {
  const [form, setForm] = useState<OrgForm>(defaults)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setForm(loadForm())
  }, [])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSaved(false)

    const name = form.organizationName.trim()
    const email = form.primaryEmail.trim().toLowerCase()
    if (!name) {
      setError('Organization name is required.')
      return
    }
    if (!email || !validateEmail(email)) {
      setError('Enter a valid primary email address.')
      return
    }
    if (!form.supportHotline.trim()) {
      setError('Support hotline description is required.')
      return
    }
    if (!form.timezone.trim()) {
      setError('Timezone is required.')
      return
    }

    const next: OrgForm = {
      organizationName: name,
      primaryEmail: email,
      supportHotline: form.supportHotline.trim(),
      timezone: form.timezone.trim(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
    setForm(next)
    setSaved(true)
  }

  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-charcoal">System Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Organization details (stored in this browser)</p>
      </div>

      <form className="space-y-5" onSubmit={handleSubmit}>
        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">Organization</h2>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-brand-charcoal" htmlFor="org-name">
                Organization Name
              </label>
              <input
                id="org-name"
                type="text"
                value={form.organizationName}
                onChange={(e) => setForm((f) => ({ ...f, organizationName: e.target.value }))}
                className="border border-brand-border rounded-lg px-3 py-2 text-sm bg-white text-brand-charcoal focus:outline-none focus:border-brand-bronze"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-brand-charcoal" htmlFor="org-email">
                Primary Email
              </label>
              <input
                id="org-email"
                type="email"
                value={form.primaryEmail}
                onChange={(e) => setForm((f) => ({ ...f, primaryEmail: e.target.value }))}
                className="border border-brand-border rounded-lg px-3 py-2 text-sm bg-white text-brand-charcoal focus:outline-none focus:border-brand-bronze"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-brand-charcoal" htmlFor="org-hotline">
                Support Hotline
              </label>
              <input
                id="org-hotline"
                type="text"
                value={form.supportHotline}
                onChange={(e) => setForm((f) => ({ ...f, supportHotline: e.target.value }))}
                className="border border-brand-border rounded-lg px-3 py-2 text-sm bg-white text-brand-charcoal focus:outline-none focus:border-brand-bronze"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <label className="text-sm font-medium text-brand-charcoal" htmlFor="org-tz">
                Timezone
              </label>
              <input
                id="org-tz"
                type="text"
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                className="border border-brand-border rounded-lg px-3 py-2 text-sm bg-white text-brand-charcoal focus:outline-none focus:border-brand-bronze"
              />
            </div>
          </div>
        </section>

        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-2">Data Retention</h2>
          <p className="text-sm text-brand-muted mb-4 leading-relaxed">
            Case records are retained per regulatory compliance requirements.
            Audit logs follow internal retention policy. Donor records are retained indefinitely
            unless a deletion request is filed.
          </p>
          <button
            type="button"
            className="border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors"
          >
            Initiate Data Purge (Requires Confirmation)
          </button>
        </section>

        {error ? <p className="text-sm text-rose-700">{error}</p> : null}
        {saved ? <p className="text-sm text-brand-teal">Settings saved for this browser.</p> : null}

        <div className="flex justify-end">
          <button
            type="submit"
            className="bg-brand-bronze text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
          >
            Save Settings
          </button>
        </div>
      </form>
    </div>
  )
}
