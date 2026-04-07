import { formatPercent } from '@/lib/formatters'

const impactMetrics = [
  { label: 'Counseling Sessions Funded', value: 17, unit: 'sessions', color: 'brand-teal' },
  { label: 'Families in Emergency Shelter', value: 2, unit: 'families', color: 'brand-bronze' },
  { label: 'Livelihood Trainees Sponsored', value: 4, unit: 'survivors', color: 'brand-teal' },
  { label: 'Home Visits Supported', value: 8, unit: 'visits', color: 'brand-bronze' },
]

const outcomes = [
  { label: 'Program Completion', value: 94 },
  { label: 'Stable Housing at 12 Months', value: 78 },
  { label: 'Economic Stability', value: 62 },
]

export default function DonorImpactPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="font-serif text-3xl text-brand-charcoal">Your Impact</h1>
        <p className="text-brand-muted text-sm mt-1">See exactly how your generosity is changing lives</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {impactMetrics.map((m) => (
          <div key={m.label} className="bg-brand-cream rounded-xl border border-brand-border p-5 text-center">
            <p className={`font-serif text-3xl mb-1 ${m.color === 'brand-teal' ? 'text-brand-teal' : 'text-brand-bronze'}`}>
              {m.value}
            </p>
            <p className="text-xs text-brand-muted font-medium">{m.unit}</p>
            <p className="text-xs text-brand-charcoal mt-1 leading-snug">{m.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border p-6 mb-6">
        <h2 className="font-semibold text-brand-charcoal mb-5">Program Outcomes (All Donors, 2024)</h2>
        <div className="space-y-4">
          {outcomes.map((o) => (
            <div key={o.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-brand-charcoal">{o.label}</span>
                <span className="font-semibold text-brand-charcoal">{formatPercent(o.value, 0)}</span>
              </div>
              <div className="h-2 bg-brand-border rounded-full overflow-hidden">
                <div className="h-full bg-brand-teal rounded-full" style={{ width: `${o.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-brand-teal-muted border border-brand-teal/20 rounded-xl p-6">
        <h2 className="font-serif text-xl text-brand-charcoal mb-3">A Note of Gratitude</h2>
        <p className="text-brand-muted leading-relaxed text-sm">
          "Because of donors like you, I was able to leave a dangerous situation and build a new life.
          The counseling and livelihood training changed everything for me and my children."
        </p>
        <p className="text-brand-teal text-xs font-medium mt-3">— Survivor, Program Cohort 2024 (name withheld)</p>
      </div>
    </div>
  )
}
