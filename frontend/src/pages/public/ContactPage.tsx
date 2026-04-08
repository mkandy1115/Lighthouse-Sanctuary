import { useState } from 'react'
import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { looksUnsafe, sanitizeText, validateEmail } from '@/lib/validation'

export default function ContactPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    setSuccess('')

    const safeName = sanitizeText(name, 100)
    const safeEmail = sanitizeText(email, 254).toLowerCase()
    const safeMessage = sanitizeText(message, 2000, true)

    if (!safeName || !safeEmail || !safeMessage) {
      setError('Please complete all fields.')
      return
    }
    if (!validateEmail(safeEmail)) {
      setError('Please provide a valid email address.')
      return
    }
    if (looksUnsafe(safeName) || looksUnsafe(safeMessage)) {
      setError('Message contains invalid characters.')
      return
    }

    setName(safeName)
    setEmail(safeEmail)
    setMessage(safeMessage)
    setSuccess('Thanks. Your message is ready to send.')
  }

  return (
    <div className="min-h-screen bg-brand-cream flex flex-col">
      <PublicNav />
      <main id="main-content" className="flex-1 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h1 className="font-serif text-4xl md:text-5xl text-brand-charcoal mb-4">
            Get in Touch
          </h1>
          <p className="text-brand-muted text-lg mb-16 max-w-2xl">
            Whether you&apos;re a survivor seeking help, a donor with questions, or a partner
            organization — we want to hear from you.
          </p>
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Contact Details</h2>
              <dl className="space-y-4 text-sm">
                {[
                  { label: 'Crisis Hotline', value: 'Contact our crisis response desk via the front office for immediate support.' },
                  { label: 'General Inquiries', value: 'hello@imarighana.org' },
                  { label: 'Donations', value: 'giving@imarighana.org' },
                  { label: 'Partnerships', value: 'partners@imarighana.org' },
                  { label: 'Address', value: '14 Hope Close, East Legon, Accra, Ghana GA-182-3456' },
                  { label: 'Office Hours', value: 'Weekday daytime office support' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex gap-4">
                    <dt className="text-brand-muted font-medium w-36 shrink-0">{label}</dt>
                    <dd className="text-brand-charcoal">{value}</dd>
                  </div>
                ))}
              </dl>
              <p className="mt-8 text-sm">
                <a href="/" className="text-brand-bronze font-medium hover:underline">
                  ← Back to home
                </a>
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-card border border-brand-border">
              <h2 className="font-serif text-xl text-brand-charcoal mb-4">Send a Message</h2>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-charcoal bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
                    placeholder="Your name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-charcoal bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
                    placeholder="you@example.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-brand-charcoal mb-1">
                    Message
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full border border-brand-border rounded-lg px-3 py-2 text-sm text-brand-charcoal bg-brand-cream focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze resize-none"
                    placeholder="How can we help?"
                  />
                </div>
                {error && <p className="text-sm text-rose-700">{error}</p>}
                {success && <p className="text-sm text-brand-teal">{success}</p>}
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
      <PublicFooter />
    </div>
  )
}
