import { Link } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts'
import { AlertTriangle, TrendingUp, ArrowRight, Users, HeartHandshake, Home, FileBarChart } from 'lucide-react'
import { mockParticipants } from '@/data/participants'

// ── Mock chart data ──────────────────────────────────────────────────────────
const residentActivity = [
  { month: 'Oct', intakes: 8, discharges: 5, active: 78 },
  { month: 'Nov', intakes: 11, discharges: 7, active: 82 },
  { month: 'Dec', intakes: 6, discharges: 9, active: 79 },
  { month: 'Jan', intakes: 14, discharges: 6, active: 87 },
  { month: 'Feb', intakes: 10, discharges: 8, active: 89 },
  { month: 'Mar', intakes: 9, discharges: 11, active: 87 },
]

const counselingByWeek = [
  { week: 'W1', individual: 14, group: 8 },
  { week: 'W2', individual: 18, group: 10 },
  { week: 'W3', individual: 12, group: 9 },
  { week: 'W4', individual: 20, group: 11 },
  { week: 'W5', individual: 16, group: 7 },
]

// ── Attention cases ──────────────────────────────────────────────────────────
const attentionCases = mockParticipants
  .filter((p) => p.riskLevel === 'high' || p.riskLevel === 'critical')
  .slice(0, 5)

// ── KPI stats ────────────────────────────────────────────────────────────────
const stats = [
  { label: 'Active Cases', value: '142', delta: '+8 this month', positive: true },
  { label: 'Sessions This Week', value: '38', delta: '+5 vs last week', positive: true },
  { label: 'Home Visits Due', value: '12', delta: '3 overdue', positive: false },
  { label: 'Funds Raised MTD', value: '₵180K', delta: '+12%', positive: true },
]

const riskColors: Record<string, { bg: string; text: string; label: string }> = {
  low: { bg: 'bg-green-50', text: 'text-green-700', label: 'Low' },
  medium: { bg: 'bg-amber-50', text: 'text-amber-700', label: 'Med' },
  high: { bg: 'bg-orange-50', text: 'text-orange-700', label: 'High' },
  critical: { bg: 'bg-rose-50', text: 'text-rose-700', label: 'Critical' },
}

const statusColors: Record<string, { bg: string; text: string }> = {
  intake: { bg: 'bg-slate-100', text: 'text-slate-600' },
  assessment: { bg: 'bg-blue-50', text: 'text-blue-700' },
  active: { bg: 'bg-brand-teal-muted', text: 'text-brand-teal' },
  reintegration: { bg: 'bg-brand-bronze-muted', text: 'text-brand-bronze' },
  aftercare: { bg: 'bg-green-50', text: 'text-green-700' },
  closed: { bg: 'bg-gray-100', text: 'text-gray-500' },
}

// ── Custom tooltip ───────────────────────────────────────────────────────────
function ChartTooltip({ active, payload, label }: {
  active?: boolean
  payload?: { name: string; value: number; color: string }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2 text-xs">
      <p className="font-semibold text-brand-charcoal mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}</p>
      ))}
    </div>
  )
}

