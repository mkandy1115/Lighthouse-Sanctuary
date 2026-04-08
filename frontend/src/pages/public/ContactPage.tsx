export default function ContactPage() {
  return (
    <main className="min-h-screen bg-brand-cream">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <h1 className="font-serif text-4xl md:text-5xl text-brand-charcoal mb-4">
          Get in Touch
        </h1>
        <p className="text-brand-muted text-lg mb-16 max-w-2xl">
          Whether you're a survivor seeking help, a donor with questions, or a partner
          organization — we want to hear from you.
        </p>
        <div className="grid md:grid-cols-2 gap-12">
          <div>
            <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Contact Details</h2>
            <dl className="space-y-4 text-sm">
              {[
                { label: 'Crisis Hotline', value: 'Contact our crisis response desk via the front office for immediate support.' },
                { label: 'General Inquiries', value: 'hello@lighthouseph.org' },
                { label: 'Donations', value: 'giving@lighthouseph.org' },
                { label: 'Partnerships', value: 'partners@lighthouseph.org' },
                { label: 'Address', value: 'Lighthouse Sanctuary, Quezon City, Metro Manila, Philippines' },
                { label: 'Office Hours', value: 'Weekday daytime office support' },
              ].map(({ label, value }) => (
                <div key={label} className="flex gap-4">
                  <dt className="text-brand-muted font-medium w-36 shrink-0">{label}</dt>
                  <dd className="text-brand-charcoal">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border">
            <h2 className="font-serif text-xl text-brand-charcoal mb-4">Send a Message</h2>
            <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1">
                  Your Name
                </label>
                <input
                  type="text"
                  className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze bg-brand-cream"
                  placeholder="Maria Santos"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze bg-brand-cream"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1">
                  Message
                </label>
                <textarea
                  rows={4}
                  className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze bg-brand-cream resize-none"
                  placeholder="How can we help?"
                />
              </div>
              <button
                type="submit"
                className="w-full bg-brand-bronze text-white font-semibold py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors text-sm"
              >
                Send Message
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>
  )
}
