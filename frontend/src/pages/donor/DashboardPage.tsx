import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  CreditCard, Settings, Sparkles,
  ChevronLeft, LogOut, Heart,
  Globe, Home, BookOpen, ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency } from '@/lib/formatters'

// ─── Mock donor data ──────────────────────────────────────────────────────────
const donor = {
  firstName: 'Richard',
  lastName: 'Mensah',
  email: 'richard.mensah@email.com',
  totalGiven: 24500,
  thisYear: 8000,
  childrenHelped: 30,
  sessionsfunded: 96,
  monthsHousing: 18,
}

// ─── Personal impact data ─────────────────────────────────────────────────────
const personalMonthlyGiving = [
  { month: 'Oct', amount: 2000 },
  { month: 'Nov', amount: 2000 },
  { month: 'Dec', amount: 5000 },
  { month: 'Jan', amount: 2000 },
  { month: 'Feb', amount: 2000 },
  { month: 'Mar', amount: 2000 },
  { month: 'Apr', amount: 4000 },
]

const personalAllocation = [
  { category: 'Safe Housing', amount: 9800, pct: 40, icon: Home, color: '#2D8A8A' },
  { category: 'Trauma Counseling', amount: 7350, pct: 30, icon: Heart, color: '#92642A' },
  { category: 'Education & Training', amount: 4900, pct: 20, icon: BookOpen, color: '#6B8F71' },
  { category: 'Operations', amount: 2450, pct: 10, icon: Settings, color: '#A8A29E' },
]

// ─── Total / Organization impact data ────────────────────────────────────────
const orgStats = [
  { label: 'Girls Supported', value: '327', sub: 'since 2021', color: '#2D8A8A' },
  { label: 'Safe Homes', value: '3', sub: 'across Ghana', color: '#92642A' },
  { label: 'Success Rate', value: '93%', sub: 'reintegration', color: '#6B8F71' },
  { label: 'Total Impact', value: '₵2.4M', sub: 'in services', color: '#7899C0' },
]

const orgMonthlyData = [
  { month: 'Oct', residents: 62, donors: 38 },
  { month: 'Nov', residents: 67, donors: 41 },
  { month: 'Dec', residents: 71, donors: 55 },
  { month: 'Jan', residents: 78, donors: 48 },
  { month: 'Feb', residents: 82, donors: 52 },
  { month: 'Mar', residents: 85, donors: 58 },
  { month: 'Apr', residents: 89, donors: 62 },
]

const recentDonations = [
  { date: 'Apr 1, 2026', amount: 4000, campaign: 'Hope Rising 2026', status: 'Completed' },
  { date: 'Mar 1, 2026', amount: 2000, campaign: 'Monthly Giving', status: 'Completed' },
  { date: 'Feb 1, 2026', amount: 2000, campaign: 'Monthly Giving', status: 'Completed' },
  { date: 'Jan 1, 2026', amount: 2000, campaign: 'Monthly Giving', status: 'Completed' },
  { date: 'Dec 15, 2025', amount: 5000, campaign: 'Year-End Appeal', status: 'Completed' },
]

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const navItems = [
  { label: 'My Impact', icon: Sparkles, key: 'impact' },
  { label: 'Payment History', icon: CreditCard, key: 'history' },
  { label: 'Payment Method', icon: Globe, key: 'payment' },
  { label: 'User Settings', icon: Settings, key: 'settings' },
]

