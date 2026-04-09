import { useContext, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RoleContext } from '@/App'
import { login, saveAuthSession } from '@/lib/auth'
import { looksUnsafe, sanitizeText } from '@/lib/validation'
import { LoaderCircle } from 'lucide-react'

export default function LoginPage() {
  const { setRole } = useContext(RoleContext)
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')

    const normalizedUsername = sanitizeText(username, 64)
    const normalizedPassword = password.trim()
    if (!normalizedUsername || !password.trim()) {
      setError('Enter both username and password.')
      return
    }
    if (looksUnsafe(normalizedUsername)) {
      setError('Username contains invalid characters.')
      return
    }

    try {
      setIsSubmitting(true)
      const session = await login(normalizedUsername, normalizedPassword)
      saveAuthSession(session)

      const role = session.user.role === 'Admin' ? 'admin' : 'donor'
      const path = role === 'admin' ? '/admin' : '/donor'

      setRole(role)
      navigate(path)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to sign in right now.')
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
            <pattern id="login-dots" x="0" y="0" width="28" height="28" patternUnits="userSpaceOnUse">
              <circle cx="14" cy="14" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#login-dots)" />
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
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-12 lg:px-16 bg-brand-cream">
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
            <h1 className="font-serif text-3xl text-brand-charcoal mb-2">Welcome back</h1>
            <p className="text-brand-muted">Sign in to your Imari portal.</p>
          </div>

          {/* Email/password form */}
          <form className="space-y-4 mb-8" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full border border-brand-border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light"
                placeholder="admin or donor"
                autoComplete="username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full border border-brand-border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-charcoal text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <LoaderCircle className="w-4 h-4 animate-spin" />
                  Signing In
                </>
              ) : (
                'Sign In'
              )}
            </button>
            <div className="space-y-3 text-sm text-brand-muted text-center">
              <div>
                <Link to="/register" className="text-brand-bronze hover:underline font-medium">
                  Create a donor account
                </Link>
              </div>
              <div className="text-xs">
                <a href="mailto:admin@imarighana.org" className="text-brand-bronze hover:underline">
                  Need access? Contact your administrator
                </a>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