// ── Today's greeting ─────────────────────────────────────────────────────────
const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function StaffDashboardPage() {
  return (
    <div className="animate-fade-in space-y-8">
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div>
        <p className="font-serif text-2xl text-brand-charcoal">
          {greeting}, Maria.
        </p>
        <p className="text-brand-muted text-sm mt-1">{dateStr}</p>
      </div>

      {/* ── KPI tiles ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ label, value, delta, positive }) => (
          <div key={label} className="bg-white border border-brand-border rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-muted mb-2">{label}</p>
            <p className="font-serif text-2xl text-brand-charcoal mb-1">{value}</p>
            <p className={`flex items-center gap-1 text-xs font-medium ${positive ? 'text-brand-teal' : 'text-amber-700'}`}>
              <TrendingUp className="w-3 h-3" />
              {delta}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts row ─────────────────────────────────────────────────────── */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Resident Activity */}
        <div className="bg-white border border-brand-border rounded-xl p-5">
          <p className="text-sm font-semibold text-brand-charcoal mb-1">Resident Activity</p>
          <p className="text-xs text-brand-muted mb-5">Monthly intakes, discharges, and active caseload</p>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={residentActivity} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D8A8A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2D8A8A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="intakeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#92642A" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#92642A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="active" name="Active" stroke="#2D8A8A" strokeWidth={2} fill="url(#activeGrad)" dot={{ r: 3, fill: '#2D8A8A' }} />
              <Area type="monotone" dataKey="intakes" name="Intakes" stroke="#92642A" strokeWidth={2} fill="url(#intakeGrad)" dot={{ r: 3, fill: '#92642A' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Counseling Sessions */}
        <div className="bg-white border border-brand-border rounded-xl p-5">
          <p className="text-sm font-semibold text-brand-charcoal mb-1">Counseling Sessions</p>
          <p className="text-xs text-brand-muted mb-5">Individual vs group sessions — last 5 weeks</p>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={counselingByWeek} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={16} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="individual" name="Individual" fill="#2D8A8A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="group" name="Group" fill="#D4EEEE" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── Priority cases + Activity + Quick actions ───────────────────────── */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Cases requiring attention */}
        <div className="lg:col-span-2 bg-white border border-brand-border rounded-xl">
          <div className="flex items-center justify-between px-5 py-4 border-b border-brand-border">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <p className="text-sm font-semibold text-brand-charcoal">Cases Requiring Attention</p>
            </div>
            <Link to="/staff/cases" className="text-xs text-brand-bronze font-medium hover:underline flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          {attentionCases.length === 0 ? (
            <div className="px-5 py-10 text-center text-brand-muted text-sm">
              No high or critical risk cases at this time.
            </div>
          ) : (
            <div className="divide-y divide-brand-border">
              {attentionCases.map((p) => {
                const risk = riskColors[p.riskLevel]
                const status = statusColors[p.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
                return (
                  <Link
                    key={p.id}
                    to={`/staff/cases/${p.id}`}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-brand-cream transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-brand-stone flex items-center justify-center text-xs font-semibold text-brand-charcoal shrink-0">
                      {p.firstName[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-brand-charcoal">
                        {p.firstName} — {p.caseNumber}
                      </p>
                      <p className="text-xs text-brand-muted mt-0.5">
                        {p.assignedCaseworkerName} · Age {p.age}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${risk.bg} ${risk.text}`}>
                        {risk.label}
                      </span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${status.bg} ${status.text} capitalize`}>
                        {p.status}
                      </span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-brand-muted shrink-0" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="flex flex-col gap-4">
          <div className="bg-white border border-brand-border rounded-xl p-5">
            <p className="text-sm font-semibold text-brand-charcoal mb-4">Quick Actions</p>
            <div className="space-y-2">
              {[
                { label: 'Cases', icon: Users, to: '/staff/cases' },
                { label: 'Log Session', icon: HeartHandshake, to: '/staff/counseling' },
                { label: 'Schedule Visit', icon: Home, to: '/staff/home-visits' },
                { label: 'Reports', icon: FileBarChart, to: '/staff/reports' },
              ].map(({ label, icon: Icon, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-brand-border text-sm font-medium text-brand-charcoal hover:bg-brand-stone hover:border-brand-bronze/30 transition-colors"
                >
                  <Icon className="w-4 h-4 text-brand-muted" />
                  {label}
                  <ArrowRight className="w-3.5 h-3.5 text-brand-muted ml-auto" />
                </Link>
              ))}
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide mb-2">Suggested Follow-up</p>
            <p className="text-sm text-amber-900 leading-relaxed">
              3 home visits are overdue. Prioritize scheduling within the next 24 hours.
            </p>
            <Link to="/staff/home-visits" className="inline-flex items-center gap-1 mt-3 text-xs font-semibold text-amber-800 hover:text-amber-900">
              Review home visits <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
