import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, TrendingDown, Users, Heart, Share2,
  DollarSign, ChevronLeft, LogOut, Globe, UserCog,
  Minus, AlertTriangle, CheckCircle, BarChart2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrency, formatNumber } from '@/lib/formatters'

// ─── Mock data ────────────────────────────────────────────────────────────────
const residentTrend = [
  { month: 'Oct', active: 62, graduated: 4 },
  { month: 'Nov', active: 67, graduated: 3 },
  { month: 'Dec', active: 71, graduated: 5 },
  { month: 'Jan', active: 78, graduated: 4 },
  { month: 'Feb', active: 82, graduated: 6 },
  { month: 'Mar', active: 85, graduated: 5 },
  { month: 'Apr', active: 89, graduated: 7 },
]

const donorTrend = [
  { month: 'Oct', raised: 18000, donors: 38 },
  { month: 'Nov', raised: 21000, donors: 41 },
  { month: 'Dec', raised: 48000, donors: 55 },
  { month: 'Jan', raised: 19500, donors: 48 },
  { month: 'Feb', raised: 22000, donors: 52 },
  { month: 'Mar', raised: 25000, donors: 58 },
  { month: 'Apr', raised: 28000, donors: 62 },
]

const socialData = [
  { platform: 'Instagram', followers: 4820, engagement: 5.4, conversions: 18 },
  { platform: 'Facebook', followers: 8210, engagement: 3.1, conversions: 22 },
  { platform: 'LinkedIn', followers: 2140, engagement: 6.8, conversions: 31 },
  { platform: 'Twitter', followers: 1560, engagement: 2.9, conversions: 8 },
]

const programOutcomeData = [
  { category: 'Safety', achieved: 94, target: 90 },
  { category: 'Education', achieved: 74, target: 80 },
  { category: 'Mental Health', achieved: 88, target: 85 },
  { category: 'Family', achieved: 71, target: 75 },
  { category: 'Livelihood', achieved: 68, target: 70 },
  { category: 'Community', achieved: 93, target: 88 },
]

const riskBreakdown = [
  { name: 'Low', value: 41, color: '#6B8F71' },
  { name: 'Medium', value: 29, color: '#D97706' },
  { name: 'High', value: 14, color: '#EA580C' },
  { name: 'Critical', value: 5, color: '#E11D48' },
]

const recentActivity = [
  { time: '9:14 AM', text: 'Case LH-2024-0042 — counseling session logged' },
  { time: '8:52 AM', text: 'New donor registered — Anonymous (₵5,000)' },
  { time: '8:30 AM', text: 'Home visit completed — Sunrise House' },
  { time: 'Yesterday', text: 'Case conference scheduled — reintegration review' },
]

// ─── OKR configuration ────────────────────────────────────────────────────────
const okrs = [
  {
    key: 'participants',
    label: 'Participants Rescued',
    value: 89,
    target: 100,
    unit: 'residents',
    pct: 89,
    trend: +7,
    trendLabel: 'vs last quarter',
    status: 'on-track' as const,
    icon: Users,
    color: '#2D8A8A',
    bgColor: '#D4EEEE',
  },
  {
    key: 'donors',
    label: 'Active Donors',
    value: 120,
    target: 150,
    unit: 'donors',
    pct: 80,
    trend: +12,
    trendLabel: 'vs last quarter',
    status: 'on-track' as const,
    icon: Heart,
    color: '#92642A',
    bgColor: '#F0E6D3',
  },
  {
    key: 'shelter',
    label: 'Participants Contacted in Shelter',
    value: 35,
    target: 100,
    unit: '%',
    pct: 35,
    trend: -3,
    trendLabel: 'vs last quarter',
    status: 'needs-attention' as const,
    icon: Globe,
    color: '#EA580C',
    bgColor: '#FEF3C7',
  },
]

// ─── Sidebar nav ──────────────────────────────────────────────────────────────
const navItems = [
  { label: 'See Impact', icon: TrendingUp, key: 'impact' },
  { label: 'View Participants', icon: Users, key: 'participants' },
  { label: 'Donors', icon: DollarSign, key: 'donors' },
  { label: 'Manage Users', icon: UserCog, key: 'users' },
  { label: 'Social Media', icon: Share2, key: 'social' },
]

