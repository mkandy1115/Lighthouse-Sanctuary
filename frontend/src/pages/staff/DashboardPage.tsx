import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { TrendingUp } from 'lucide-react'
import { formatCurrency } from '@/lib/formatters'
import { getSiteMetrics, type SiteMetricsResponse } from '@/lib/siteMetrics'

// ── Today's greeting ─────────────────────────────────────────────────────────
const now = new Date()
const hour = now.getHours()
const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
const dateStr = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })

export default function StaffDashboardPage() {
  const [metrics, setMetrics] = useState<SiteMetricsResponse | null>(null)
  useEffect(() => {
    getSiteMetrics().then(setMetrics).catch(() => {})
  }, [])
  const stats = [
    { label: 'Active Cases', value: String(metrics?.aggregates.activeCases ?? 0) },
    { label: 'Sessions This Week', value: String(metrics?.aggregates.sessionsThisWeek ?? 0) },
    { label: 'Home Visits Due', value: String(metrics?.aggregates.homeVisitsDue ?? 0) },
    { label: 'Funds Raised MTD', value: formatCurrency((metrics?.aggregates.fundsRaisedMtd ?? 0) * 0.018, 'USD') },
  ]
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
        {stats.map(({ label, value }) => (
          <div key={label} className="bg-white border border-brand-border rounded-xl p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-brand-muted mb-2">{label}</p>
            <p className="font-serif text-2xl text-brand-charcoal mb-1">{value}</p>
            <p className="flex items-center gap-1 text-xs font-medium text-brand-teal">
              <TrendingUp className="w-3 h-3" />
              live from database
            </p>
          </div>
        ))}
      </div>
      <div className="bg-white border border-brand-border rounded-xl p-5">
        <p className="text-sm font-semibold text-brand-charcoal mb-2">Quick actions</p>
        <div className="flex flex-wrap gap-3">
          <Link to="/admin/cases" className="text-sm text-brand-bronze hover:underline">Participants</Link>
          <Link to="/admin/counseling" className="text-sm text-brand-bronze hover:underline">Process recordings</Link>
          <Link to="/admin/home-visits" className="text-sm text-brand-bronze hover:underline">Home visits</Link>
          <Link to="/admin/reports" className="text-sm text-brand-bronze hover:underline">Reports</Link>
        </div>
        <p className="text-sm text-brand-muted mt-4">
          Prioritize overdue follow-up work pulled from current home-visit and case activity.
        </p>
      </div>
    </div>
  )
}
