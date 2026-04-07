import { useState, useContext } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { RoleContext } from '@/App'
import type { UserRole } from '@/hooks/useRole'
import Sidebar from '@/components/layout/Sidebar'
import TopBar from '@/components/layout/TopBar'
import MobileNav from '@/components/layout/MobileNav'
import {
  LayoutDashboard,
  Users,
  HeartHandshake,
  Home,
  Activity,
  Calendar,
  TrendingUp,
  DollarSign,
  Megaphone,
  Share2,
  FileBarChart,
  Settings,
  ShieldCheck,
  UserCog,
  Key,
  ClipboardList,
  Gift,
  Sparkles,
  MessageSquare,
  User,
} from 'lucide-react'

type NavItem = {
  label: string
  to: string
  icon: React.ComponentType<{ className?: string }>
}

const staffNav: NavItem[] = [
  { label: 'Dashboard', to: '/staff', icon: LayoutDashboard },
  { label: 'Cases', to: '/staff/cases', icon: Users },
  { label: 'Counseling', to: '/staff/counseling', icon: HeartHandshake },
  { label: 'Home Visits', to: '/staff/home-visits', icon: Home },
  { label: 'Interventions', to: '/staff/interventions', icon: Activity },
  { label: 'Conferences', to: '/staff/conferences', icon: Calendar },
  { label: 'Outcomes', to: '/staff/outcomes', icon: TrendingUp },
  { label: 'Donors', to: '/staff/donors', icon: DollarSign },
  { label: 'Campaigns', to: '/staff/campaigns', icon: Megaphone },
  { label: 'Social Media', to: '/staff/social', icon: Share2 },
  { label: 'Reports', to: '/staff/reports', icon: FileBarChart },
  { label: 'Settings', to: '/staff/settings', icon: Settings },
]

const donorNav: NavItem[] = [
  { label: 'Dashboard', to: '/donor', icon: LayoutDashboard },
  { label: 'Donation History', to: '/donor/donations', icon: Gift },
  { label: 'My Impact', to: '/donor/impact', icon: Sparkles },
  { label: 'Campaigns', to: '/donor/campaigns', icon: Megaphone },
  { label: 'Messages', to: '/donor/messages', icon: MessageSquare },
  { label: 'My Profile', to: '/donor/profile', icon: User },
]

const adminNav: NavItem[] = [
  { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: UserCog },
  { label: 'Roles', to: '/admin/roles', icon: Key },
  { label: 'Audit Log', to: '/admin/audit', icon: ClipboardList },
  { label: 'Settings', to: '/admin/settings', icon: ShieldCheck },
]

const navByRole: Record<string, NavItem[]> = {
  staff: staffNav,
  supervisor: staffNav,
  donor: donorNav,
  admin: adminNav,
}

const roleLabel: Record<string, string> = {
  staff: 'Staff Portal',
  supervisor: 'Supervisor Portal',
  donor: 'Donor Portal',
  admin: 'Admin Console',
}

interface AppShellProps {
  role: UserRole
  children: React.ReactNode
}

export default function AppShell({ role, children }: AppShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { setRole } = useContext(RoleContext)
  const navigate = useNavigate()
  const location = useLocation()
  const navItems = navByRole[role] ?? staffNav

  function handleLogout() {
    setRole('staff')
    navigate('/login')
  }

  const currentItem = navItems.find((item) => {
    if (item.to === location.pathname) return true
    return item.to !== `/${role}` && location.pathname.startsWith(item.to)
  })

  const pageTitle = currentItem?.label ?? roleLabel[role]
  const pageSubtitle =
    role === 'donor'
      ? 'Track giving, measure impact, and stay connected to Lighthouse.'
      : role === 'admin'
        ? 'Manage users, permissions, and governance controls.'
        : 'Coordinate care, monitor outcomes, and move work forward.'

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((current) => !current)}
        items={navItems}
        title="Imari"
        subtitle={roleLabel[role]}
        footerAction={handleLogout}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <MobileNav open={mobileOpen} onOpenChange={setMobileOpen} title={roleLabel[role]}>
          <nav className="space-y-1">
            {navItems.map(({ label, to, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to.split('/').length === 2}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm ${
                    isActive ? 'bg-brand-charcoal text-white' : 'text-brand-charcoal hover:bg-brand-stone'
                  }`
                }
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </MobileNav>
        <TopBar title={pageTitle} subtitle={pageSubtitle} userName="Demo User" />
        <main className="flex-1 overflow-auto bg-white p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