// ─── Sub-pages ────────────────────────────────────────────────────────────────
function PaymentHistory() {
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Payment History</h2>
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-stone">
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Date</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Campaign</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Allocation</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {[
              ...recentDonations,
              { date: 'Nov 1, 2025', amount: 2000, campaign: 'Monthly Giving', status: 'Completed' },
              { date: 'Oct 1, 2025', amount: 2000, campaign: 'Monthly Giving', status: 'Completed' },
              { date: 'Sep 1, 2025', amount: 2000, campaign: 'Monthly Giving', status: 'Completed' },
            ].map((d, i) => (
              <tr key={i} className="border-b border-brand-border last:border-0 hover:bg-brand-cream transition-colors">
                <td className="px-5 py-3.5 text-brand-charcoal">{d.date}</td>
                <td className="px-5 py-3.5 font-semibold text-brand-charcoal">
                  {formatCurrency(d.amount, 'GHS')}
                </td>
                <td className="px-5 py-3.5 text-brand-muted">{d.campaign}</td>
                <td className="px-5 py-3.5 text-brand-muted">General Programs</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-teal-muted text-brand-teal">
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentMethod() {
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Payment Method</h2>
      <div className="max-w-md space-y-4">
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-brand-charcoal">Primary Card</span>
            <span className="text-xs bg-brand-teal-muted text-brand-teal px-2 py-0.5 rounded-full font-medium">Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-7 bg-gradient-to-br from-slate-700 to-slate-900 rounded flex items-center justify-center">
              <span className="text-white text-[8px] font-bold">VISA</span>
            </div>
            <div>
              <p className="text-brand-charcoal font-medium text-sm">•••• •••• •••• 4242</p>
              <p className="text-brand-muted text-xs">Expires 08/28</p>
            </div>
          </div>
          <button className="mt-4 text-sm text-brand-bronze font-medium hover:underline">Update Card</button>
        </div>
        <div className="bg-white rounded-xl border border-brand-border border-dashed p-5 flex items-center gap-3 cursor-pointer hover:border-brand-bronze transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-stone flex items-center justify-center">
            <span className="text-brand-muted text-lg leading-none">+</span>
          </div>
          <span className="text-sm text-brand-muted">Add a payment method</span>
        </div>
      </div>
    </div>
  )
}

function UserSettings() {
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-6">User Settings</h2>
      <div className="max-w-xl space-y-6">
        {[
          { label: 'First Name', value: 'Richard' },
          { label: 'Last Name', value: 'Mensah' },
          { label: 'Email', value: 'richard.mensah@email.com' },
          { label: 'Phone', value: '+233 24 000 0000' },
        ].map(({ label, value }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              {label}
            </label>
            <input
              type="text"
              defaultValue={value}
              className="w-full px-4 py-2.5 border border-brand-border rounded-lg text-brand-charcoal text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-bronze focus:border-transparent"
            />
          </div>
        ))}
        <div className="pt-2">
          <button className="px-6 py-2.5 bg-brand-bronze text-white text-sm font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Impact view (default) ────────────────────────────────────────────────────
function ImpactView() {
  const [view, setView] = useState<'personal' | 'total'>('personal')

  return (
    <div className="animate-fade-in space-y-6">
      {/* Toggle */}
      <div className="flex items-center gap-1 p-1 bg-brand-stone rounded-lg w-fit">
        {(['personal', 'total'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'px-5 py-1.5 rounded-md text-sm font-medium transition-all',
              view === v
                ? 'bg-white text-brand-charcoal shadow-card'
                : 'text-brand-muted hover:text-brand-charcoal',
            )}
          >
            {v === 'personal' ? 'My Impact' : 'Total Impact'}
          </button>
        ))}
      </div>

      {view === 'personal' ? <PersonalImpact /> : <TotalImpact />}
    </div>
  )
}

function PersonalImpact() {
  return (
    <div className="space-y-6">
      {/* Hero card */}
      <div
        className="rounded-2xl p-8 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #92642A 0%, #B8864A 100%)' }}
      >
        {/* Decorative circle */}
        <div
          className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-20"
          style={{ background: 'rgba(255,255,255,0.3)' }}
          aria-hidden="true"
        />
        <div
          className="absolute right-8 bottom-0 w-24 h-24 rounded-full opacity-10"
          style={{ background: 'rgba(255,255,255,0.5)' }}
          aria-hidden="true"
        />
        <p className="text-white/80 text-sm font-medium mb-2">Welcome, {donor.firstName}</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white leading-snug mb-1">
          Thanks to your contributions of
          <br />
          <span className="text-white font-bold">{formatCurrency(donor.totalGiven, 'GHS')}</span>
        </h2>
        <p className="text-white/90 text-lg mt-3">
          you have helped save the lives of{' '}
          <span className="font-bold text-2xl">{donor.childrenHelped} children</span>
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total Donated', value: formatCurrency(donor.totalGiven, 'GHS') },
            { label: 'Children Helped', value: String(donor.childrenHelped) },
            { label: 'Sessions Funded', value: String(donor.sessionsfunded ?? 96) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-white/70 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Giving chart */}
      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Your Giving History</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={personalMonthlyGiving} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="donorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#92642A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#92642A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₵${v / 1000}k`} />
            <Tooltip
              contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [formatCurrency(v, 'GHS'), 'Donated']}
            />
            <Area type="monotone" dataKey="amount" stroke="#92642A" strokeWidth={2} fill="url(#donorGradient)" dot={{ r: 3, fill: '#92642A' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* How money was spent */}
      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-1">Here is how your money was spent</h3>
        <p className="text-brand-muted text-sm mb-5">Allocation of your cumulative contributions across program areas</p>
        <div className="space-y-3">
          {personalAllocation.map(({ category, amount, pct, icon: Icon, color }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm text-brand-charcoal font-medium">{category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-muted">{formatCurrency(amount, 'GHS')}</span>
                  <span className="text-xs text-brand-muted w-8 text-right">{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-brand-stone rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: color }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent donations table */}
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-semibold text-brand-charcoal">Recent Donations</h3>
          <Link to="/donor/donations" className="text-xs text-brand-bronze font-medium hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-stone/50">
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Date</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Amount</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Allocation</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Date Used</th>
            </tr>
          </thead>
          <tbody>
            {recentDonations.map((d, i) => (
              <tr key={i} className="border-b border-brand-border last:border-0 hover:bg-brand-cream transition-colors">
                <td className="px-5 py-3 text-brand-charcoal">{d.date}</td>
                <td className="px-5 py-3 font-semibold text-brand-charcoal">{formatCurrency(d.amount, 'GHS')}</td>
                <td className="px-5 py-3 text-brand-muted">General Programs</td>
                <td className="px-5 py-3 text-brand-muted">{d.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CTA */}
      <div className="text-center py-4">
        <Link
          to="/donate"
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze text-sm"
        >
          <Heart className="w-4 h-4" />
          Make a Donation
        </Link>
      </div>
    </div>
  )
}

function TotalImpact() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, #1C1917 0%, #2C2420 100%)' }}>
        <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-3">Imari: Safe Haven · Ghana</p>
        <h2 className="font-serif text-3xl text-white mb-2">
          Together, we have saved the lives of{' '}
          <span className="text-brand-bronze">327 children</span>
        </h2>
        <p className="text-white/70 text-sm">
          Across the Greater Accra, Ashanti, and Northern regions of Ghana since 2021.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {orgStats.map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="font-bold text-2xl text-white" style={{ color }}>{value}</p>
              <p className="text-white/80 text-xs font-medium mt-0.5">{label}</p>
              <p className="text-white/50 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Org activity chart */}
      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Residents & Donors Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={orgMonthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 12, color: '#78716C' }} />
            <Bar dataKey="residents" name="Residents in Care" fill="#2D8A8A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="donors" name="Active Donors" fill="#92642A" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Program breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        {[
          { label: 'Safe Housing', stat: '89 residents', sub: 'currently in care', color: '#2D8A8A', icon: Home },
          { label: 'Counseling', stat: '1,240 sessions', sub: 'delivered in 2025', color: '#92642A', icon: Heart },
          { label: 'Education', stat: '74% enrolled', sub: 'in formal schooling', color: '#6B8F71', icon: BookOpen },
        ].map(({ label, stat, sub, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-border p-5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <p className="text-xs text-brand-muted font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="font-serif text-2xl text-brand-charcoal">{stat}</p>
            <p className="text-brand-muted text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="text-center py-4">
        <Link
          to="/donate"
          className="inline-flex items-center gap-2 px-8 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze text-sm"
        >
          <Heart className="w-4 h-4" />
          Make a Donation
        </Link>
      </div>
    </div>
  )
}

// ─── Main donor portal layout ─────────────────────────────────────────────────
export default function DonorPortalPage() {
  const [activeNav, setActiveNav] = useState<string>('impact')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  function renderContent() {
    switch (activeNav) {
      case 'impact': return <ImpactView />
      case 'history': return <PaymentHistory />
      case 'payment': return <PaymentMethod />
      case 'settings': return <UserSettings />
      default: return <ImpactView />
    }
  }

  const currentItem = navItems.find((n) => n.key === activeNav)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top bar */}
      <header className="h-14 bg-white border-b border-brand-border flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg">🕊️</span>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-brand-charcoal text-sm tracking-tight">Imari</span>
            <span className="text-[9px] text-brand-muted tracking-widest uppercase">Safe Haven</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Donor portal navigation">
          {(['Home', 'About', 'Learn More'] as const).map((label) => (
            <Link
              key={label}
              to={label === 'Home' ? '/' : `/${label.toLowerCase().replace(' ', '-')}`}
              className="px-4 py-1.5 text-sm text-brand-charcoal hover:text-brand-bronze transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-brand-muted hover:text-brand-charcoal transition-colors">
            Sign out
          </Link>
          {/* Profile avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #92642A, #B8864A)' }}
            title={`${donor.firstName} ${donor.lastName}`}
          >
            {donor.firstName[0]}{donor.lastName[0]}
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside
          className={cn(
            'bg-white border-r border-brand-border flex flex-col shrink-0 transition-all duration-300',
            sidebarCollapsed ? 'w-14' : 'w-56',
          )}
        >
          {/* Collapse toggle + label */}
          <div className={cn(
            'flex items-center border-b border-brand-border py-3',
            sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4',
          )}>
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Donor Menu
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="p-1 rounded text-brand-muted hover:text-brand-charcoal hover:bg-brand-stone transition-colors"
              aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </button>
          </div>

          {/* Nav items */}
          <nav className="flex-1 py-2 px-2 space-y-0.5">
            {navItems.map(({ label, icon: Icon, key }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  sidebarCollapsed && 'justify-center',
                  activeNav === key
                    ? 'bg-brand-bronze-muted text-brand-bronze font-medium'
                    : 'text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal',
                )}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>

          {/* Sign out */}
          <div className="border-t border-brand-border px-2 py-2">
            <Link
              to="/"
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal transition-colors',
                sidebarCollapsed && 'justify-center',
              )}
              title={sidebarCollapsed ? 'Sign out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Sign out</span>}
            </Link>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-auto bg-brand-cream">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {/* Welcome header — shown on impact page */}
            {activeNav === 'impact' && (
              <div className="mb-6">
                <h1 className="font-serif text-3xl text-brand-charcoal">
                  Welcome, {donor.firstName}
                </h1>
                <p className="text-brand-muted mt-1 text-sm">
                  Here is a summary of your impact and giving activity with Imari: Safe Haven.
                </p>
              </div>
            )}

            {/* Section header for other pages */}
            {activeNav !== 'impact' && (
              <div className="mb-6 flex items-center gap-2">
                {currentItem && <currentItem.icon className="w-5 h-5 text-brand-bronze" />}
                <h1 className="font-serif text-2xl text-brand-charcoal">{currentItem?.label}</h1>
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
