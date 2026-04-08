import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  BarChart2,
  Briefcase,
  CalendarClock,
  ChevronLeft,
  ClipboardList,
  Globe,
  Heart,
  Home,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { clearAuthSession, getStoredAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', to: '/admin', icon: BarChart2, end: true },
  { label: 'Participants (Caseload)', to: '/admin/cases', icon: Users },
  { label: 'Process Notes', to: '/admin/counseling', icon: ClipboardList },
  { label: 'Home Visits', to: '/admin/home-visits', icon: Home },
  { label: 'Conferences', to: '/admin/conferences', icon: CalendarClock },
  { label: 'Donors', to: '/admin/donors', icon: Heart },
  { label: 'Reports', to: '/admin/reports', icon: Briefcase },
  { label: 'Social', to: '/admin/social', icon: Globe },
  { label: 'Users', to: '/admin/users', icon: ShieldCheck },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
  { label: 'Profile', to: '/admin/profile', icon: Settings },
]

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AD'
}

export default function AdminShell() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const navigate = useNavigate()
  const user = getStoredAuthUser()

  const displayName = useMemo(() => {
    if (!user?.displayName) return 'Admin User'
    return user.displayName
  }, [user])

  function handleSignOut() {
    clearAuthSession()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-20 flex min-h-14 flex-wrap items-center justify-between gap-2 border-b border-brand-border bg-white px-3 py-2 sm:px-6 sm:py-0 sm:h-14">
        <Link to="/" className="flex items-center gap-2 shrink-0">
          <img src="/imari-icon.svg" alt="" className="h-8 w-8 shrink-0" />
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-brand-charcoal">Imari</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-widest text-brand-muted">Safe Haven</span>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          <Link
            to="/"
            className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium text-brand-charcoal border border-brand-border hover:bg-brand-stone sm:text-sm"
          >
            Public site
          </Link>
          <Link
            to="/about"
            className="hidden sm:inline-flex items-center rounded-lg px-3 py-1.5 text-sm text-brand-charcoal hover:text-brand-bronze"
          >
            About
          </Link>
          <Link
            to="/admin/profile"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-charcoal border border-brand-border hover:bg-brand-stone sm:text-sm"
          >
            <User className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Profile
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-lg px-3 py-1.5 text-xs font-medium text-brand-muted transition-colors hover:bg-brand-stone hover:text-brand-charcoal sm:text-sm"
          >
            Sign out
          </button>
          <div
            className="flex h-8 w-8 shrink-0 cursor-default select-none items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #2D8A8A, #4AADAD)' }}
            title={displayName}
          >
            {initialsFromName(displayName)}
          </div>
        </nav>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className={cn('flex shrink-0 flex-col border-r border-brand-border bg-white transition-all duration-300', sidebarCollapsed ? 'w-14' : 'w-56')}>
          <div className={cn('flex items-center border-b border-brand-border py-3', sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4')}>
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold uppercase tracking-wider text-brand-muted">Operations Menu</span>
            )}
            <button
              type="button"
              onClick={() => setSidebarCollapsed((collapsed) => !collapsed)}
              className="rounded p-1 text-brand-muted transition-colors hover:bg-brand-stone hover:text-brand-charcoal"
              aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <ChevronLeft className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </button>
          </div>

          <nav className="flex-1 space-y-0.5 px-2 py-2">
            {navItems.map(({ label, to, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    sidebarCollapsed && 'justify-center',
                    isActive
                      ? 'bg-brand-teal-muted font-medium text-brand-teal'
                      : 'text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal',
                  )
                }
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </NavLink>
            ))}
          </nav>

          <div className="border-t border-brand-border px-2 py-2">
            <button
              type="button"
              onClick={handleSignOut}
              className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-brand-muted transition-colors hover:bg-brand-stone hover:text-brand-charcoal', sidebarCollapsed && 'justify-center')}
              title={sidebarCollapsed ? 'Sign out' : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-brand-cream">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  )
}
