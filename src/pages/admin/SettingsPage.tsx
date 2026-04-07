export default function AdminSettingsPage() {
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-charcoal">System Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Platform configuration and security policies</p>
      </div>

      <div className="space-y-5">
        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">Organization</h2>
          <div className="space-y-3">
            {[
              { label: 'Organization Name', value: 'Lighthouse Philippines, Inc.' },
              { label: 'Primary Email', value: 'admin@lighthouseph.org' },
              { label: 'Support Hotline', value: '1-800-LIGHTHOUSE' },
              { label: 'Timezone', value: 'Asia/Manila (PHT, UTC+8)' },
            ].map(({ label, value }) => (
              <div key={label} className="grid grid-cols-2 gap-4 items-center">
                <label className="text-sm font-medium text-brand-charcoal">{label}</label>
                <input
                  type="text"
                  defaultValue={value}
                  className="border border-brand-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-bronze"
                />
              </div>
            ))}
          </div>
        </section>

        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">Security Policies</h2>
          <div className="space-y-3">
            {[
              { label: 'Require 2FA for staff accounts', defaultChecked: true },
              { label: 'Session timeout after 30 minutes of inactivity', defaultChecked: true },
              { label: 'Log all sensitive data access to audit trail', defaultChecked: true },
              { label: 'Require password change every 90 days', defaultChecked: false },
              { label: 'IP allowlist for admin accounts', defaultChecked: false },
            ].map(({ label, defaultChecked }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={defaultChecked}
                  className="w-4 h-4 rounded border-brand-border text-brand-bronze focus:ring-brand-bronze"
                />
                <span className="text-sm text-brand-charcoal">{label}</span>
              </label>
            ))}
          </div>
        </section>

        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-2">Data Retention</h2>
          <p className="text-sm text-brand-muted mb-4 leading-relaxed">
            Case records are retained for 10 years per DSWD compliance requirements.
            Audit logs are retained for 7 years. Donor records are retained indefinitely
            unless a deletion request is filed.
          </p>
          <button className="border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
            Initiate Data Purge (Requires Confirmation)
          </button>
        </section>

        <div className="flex justify-end">
          <button className="bg-brand-bronze text-white text-sm font-semibold px-6 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
            Save All Settings
          </button>
        </div>
      </div>
    </div>
  )
}
