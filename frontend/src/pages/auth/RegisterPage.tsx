import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RoleContext } from '@/App'
import { registerDonor, saveAuthSession } from '@/lib/auth'
import { looksUnsafe, validateEmail, validatePasswordMeetsPolicy } from '@/lib/validation'
import { LoaderCircle } from 'lucide-react'

export default function RegisterPage() {
  const { setRole } = useContext(RoleContext)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    username: '',
    password: '',
    passwordConfirm: '',
    phone: '',
    country: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  function validateForm(): boolean {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required.'
    } else if (looksUnsafe(formData.firstName)) {
      newErrors.firstName = 'First name contains invalid characters.'
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required.'
    } else if (looksUnsafe(formData.lastName)) {
      newErrors.lastName = 'Last name contains invalid characters.'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required.'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address.'
    }

    if (!formData.username.trim()) {
      newErrors.username = 'Username is required.'
    } else if (looksUnsafe(formData.username)) {
      newErrors.username = 'Username contains invalid characters.'
    } else if (formData.username.trim().length < 3) {
      newErrors.username = 'Username must be at least 3 characters.'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required.'
    } else if (!validatePasswordMeetsPolicy(formData.password)) {
      newErrors.password = 'Password must be at least 14 characters.'
    }

    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Passwords do not match.'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      setIsSubmitting(true)
      const session = await registerDonor({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        email: formData.email.trim(),
        username: formData.username.trim(),
        password: formData.password,
        phone: formData.phone || undefined,
        country: formData.country || undefined,
      })

      saveAuthSession(session)
      setRole('donor')
      navigate('/donor')
    } catch (err) {
      setErrors({
        submit: err instanceof Error ? err.message : 'Unable to create account right now.',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* ── Left brand panel ─────────────────────────────────────────────── */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-charcoal flex-col justify-between p-12 relative overflow-hidden">
        {/* Dot texture */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <pattern id="register-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="14" cy="14" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#register-dots)" />
          </svg>
        </div>

        {/* Abstract geometric illustration */}
        <div className="absolute bottom-0 right-0 opacity-10">
          <svg width="380" height="380" viewBox="0 0 380 380" fill="none">
            <circle cx="280" cy="280" r="200" stroke="white" strokeWidth="1" />
            <circle cx="280" cy="280" r="140" stroke="white" strokeWidth="1" />
            <circle cx="280" cy="280" r="80" stroke="white" strokeWidth="1" />
            <circle cx="140" cy="140" r="100" stroke="#92642A" strokeWidth="1.5" />
            <path d="M80 280 L200 100 L320 280 Z" stroke="white" strokeWidth="0.8" fill="none" />
          </svg>
        </div>

        {/* Logo */}
        <div className="relative">
          <Link to="/" className="flex items-center gap-2.5 leading-none">
            <img src="/imari-icon.svg" alt="" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-semibold text-white text-xl tracking-tight">Imari</span>
              <span className="text-[10px] text-brand-muted-light tracking-widest uppercase mt-0.5">
                Safe Haven
              </span>
            </div>
          </Link>
        </div>

        {/* Mission quote */}
        <div className="relative">
          <div className="w-10 h-1 bg-brand-bronze rounded-full mb-8" />
          <blockquote>
            <p className="font-serif text-2xl md:text-3xl text-white leading-snug mb-6">
              "We do not rescue people. We stand alongside them until they no longer need us."
            </p>
            <footer className="text-sm text-brand-muted-light">
              <span className="font-semibold text-white">Amara Mensah</span>
              {' '}— Executive Director
            </footer>
          </blockquote>
        </div>

        {/* Back to site */}
        <div className="relative">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-brand-muted-light hover:text-white transition-colors"
          >
            ← Back to imari.org
          </Link>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-brand-cream overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link to="/" className="flex items-center gap-2.5 leading-none">
            <img src="/imari-icon.svg" alt="" className="h-10 w-10" />
            <div className="flex flex-col">
              <span className="font-semibold text-brand-charcoal text-xl tracking-tight">Imari</span>
              <span className="text-[10px] text-brand-muted tracking-widest uppercase mt-0.5">
                Safe Haven
              </span>
            </div>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-brand-charcoal mb-2">Join Imari</h1>
            <p className="text-brand-muted">Create your donor account and make a difference.</p>
          </div>

          {/* Registration form */}
          <form className="space-y-4 mb-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                  First Name
                </label>
                <input
                  type="text"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light ${
                    errors.firstName ? 'border-red-400' : 'border-brand-border'
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-xs text-red-600 mt-1">{errors.firstName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className={`w-full border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light ${
                    errors.lastName ? 'border-red-400' : 'border-brand-border'
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-xs text-red-600 mt-1">{errors.lastName}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light ${
                  errors.email ? 'border-red-400' : 'border-brand-border'
                }`}
                placeholder="john@example.com"
              />
              {errors.email && (
                <p className="text-xs text-red-600 mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light ${
                  errors.username ? 'border-red-400' : 'border-brand-border'
                }`}
                placeholder="johndoe"
              />
              {errors.username && (
                <p className="text-xs text-red-600 mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light ${
                  errors.password ? 'border-red-400' : 'border-brand-border'
                }`}
                placeholder="••••••••••••••"
              />
              {errors.password && (
                <p className="text-xs text-red-600 mt-1">{errors.password}</p>
              )}
              <p className="text-xs text-brand-muted mt-1">Must be at least 14 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Confirm Password
              </label>
              <input
                type="password"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                className={`w-full border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light ${
                  errors.passwordConfirm ? 'border-red-400' : 'border-brand-border'
                }`}
                placeholder="••••••••••••••"
              />
              {errors.passwordConfirm && (
                <p className="text-xs text-red-600 mt-1">{errors.passwordConfirm}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full border border-brand-border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                  Country (Optional)
                </label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full border border-brand-border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light"
                  placeholder="United States"
                />
              </div>
            </div>

            {errors.submit && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errors.submit}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-bronze text-white font-semibold py-3 rounded-lg hover:bg-brand-bronze-light transition-colors text-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Creating Account
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <div className="text-center text-sm text-brand-muted">
            Already have an account?{' '}
            <Link to="/login" className="text-brand-bronze hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
