export default function DonorProfilePage() {
  return (
    <div className="animate-fade-in max-w-2xl">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-charcoal">My Profile</h1>
        <p className="text-brand-muted text-sm mt-1">Manage your donor account and communication preferences</p>
      </div>

      <div className="space-y-5">
        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'First Name', value: 'Jose' },
              { label: 'Last Name', value: 'Dela Cruz' },
              { label: 'Email', value: 'jose@example.com' },
              { label: 'Mobile', value: 'Donor contact line' },
              { label: 'Organization', value: '' },
              { label: 'Country', value: 'Philippines' },
            ].map(({ label, value }) => (
              <div key={label}>
                <label className="block text-xs font-medium text-brand-muted mb-1">{label}</label>
                <input
                  type="text"
                  defaultValue={value}
                  placeholder={label}
                  className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:border-brand-bronze"
                />
              </div>
            ))}
          </div>
          <button className="mt-4 bg-brand-bronze text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-bronze-light transition-colors">
            Save Changes
          </button>
        </section>

        <section className="bg-brand-cream rounded-xl border border-brand-border p-6">
          <h2 className="font-semibold text-brand-charcoal mb-4">Communication Preferences</h2>
          <div className="space-y-3">
            {[
              { label: 'Email receipts for every donation', defaultChecked: true },
              { label: 'Monthly impact updates', defaultChecked: true },
              { label: 'New campaign announcements', defaultChecked: false },
              { label: 'Annual tax statement', defaultChecked: true },
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
          <h2 className="font-semibold text-brand-charcoal mb-2">Privacy & Data</h2>
          <p className="text-sm text-brand-muted mb-4 leading-relaxed">
            Your personal data is stored securely and never sold or shared with third parties.
            You can request a full export or deletion of your data at any time.
          </p>
          <div className="flex gap-3">
            <button className="border border-brand-border text-brand-charcoal text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-stone transition-colors">
              Request Data Export
            </button>
            <button className="border border-red-200 text-red-600 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-colors">
              Request Account Deletion
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
