import { useEffect, useState } from 'react'
import { formatPercent } from '@/lib/formatters'
import { getSiteMetrics, type SiteMetricsResponse } from '@/lib/siteMetrics'

export default function OutcomesPage() {
  const [metrics, setMetrics] = useState<SiteMetricsResponse | null>(null)
  useEffect(() => {
    getSiteMetrics().then(setMetrics).catch(() => {})
  }, [])
  const outcomes = [
    { label: 'Program Completion Rate', value: metrics?.aggregates.programCompletionPct ?? 0, color: 'brand-teal' },
    { label: 'Stable Housing Outcome', value: metrics?.aggregates.stableHousingVisitPct ?? 0, color: 'brand-bronze' },
    { label: 'Education Progress', value: metrics?.aggregates.educationProgressPct ?? 0, color: 'brand-teal' },
    { label: 'Attendance Engagement', value: metrics?.aggregates.attendanceEngagementPct ?? 0, color: 'brand-bronze' },
    { label: 'Wellbeing Stability', value: metrics?.aggregates.wellbeingPct ?? 0, color: 'brand-teal' },
    { label: 'Reintegration Success', value: metrics?.aggregates.reintegrationSuccessPct ?? 0, color: 'brand-bronze' },
  ]

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-charcoal">Outcomes Tracking</h1>
        <p className="text-brand-muted text-sm mt-1">Program effectiveness measured against annual targets</p>
      </div>

      <div className="grid md:grid-cols-2 gap-5">
        {outcomes.map((o) => (
          <div key={o.label} className="bg-brand-cream rounded-xl border border-brand-border p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-brand-charcoal">{o.label}</h2>
              <div className="text-right">
                <span className={`text-lg font-semibold ${o.color === 'brand-teal' ? 'text-brand-teal' : 'text-brand-bronze'}`}>
                  {formatPercent(o.value, 0)}
                </span>
                <p className="text-xs text-brand-muted">Current rate from live records</p>
              </div>
            </div>
            <div className="h-2 bg-brand-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${o.color === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-bronze'}`}
                style={{ width: `${Math.min(o.value, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-brand-muted">Rate scale</span>
              <span className="text-xs font-medium text-brand-teal">Query-derived</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
