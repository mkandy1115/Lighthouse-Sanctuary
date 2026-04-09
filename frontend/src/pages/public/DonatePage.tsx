import { useContext, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { RoleContext } from '@/App'
import { registerDonor, saveAuthSession } from '@/lib/auth'
import { createPublicDonation } from '@/lib/donations'
import { convertUsdToPhp, formatCurrency } from '@/lib/formatters'
import { inRange, looksUnsafe, sanitizeText, validateEmail, validateStrongPassword } from '@/lib/validation'
import { Heart, Check, ArrowRight, RefreshCw, UserPlus, Ghost, LoaderCircle } from 'lucide-react'

const presetAmounts = [25, 50, 100, 250, 500]

const impacts = [
  { min: 10, max: 24, label: 'Covers one counseling session for a survivor.' },
  { min: 25, max: 49, label: 'Provides one week of essential meals for a resident.' },
  { min: 50, max: 99, label: 'Funds two weeks of safe home residency for a survivor.' },
  { min: 100, max: 249, label: 'Sponsors a full month of shelter, meals, and counseling.' },
  { min: 250, max: 499, label: 'Covers one month of livelihood training for a graduate.' },
  { min: 500, max: Infinity, label: 'Sponsors a survivor\'s full 90-day reintegration program.' },
]

type DonateMode = 'anonymous' | 'register'

function getImpact(amount: number): string {
  const match = impacts.find((i) => amount >= i.min && amount <= i.max)
  return match?.label ?? 'Every dollar makes a difference. Thank you for giving.'
}

export default function DonatePage() {
  const navigate = useNavigate()
  const { setRole } = useContext(RoleContext)
  const [frequency, setFrequency] = useState<'once' | 'monthly'>('once')
  const [selected, setSelected] = useState<number>(2500)
  const [custom, setCustom] = useState('')
  const [mode, setMode] = useState<DonateMode>('anonymous')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState<null | { message: string; donorCreated: boolean }>(null)

  const effectiveAmountUsd = custom !== '' ? Number(custom) || 0 : selected
  const effectiveAmountPhp = useMemo(() => Math.round(convertUsdToPhp(effectiveAmountUsd)), [effectiveAmountUsd])
  const impactMessage = useMemo(() => getImpact(effectiveAmountUsd), [effectiveAmountUsd])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (effectiveAmountUsd <= 0) {
      setError('Enter a donation amount greater than zero.')
      return
    }
    if (!inRange(effectiveAmountUsd, 1, 100000)) {
      setError('Donation amount must be between $1 and $100,000.')
      return
    }

    try {
      setIsSubmitting(true)

      if (mode === 'register') {
        const safeFirstName = sanitizeText(firstName, 80)
        const safeLastName = sanitizeText(lastName, 80)
        const safeEmail = sanitizeText(email, 254).toLowerCase()
        const safeUsername = sanitizeText(username, 64)
        if (!safeFirstName || !safeLastName || !safeEmail || !safeUsername || !password.trim()) {
          setError('Complete all donor account fields before continuing.')
          return
        }
        if (!validateEmail(safeEmail)) {
          setError('Enter a valid email address.')
          return
        }
        if (!validateStrongPassword(password)) {
          setError('Password must be at least 14 characters.')
          return
        }
        if ([safeFirstName, safeLastName, safeUsername].some(looksUnsafe)) {
          setError('One or more fields contains unsafe input.')
          return
        }

        const session = await registerDonor({
          firstName: safeFirstName,
          lastName: safeLastName,
          email: safeEmail,
          username: safeUsername,
          password,
          country: 'Ghana',
          acquisitionChannel: 'Website',
        })

        saveAuthSession(session)

        await createPublicDonation({
          amount: effectiveAmountPhp,
          isRecurring: frequency === 'monthly',
          supporterId: session.user.supporterId ?? undefined,
          isAnonymous: false,
          email: safeEmail,
          firstName: safeFirstName,
          lastName: safeLastName,
        })

        setRole('donor')
        setSubmitted({
          donorCreated: true,
          message: `Your donor account has been created and your ${frequency === 'monthly' ? 'monthly' : 'one-time'} gift of ${formatCurrency(effectiveAmountUsd, 'USD')} has been recorded.`,
        })
        return
      }

      await createPublicDonation({
        amount: effectiveAmountPhp,
        isRecurring: frequency === 'monthly',
        isAnonymous: true,
      })

      setSubmitted({
        donorCreated: false,
        message: `Your ${frequency === 'monthly' ? 'monthly' : 'one-time'} anonymous gift of ${formatCurrency(effectiveAmountUsd, 'USD')} has been recorded.`,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to process your donation right now.')
    } finally {
      setIsSubmitting(false)
    }
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
          <p className="text-brand-muted text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
            {submitted.message}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {submitted.donorCreated && (
              <button
                type="button"
                onClick={() => navigate('/donor')}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-charcoal text-white font-semibold rounded-lg hover:bg-slate-800 transition-colors"
              >
                Go to donor dashboard
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors"
            >
              Return to homepage
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </section>
        <PublicFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <PublicNav />

      <section className="pt-32 pb-16 bg-brand-charcoal dark:bg-slate-950 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center relative">
          <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-5">
            Give today
          </p>
          <h1 className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight">
            Give anonymously or become a donor partner
          </h1>
          <p className="text-brand-muted-light text-lg leading-relaxed">
            Make a one-time or monthly gift today. If you create a donor account, you will be able to
            view giving history and impact updates later.
          </p>
        </div>
      </section>

      <section className="py-16 bg-brand-cream dark:bg-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3">
              <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-700 border border-brand-border dark:border-slate-600 rounded-2xl p-8 shadow-card">
                <div className="mb-8">
                  <p className="text-sm font-semibold text-brand-charcoal dark:text-white mb-3">Giving path</p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setMode('anonymous')}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        mode === 'anonymous'
                          ? 'border-brand-bronze bg-brand-bronze-muted dark:bg-slate-600 dark:border-brand-bronze'
                          : 'border-brand-border dark:border-slate-600 bg-white dark:bg-slate-600 hover:border-brand-bronze/40'
                      }`}
                    >
                      <Ghost className={`w-5 h-5 mb-2 ${mode === 'anonymous' ? 'text-brand-charcoal dark:text-white' : 'text-brand-charcoal dark:text-slate-300'}`} />
                      <p className={`font-semibold ${mode === 'anonymous' ? 'text-brand-charcoal dark:text-white' : 'text-brand-charcoal dark:text-slate-300'}`}>Donate anonymously</p>
                      <p className={`text-sm mt-1 ${mode === 'anonymous' ? 'text-brand-muted dark:text-slate-400' : 'text-brand-muted dark:text-slate-400'}`}>
                        Fastest path. No donor account is created.
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setMode('register')}
                      className={`rounded-xl border-2 p-4 text-left transition-all ${
                        mode === 'register'
                          ? 'border-brand-teal bg-brand-teal-muted dark:bg-slate-600 dark:border-brand-teal'
                          : 'border-brand-border dark:border-slate-600 bg-white dark:bg-slate-600 hover:border-brand-teal/40'
                      }`}
                    >
                      <UserPlus className={`w-5 h-5 mb-2 ${mode === 'register' ? 'text-brand-charcoal dark:text-white' : 'text-brand-charcoal dark:text-slate-300'}`} />
                      <p className={`font-semibold ${mode === 'register' ? 'text-brand-charcoal dark:text-white' : 'text-brand-charcoal dark:text-slate-300'}`}>Register as donor</p>
                      <p className={`text-sm mt-1 ${mode === 'register' ? 'text-brand-muted dark:text-slate-400' : 'text-brand-muted dark:text-slate-400'}`}>
                        Create an account and unlock donor features.
                      </p>
                    </button>
                  </div>
                </div>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-brand-charcoal dark:text-white mb-3">Giving Frequency</p>
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
                </div>

                <div className="mb-8">
                  <p className="text-sm font-semibold text-brand-charcoal dark:text-white mb-3">Select an Amount (USD)</p>
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
                        {formatCurrency(amount, 'USD')}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted font-semibold">$</span>
                    <input
                      type="number"
                      placeholder="Custom amount"
                      value={custom}
                      onChange={(e) => { setCustom(e.target.value); setSelected(0) }}
                      className="w-full pl-8 pr-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                    />
                  </div>
                </div>

                {effectiveAmountUsd > 0 && (
                  <div className="bg-brand-bronze-muted dark:bg-slate-600 border border-brand-bronze/20 dark:border-slate-500 rounded-lg p-4 mb-8">
                    <p className="text-sm text-brand-charcoal dark:text-slate-100">
                      <span className="font-semibold">Your gift of {formatCurrency(effectiveAmountUsd, 'USD')} </span>
                      {frequency === 'monthly' ? 'each month ' : ''}
                      {impactMessage}
                    </p>
                  </div>
                )}

                {mode === 'register' ? (
                  <div className="space-y-4 mb-8">
                    <p className="text-sm font-semibold text-brand-charcoal dark:text-white">Create donor account</p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="First name"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Last name"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                      />
                    </div>
                    <input
                      type="email"
                      placeholder="Email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                    />
                    <div className="grid sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Choose a username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                      />
                      <input
                        type="password"
                        placeholder="Create a password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="px-4 py-3 border border-brand-border rounded-lg text-brand-charcoal text-sm focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
                      />
                    </div>
                    <p className="text-xs text-brand-muted">
                      Creating an account also signs you in and unlocks donor dashboard features.
                    </p>
                  </div>
                ) : (
                  <div className="mb-8 rounded-xl border border-brand-border dark:border-slate-600 bg-brand-stone dark:bg-slate-600 px-4 py-4">
                    <p className="text-sm font-semibold text-brand-charcoal dark:text-white mb-1">Anonymous donation</p>
                    <p className="text-sm text-brand-muted dark:text-slate-300">
                      Your gift will be recorded without creating a donor login. You can still support the mission immediately.
                    </p>
                  </div>
                )}

                {error && (
                  <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full inline-flex items-center justify-center gap-2 px-6 py-4 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze text-base disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <LoaderCircle className="w-4 h-4 animate-spin" />
                      Processing
                    </>
                  ) : (
                    <>
                      <Heart className="w-4 h-4" />
                      {mode === 'register' ? 'Create account and give' : 'Give anonymously'}
                    </>
                  )}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-700 border border-brand-border dark:border-slate-600 rounded-2xl p-6 shadow-card">
                <h2 className="font-serif text-2xl text-brand-charcoal dark:text-white mb-4">What happens next</h2>
                <div className="space-y-4 text-sm text-brand-muted dark:text-slate-300">
                  <div>
                    <p className="font-semibold text-brand-charcoal dark:text-white">Anonymous gift</p>
                    <p>Your donation is recorded immediately without a donor account.</p>
                  </div>
                  <div>
                    <p className="font-semibold text-brand-charcoal dark:text-white">Registered donor</p>
                    <p>Your donation is recorded and your donor account is created for future access.</p>
                  </div>
                </div>
              </div>

              <div className="bg-brand-charcoal dark:bg-slate-900 rounded-2xl p-6 text-white">
                <p className="text-xs uppercase tracking-widest text-brand-bronze dark:text-brand-bronze-light font-semibold mb-3">
                  Why monthly giving matters
                </p>
                <p className="text-sm text-brand-muted-light dark:text-slate-300 leading-relaxed">
                  Reliable monthly gifts help the organization plan shelter, counseling, education,
                  and reintegration support with greater stability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