// ─── Sub-views ────────────────────────────────────────────────────────────────
function ParticipantsView() {
  const cases = [
    { case: 'LH-2024-0042', name: 'Amara C.', age: 17, status: 'Active', risk: 'Medium', house: 'Sunrise House', worker: 'M. Santos' },
    { case: 'LH-2024-0038', name: 'Luz M.', age: 15, status: 'Assessment', risk: 'High', house: 'Hope House', worker: 'E. Ramirez' },
    { case: 'LH-2024-0051', name: 'Sofia R.', age: 19, status: 'Reintegration', risk: 'Low', house: 'Sunrise House', worker: 'M. Santos' },
    { case: 'LH-2023-0089', name: 'Maya T.', age: 16, status: 'Active', risk: 'Critical', house: 'Hope House', worker: 'D. Mendoza' },
    { case: 'LH-2024-0003', name: 'Grace B.', age: 18, status: 'Aftercare', risk: 'Low', house: '—', worker: 'M. Santos' },
  ]

  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Active', value: '89', color: '#2D8A8A' },
          { label: 'In Assessment', value: '12', color: '#92642A' },
          { label: 'Reintegration', value: '18', color: '#6B8F71' },
          { label: 'Aftercare', value: '11', color: '#7899C0' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-border p-5">
            <p className="text-xs text-brand-muted uppercase tracking-wider font-medium mb-2">{label}</p>
            <p className="font-serif text-3xl" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border">
          <h3 className="font-semibold text-brand-charcoal">Recent Cases</h3>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-stone/50">
              {['Case #', 'Resident', 'Age', 'Status', 'Risk', 'Safe House', 'Caseworker'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-brand-muted font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cases.map((r) => (
              <tr key={r.case} className="border-b border-brand-border last:border-0 hover:bg-brand-cream transition-colors">
                <td className="px-5 py-3 font-mono text-xs text-brand-bronze">{r.case}</td>
                <td className="px-5 py-3 text-brand-charcoal font-medium">{r.name}</td>
                <td className="px-5 py-3 text-brand-muted">{r.age}</td>
                <td className="px-5 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', {
                    'bg-brand-teal-muted text-brand-teal': r.status === 'Active',
                    'bg-blue-50 text-blue-600': r.status === 'Assessment',
                    'bg-brand-bronze-muted text-brand-bronze': r.status === 'Reintegration',
                    'bg-green-50 text-green-600': r.status === 'Aftercare',
                  })}>{r.status}</span>
                </td>
                <td className="px-5 py-3">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', {
                    'bg-green-50 text-green-600': r.risk === 'Low',
                    'bg-amber-50 text-amber-600': r.risk === 'Medium',
                    'bg-orange-50 text-orange-600': r.risk === 'High',
                    'bg-rose-50 text-rose-600': r.risk === 'Critical',
                  })}>{r.risk}</span>
                </td>
                <td className="px-5 py-3 text-brand-muted text-xs">{r.house}</td>
                <td className="px-5 py-3 text-brand-muted text-xs">{r.worker}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function DonorsView() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Donors', value: '22', color: '#92642A' },
          { label: 'Recurring', value: '12', color: '#2D8A8A' },
          { label: 'At-Risk', value: '4', color: '#EA580C' },
          { label: 'Raised YTD', value: '₵420K', color: '#6B8F71' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-border p-5">
            <p className="text-xs text-brand-muted uppercase tracking-wider font-medium mb-2">{label}</p>
            <p className="font-serif text-3xl" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Fundraising Trend</h3>
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={donorTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="raisedGrad2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#92642A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#92642A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
            <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [formatCurrency(v, 'GHS'), 'Raised']} />
            <Area type="monotone" dataKey="raised" stroke="#92642A" strokeWidth={2} fill="url(#raisedGrad2)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

function UsersView() {
  const staffList = [
    { name: 'Maria Santos', role: 'Case Worker', color: '#2D8A8A', house: 'Sunrise House', login: '2h ago', active: true },
    { name: 'Joshua Reyes', role: 'Counselor', color: '#7899C0', house: 'Sunrise House', login: '3h ago', active: true },
    { name: 'Grace Dela Cruz', role: 'Supervisor', color: '#92642A', house: 'All', login: '1h ago', active: true },
    { name: 'David Mendoza', role: 'Case Worker', color: '#2D8A8A', house: 'Hope House', login: '5h ago', active: true },
    { name: 'Anna Lim', role: 'Donor Relations', color: '#6B8F71', house: '—', login: 'Yesterday', active: true },
    { name: 'Carlos Bautista', role: 'Social Media', color: '#A8A29E', house: '—', login: '2d ago', active: false },
  ]
  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="font-serif text-2xl text-brand-charcoal">Manage Users</h2>
        <button className="px-4 py-2 bg-brand-teal text-white text-sm font-semibold rounded-lg hover:bg-brand-teal-light transition-colors">
          + Invite User
        </button>
      </div>
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-stone/50">
              {['User', 'Role', 'Safe House', 'Last Login', 'Status'].map((h) => (
                <th key={h} className="text-left px-5 py-3 text-brand-muted font-medium text-xs">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {staffList.map((u) => (
              <tr key={u.name} className="border-b border-brand-border last:border-0 hover:bg-brand-cream">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold" style={{ background: u.color }}>
                      {u.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    </div>
                    <span className="text-brand-charcoal font-medium">{u.name}</span>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: `${u.color}20`, color: u.color }}>
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-3.5 text-brand-muted text-xs">{u.house}</td>
                <td className="px-5 py-3.5 text-brand-muted text-xs">{u.login}</td>
                <td className="px-5 py-3.5">
                  <span className={cn('px-2 py-0.5 rounded-full text-xs font-medium', u.active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500')}>
                    {u.active ? 'Active' : 'Inactive'}
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

function SocialView() {
  return (
    <div className="animate-fade-in space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {socialData.map(({ platform, followers, engagement, conversions }) => (
          <div key={platform} className="bg-white rounded-xl border border-brand-border p-5">
            <p className="text-xs text-brand-muted font-medium uppercase tracking-wider mb-2">{platform}</p>
            <p className="font-serif text-2xl text-brand-charcoal">{formatNumber(followers)}</p>
            <p className="text-xs text-brand-muted mt-1">{engagement}% engagement</p>
            <p className="text-xs text-brand-teal mt-0.5">{conversions} conversions</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Platform Comparison</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={socialData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
            <XAxis dataKey="platform" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="followers" name="Followers" fill="#2D8A8A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="conversions" name="Conversions" fill="#92642A" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}

// ─── Main impact / OKR dashboard ─────────────────────────────────────────────
function ImpactDashboard() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* 3 OKR tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {okrs.map((okr) => {
          const Icon = okr.icon
          const isGood = okr.status === 'on-track'
          const TrendIcon = okr.trend > 0 ? TrendingUp : okr.trend < 0 ? TrendingDown : Minus

          return (
            <div key={okr.key} className="bg-white rounded-xl border border-brand-border p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: okr.color }} />
              <div className="flex items-start justify-between mb-4 mt-1">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: okr.bgColor }}>
                  <Icon className="w-5 h-5" style={{ color: okr.color }} />
                </div>
                <span className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full', isGood ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600')}>
                  {isGood ? <CheckCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                  {isGood ? 'On Track' : 'Needs Attention'}
                </span>
              </div>
              <p className="text-xs text-brand-muted font-medium uppercase tracking-wider mb-1">{okr.label}</p>
              <p className="font-serif text-4xl text-brand-charcoal">
                {okr.value}
                <span className="text-base text-brand-muted font-sans ml-1 font-normal">{okr.unit}</span>
              </p>
              <div className="mt-4 mb-2">
                <div className="flex justify-between text-xs text-brand-muted mb-1.5">
                  <span>Progress to goal</span>
                  <span>{okr.pct}% of {okr.target}</span>
                </div>
                <div className="h-2 bg-brand-stone rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${okr.pct}%`, backgroundColor: okr.color }} />
                </div>
              </div>
              <div className="flex items-center gap-1.5 mt-3">
                <TrendIcon className={cn('w-3.5 h-3.5', { 'text-green-500': okr.trend > 0, 'text-red-500': okr.trend < 0, 'text-brand-muted': okr.trend === 0 })} />
                <span className={cn('text-xs font-medium', { 'text-green-600': okr.trend > 0, 'text-red-600': okr.trend < 0, 'text-brand-muted': okr.trend === 0 })}>
                  {okr.trend > 0 ? '+' : ''}{okr.trend} {okr.trendLabel}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* 2 main charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-brand-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-brand-charcoal">Resident Activity</h3>
              <p className="text-xs text-brand-muted mt-0.5">Last 7 months across all safe houses</p>
            </div>
            <BarChart2 className="w-4 h-4 text-brand-muted" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={residentTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D8A8A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2D8A8A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B8F71" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B8F71" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="active" name="Active Residents" stroke="#2D8A8A" strokeWidth={2} fill="url(#activeGrad)" dot={{ r: 3, fill: '#2D8A8A' }} />
              <Area type="monotone" dataKey="graduated" name="Graduated" stroke="#6B8F71" strokeWidth={2} fill="url(#gradGrad)" dot={{ r: 3, fill: '#6B8F71' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl border border-brand-border p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-brand-charcoal">Fundraising Activity</h3>
              <p className="text-xs text-brand-muted mt-0.5">Monthly donations (₵ GHS)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-brand-bronze" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={donorTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v / 1000}k`} />
              <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [formatCurrency(v, 'GHS'), 'Raised']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="raised" name="Amount Raised (₵)" fill="#92642A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="donors" name="Active Donors" fill="#D4EEEE" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Bottom row: program outcomes + risk donut + activity */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border border-brand-border p-6">
          <h3 className="font-semibold text-brand-charcoal mb-1">Program Outcomes vs. Targets</h3>
          <p className="text-xs text-brand-muted mb-4">% of residents meeting success criteria per area</p>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={programOutcomeData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} width={72} />
              <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v}%`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" name="Target" fill="#E5E3DF" radius={[0, 3, 3, 0]} barSize={8} />
              <Bar dataKey="achieved" name="Achieved" fill="#2D8A8A" radius={[0, 3, 3, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-brand-border p-5">
            <h3 className="font-semibold text-brand-charcoal mb-3 text-sm">Case Risk Levels</h3>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={riskBreakdown} cx="50%" cy="50%" innerRadius={36} outerRadius={55} paddingAngle={3} dataKey="value">
                  {riskBreakdown.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} formatter={(v: number) => [`${v} residents`]} />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-1 mt-1">
              {riskBreakdown.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-brand-muted">{name}: <strong className="text-brand-charcoal">{value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-brand-border p-5">
            <h3 className="font-semibold text-brand-charcoal mb-3 text-sm">Recent Activity</h3>
            <ul className="space-y-2.5">
              {recentActivity.map((a, i) => (
                <li key={i} className="flex gap-2 text-xs">
                  <span className="text-brand-muted shrink-0 w-14">{a.time}</span>
                  <span className="text-brand-charcoal leading-relaxed">{a.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Root layout ──────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const [activeNav, setActiveNav] = useState<string>('impact')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const currentItem = navItems.find((n) => n.key === activeNav)

  function renderContent() {
    switch (activeNav) {
      case 'impact': return <ImpactDashboard />
      case 'participants': return <ParticipantsView />
      case 'donors': return <DonorsView />
      case 'users': return <UsersView />
      case 'social': return <SocialView />
      default: return <ImpactDashboard />
    }
  }

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

        <nav className="hidden md:flex items-center gap-1">
          {(['Home', 'About', 'Learn More'] as const).map((label) => (
            <Link key={label} to={label === 'Home' ? '/' : '#'} className="px-4 py-1.5 text-sm text-brand-charcoal hover:text-brand-bronze transition-colors">
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link to="/" className="text-sm text-brand-muted hover:text-brand-charcoal transition-colors">
            Sign out
          </Link>
          {/* Amara's avatar */}
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #2D8A8A, #4AADAD)' }}
            title="Amara Mensah"
          >
            AM
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={cn('bg-white border-r border-brand-border flex flex-col shrink-0 transition-all duration-300', sidebarCollapsed ? 'w-14' : 'w-56')}>
          <div className={cn('flex items-center border-b border-brand-border py-3', sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4')}>
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Admin Menu</span>
            )}
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="p-1 rounded text-brand-muted hover:text-brand-charcoal hover:bg-brand-stone transition-colors"
              aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </button>
          </div>

          <nav className="flex-1 py-2 px-2 space-y-0.5">
            {navItems.map(({ label, icon: Icon, key }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  sidebarCollapsed && 'justify-center',
                  activeNav === key
                    ? 'bg-brand-teal-muted text-brand-teal font-medium'
                    : 'text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal',
                )}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>

          <div className="border-t border-brand-border px-2 py-2">
            <Link
              to="/"
              className={cn('flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal transition-colors', sidebarCollapsed && 'justify-center')}
              title={sidebarCollapsed ? 'Sign out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Sign out</span>}
            </Link>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-auto bg-brand-cream">
          <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="mb-8">
              <p className="text-xs font-semibold text-brand-teal uppercase tracking-widest mb-1">
                {activeNav === 'impact' ? 'Organization Overview' : 'Participant Management'}
              </p>
              <h1 className="font-serif text-3xl text-brand-charcoal">
                {activeNav === 'impact' ? 'Welcome, Amara.' : currentItem?.label}
              </h1>
              {activeNav === 'impact' && (
                <p className="text-brand-muted mt-1 text-sm">
                  Here's how Imari: Safe Haven is performing across its three core objectives today.
                </p>
              )}
            </div>
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  )
}
