import { useState } from 'react'
import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { Heart, Check, ArrowRight, RefreshCw, CreditCard, Shield } from 'lucide-react'

const presetAmounts = [500, 1000, 2500, 5000, 10000]

const impacts = [
  { min: 200, max: 499, label: 'Covers one counseling session for a survivor.' },
  { min: 500, max: 999, label: 'Provides one week of essential meals for a resident.' },
  { min: 1000, max: 2499, label: 'Funds two weeks of safe home residency for a survivor.' },
  { min: 2500, max: 4999, label: 'Sponsors a full month of shelter, meals, and counseling.' },
  { min: 5000, max: 9999, label: 'Covers one month of livelihood training for a graduate.' },
  { min: 10000, max: Infinity, label: 'Sponsors a survivor\'s full 90-day reintegration program.' },
]

function getImpact(amount: number): string {
  const match = impacts.find((i) => amount >= i.min && amount <= i.max)
  return match?.label ?? 'Every cedi makes a difference. Thank you for giving.'
}

const tiers = [
  {
    amount: 500,
    label: 'Supporter',
    color: 'border-brand-border',
    activeColor: 'border-brand-bronze bg-brand-bronze-muted',
    description: 'One week of counseling sessions',
  },
  {
    amount: 2500,
    label: 'Sustainer',
    color: 'border-brand-border',
    activeColor: 'border-brand-teal bg-brand-teal-muted',
    description: 'One month of emergency shelter',
  },
  {
    amount: 10000,
    label: 'Champion',
    color: 'border-brand-border',
    activeColor: 'border-brand-bronze bg-brand-bronze-muted',
    description: 'Full livelihood training cohort',
  },
]

