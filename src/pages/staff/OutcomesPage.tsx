import { formatPercent } from '@/lib/formatters'

const outcomes = [
  { label: 'Program Completion Rate', value: 94, target: 90, color: 'brand-teal' },
  { label: 'Stable Housing at 6 Months', value: 81, target: 75, color: 'brand-bronze' },
  { label: 'Stable Housing at 12 Months', value: 78, target: 70, color: 'brand-teal' },
  { label: 'Employment / Livelihood at 6 Months', value: 62, target: 60, color: 'brand-bronze' },
  { label: 'No Re-victimization at 12 Months', value: 91, target: 85, color: 'brand-teal' },
  { label: 'Mental Health Improvement (GAD-7)', value: 73, target: 65, color: 'brand-bronze' },
]

export default function OutcomesPage() {
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
                <p className="text-xs text-brand-muted">Target: {formatPercent(o.target, 0)}</p>
              </div>
            </div>
            <div className="h-2 bg-brand-border rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${o.color === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-bronze'}`}
                style={{ width: `${Math.min(o.value, 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-brand-muted">0%</span>
              <span className={`text-xs font-medium ${o.value >= o.target ? 'text-brand-teal' : 'text-amber-600'}`}>
                {o.value >= o.target ? `+${o.value - o.target}pp above target` : `${o.target - o.value}pp below target`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
