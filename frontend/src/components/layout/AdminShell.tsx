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
  Users,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { clearAuthSession, getStoredAuthUser } from '@/lib/auth'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Overview', to: '/admin', icon: BarChart2, end: true },
  { label: 'Caseload', to: '/admin/cases', icon: Users },
  { label: 'Process Notes', to: '/admin/counseling', icon: ClipboardList },
  { label: 'Home Visits', to: '/admin/home-visits', icon: Home },
  { label: 'Conferences', to: '/admin/conferences', icon: CalendarClock },
  { label: 'Donors', to: '/admin/donors', icon: Heart },
  { label: 'Reports', to: '/admin/reports', icon: Briefcase },
  { label: 'Social', to: '/admin/social', icon: Globe },
  { label: 'Users', to: '/admin/users', icon: ShieldCheck },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
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
      <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-brand-border bg-white px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg">🕊️</span>
          <div className="flex flex-col leading-none">
            <span className="text-sm font-semibold tracking-tight text-brand-charcoal">Imari</span>
            <span className="mt-0.5 text-[9px] uppercase tracking-widest text-brand-muted">Safe Haven</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {(['Home', 'About', 'Learn More'] as const).map((label) => (
            <Link
              key={label}
              to={label === 'Home' ? '/' : '#'}
              className="px-4 py-1.5 text-sm text-brand-charcoal transition-colors hover:text-brand-bronze"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSignOut}
            className="text-sm text-brand-muted transition-colors hover:text-brand-charcoal"
          >
            Sign out
          </button>
          <div
            className="flex h-8 w-8 cursor-pointer select-none items-center justify-center rounded-full text-sm font-semibold text-white"
            style={{ background: 'linear-gradient(135deg, #2D8A8A, #4AADAD)' }}
            title={displayName}
          >
            {initialsFromName(displayName)}
          </div>
        </div>
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
