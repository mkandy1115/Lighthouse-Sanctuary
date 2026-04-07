import { useContext } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { RoleContext } from '@/App'
import type { UserRole } from '@/hooks/useRole'
import { ArrowRight, Users, LayoutDashboard, ShieldCheck } from 'lucide-react'

const demoRoles: {
  value: UserRole
  label: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  path: string
}[] = [
  {
    value: 'donor',
    label: 'Enter as Donor',
    description: 'View your giving history, impact, and campaigns',
    icon: LayoutDashboard,
    color: 'hover:border-brand-bronze hover:bg-brand-bronze-muted',
    path: '/donor',
  },
  {
    value: 'staff',
    label: 'Enter as Staff',
    description: 'Case management, counseling, home visits, and more',
    icon: Users,
    color: 'hover:border-brand-teal hover:bg-brand-teal-muted',
    path: '/staff',
  },
  {
    value: 'admin',
    label: 'Enter as Manager',
    description: 'OKRs, participant data, donor oversight, social analytics',
    icon: ShieldCheck,
    color: 'hover:border-slate-400 hover:bg-slate-50',
    path: '/admin',
  },
]

export default function LoginPage() {
  const { setRole } = useContext(RoleContext)
  const navigate = useNavigate()

  function enterAs(role: UserRole, path: string) {
    setRole(role)
    navigate(path)
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
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-semibold text-white text-xl tracking-tight">🕊️ Imari</span>
            <span className="text-[10px] text-brand-muted-light tracking-widest uppercase mt-0.5">
              Safe Haven
            </span>
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
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-semibold text-brand-charcoal text-xl tracking-tight">🕊️ Imari</span>
            <span className="text-[10px] text-brand-muted tracking-widest uppercase mt-0.5">
              Safe Haven
            </span>
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto lg:mx-0">
          <div className="mb-8">
            <h1 className="font-serif text-3xl text-brand-charcoal mb-2">Welcome back</h1>
            <p className="text-brand-muted">Sign in to your Imari portal.</p>
          </div>

          {/* Email/password form */}
          <form className="space-y-4 mb-8">
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                className="w-full border border-brand-border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light"
                placeholder="you@imarighana.org"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-brand-charcoal mb-1.5">
                Password
              </label>
              <input
                type="password"
                className="w-full border border-brand-border rounded-lg px-4 py-3 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
                placeholder="••••••••"
              />
            </div>
            <button
              type="button"
              className="w-full bg-brand-charcoal text-white font-semibold py-3 rounded-lg hover:bg-slate-800 transition-colors text-sm"
            >
              Sign In
            </button>
            <p className="text-center text-xs text-brand-muted">
              <a href="mailto:admin@imarighana.org" className="text-brand-bronze hover:underline">
                Need access? Contact your administrator
              </a>
            </p>
          </form>

          {/* Divider */}
          <div className="relative mb-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-brand-border" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-brand-cream px-4 text-xs text-brand-muted uppercase tracking-widest font-semibold">
                Demo Access
              </span>
            </div>
          </div>

          {/* Demo role cards */}
          <div className="space-y-3">
            <p className="text-xs text-brand-muted mb-1">
              Explore the platform — no account required.
            </p>
            {demoRoles.map(({ value, label, description, icon: Icon, color, path }) => (
              <button
                key={value}
                type="button"
                onClick={() => enterAs(value, path)}
                className={`w-full text-left flex items-center gap-4 px-4 py-3.5 bg-white border-2 border-brand-border rounded-xl transition-all ${color} group`}
              >
                <div className="w-9 h-9 rounded-lg bg-brand-stone flex items-center justify-center shrink-0 group-hover:bg-white/60 transition-colors">
                  <Icon className="w-4 h-4 text-brand-charcoal" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-brand-charcoal text-sm">{label}</p>
                  <p className="text-xs text-brand-muted mt-0.5 leading-snug">{description}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-brand-muted shrink-0 group-hover:translate-x-1 transition-transform" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