export default function DonatePage() {
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [selected, setSelected] = useState<number>(2500)
  const [custom, setCustom] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const effectiveAmount = custom !== '' ? Number(custom) || 0 : selected
  const impactMessage = getImpact(effectiveAmount)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-white">
        <PublicNav />
        <section className="pt-40 pb-32 text-center px-4">
          <div className="w-16 h-16 rounded-full bg-brand-teal-muted flex items-center justify-center mx-auto mb-6">
            <Check className="w-8 h-8 text-brand-teal" />
          </div>
          <h1 className="font-serif text-3xl md:text-4xl text-brand-charcoal mb-4">
            Thank you for your generosity.
          </h1>
          <p className="text-brand-muted text-lg max-w-lg mx-auto mb-8 leading-relaxed">
            Your {frequency === 'monthly' ? 'monthly' : 'one-time'} gift of{' '}
            <strong className="text-brand-charcoal">
              ₵{effectiveAmount.toLocaleString()}
            </strong>{' '}
            will go directly to supporting survivors at Imari: Safe Haven.
            A confirmation and receipt will be sent to your email.
          </p>
          <a
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors"
          >
            Return to Homepage
            <ArrowRight className="w-4 h-4" />
          </a>
        </section>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-16 bg-brand-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <pattern id="donate-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#donate-dots)" />
          </svg>
        </div>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-5">
            Give today
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight">
            Support a Survivor Today
          </h1>
          <p className="text-brand-muted-light text-lg leading-relaxed">
            Your generosity directly funds programs that restore safety, dignity, and hope.
            100% of donations go to program services.
          </p>
        </div>
      </section>

      {/* ── Donation form + impact panel ─────────────────────────────────── */}
      <section className="py-16 bg-brand-cream">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">

            {/* Left — donation form */}
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-white border border-brand-border rounded-2xl p-8 shadow-card">

                {/* Frequency toggle */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-brand-charcoal mb-3">Giving Frequency</p>
                  <div className="flex rounded-lg border border-brand-border overflow-hidden w-fit">
                    <button
                      type="button"
                      onClick={() => setFrequency('once')}
                      className={`px-5 py-2.5 text-sm font-medium transition-colors ${
                        frequency === 'once'
                          ? 'bg-brand-charcoal text-white'
                          : 'bg-white text-brand-muted hover:text-brand-charcoal'
                      }`}
                    >
                      One-time
                    </button>
                    <button
                      type="button"
                      onClick={() => setFrequency('monthly')}
                      className={`px-5 py-2.5 text-sm font-medium transition-colors flex items-center gap-1.5 ${
                        frequency === 'monthly'
                          ? 'bg-brand-charcoal text-white'
                          : 'bg-white text-brand-muted hover:text-brand-charcoal'
                      }`}
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      Monthly
                    </button>
                  </div>
                  {frequency === 'monthly' && (
                    <p className="text-xs text-brand-teal mt-2 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Monthly donors provide the most reliable funding for our programs.
                    </p>
                  )}
                </div>

                {/* Amount selector */}
                <div className="mb-8">
                  <p className="text-sm font-semibold text-brand-charcoal mb-3">Select an Amount (₵ GHS)</p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-4">
                    {presetAmounts.map((amount) => (
                      <button
                        key={amount}
                        type="button"
                        onClick={() => { setSelected(amount); setCustom('') }}
                        className={`py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                          selected === amount && custom === ''
                            ? 'border-brand-bronze bg-brand-bronze text-white'
                            : 'border-brand-border bg-white text-brand-charcoal hover:border-brand-bronze/40'
                        }`}
                      >
                        ₵{amount >= 1000 ? `${amount / 1000}k` : amount}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted font-semibold">₵</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setSelected(0) }}
                      className="w-full pl-8 pr-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Impact message */}
                {effectiveAmount > 0 && (
                  <div className="bg-brand-bronze-muted border border-brand-bronze/20 rounded-lg p-4 mb-8">
                    <p className="text-sm text-brand-charcoal">
                      <span className="font-semibold">Your gift of ₵{effectiveAmount.toLocaleString()} </span>
                      {frequency === 'monthly' ? 'each month ' : ''}
                      {impactMessage}
                    </p>
                  </div>
                )}

                {/* Personal info */}
                <div className="space-y-4 mb-8">
                  <p className="text-sm font-semibold text-brand-charcoal">Your Details</p>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <input
                      type="text"
                      placeholder="First name"
                      required
                      className="px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Last name"
                      required
                      className="px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                    />
                  </div>
                  <input
                    type="email"
                    placeholder="Email address"
                    required
                    className="w-full px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze text-base"
                >
                  <Heart className="w-4 h-4" />
                  Give ₵{effectiveAmount > 0 ? effectiveAmount.toLocaleString() : '—'}
                  {frequency === 'monthly' ? ' / month' : ' Now'}
                </button>

                <div className="flex items-center justify-center gap-2 mt-4 text-xs text-brand-muted">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Secure donation. Receipt sent by email. Cancel anytime.</span>
                </div>
              </form>
            </div>

            {/* Right — giving tiers + why */}
            <div className="lg:col-span-2 space-y-6">
              {/* Giving tiers */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-brand-muted mb-4">
                  Giving Levels
                </p>
                <div className="space-y-3">
                  {tiers.map(({ amount, label, activeColor, description }) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => { setSelected(amount); setCustom('') }}
                      className={`w-full text-left rounded-xl p-4 border-2 transition-all ${
                        selected === amount && custom === ''
                          ? activeColor
                          : 'border-brand-border bg-white hover:border-brand-bronze/30'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-brand-charcoal text-sm">{label}</span>
                        <span className="font-serif text-lg text-brand-charcoal">
                          ₵{amount.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-xs text-brand-muted">{description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment methods */}
              <div className="bg-white border border-brand-border rounded-xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-brand-bronze" />
                  <p className="text-sm font-semibold text-brand-charcoal">Payment Methods</p>
                </div>
                <div className="space-y-2 text-sm text-brand-muted">
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-teal" />
                    Mobile Money (MTN, Vodafone, AirtelTigo)
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-teal" />
                    Bank transfer (GHS or USD)
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-brand-teal" />
                    Visa / Mastercard (international)
                  </div>
                </div>
              </div>

              {/* Trust signals */}
              <div className="bg-brand-teal-muted border border-brand-teal/20 rounded-xl p-5 text-sm text-brand-muted">
                <p className="font-semibold text-brand-charcoal mb-2">Our promise to you</p>
                <ul className="space-y-1.5">
                  {[
                    '87% of funds go directly to programs',
                    'Annual independent audit by Deloitte Ghana',
                    'Monthly impact updates for recurring donors',
                    'Cancel your monthly gift anytime',
                  ].map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-brand-teal mt-0.5 shrink-0" />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
