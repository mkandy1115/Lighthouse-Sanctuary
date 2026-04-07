import { formatCurrency, formatDate, formatPercent } from '@/lib/formatters'

const campaigns = [
  {
    id: '1',
    name: 'Emergency Shelter Fund 2025',
    description: 'Provides immediate safe housing for survivors in crisis, including meals, hygiene, and 24/7 support.',
    goal: 500000,
    raised: 320000,
    endDate: '2025-03-31',
    supported: true,
    myContribution: 25000,
  },
  {
    id: '2',
    name: 'Livelihood Training Sponsorship',
    description: 'Fund vocational skills training and job placement programs for survivors transitioning to independence.',
    goal: 300000,
    raised: 145000,
    endDate: '2025-04-30',
    supported: true,
    myContribution: 10000,
  },
  {
    id: '3',
    name: 'Children\'s Wellness Fund',
    description: 'Psychosocial support, educational assistance, and recreational programs for children of survivors.',
    goal: 200000,
    raised: 42000,
    endDate: '2025-06-30',
    supported: false,
    myContribution: 0,
  },
]

export default function CampaignSupportPage() {
  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Campaign Support</h1>
        <p className="text-brand-muted text-sm mt-1">Active campaigns you can contribute to</p>
      </div>

      <div className="space-y-5">
        {campaigns.map((c) => {
          const pct = Math.min((c.raised / c.goal) * 100, 100)
          return (
            <div key={c.id} className="bg-brand-cream rounded-xl border border-brand-border p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h2 className="font-semibold text-brand-charcoal">{c.name}</h2>
                  <p className="text-xs text-brand-muted mt-0.5">Ends {formatDate(c.endDate)}</p>
                </div>
                {c.supported && (
                  <span className="bg-brand-teal-muted text-brand-teal text-xs font-medium px-2.5 py-1 rounded-full">
                    You've contributed {formatCurrency(c.myContribution, 'PHP')}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-muted mb-4 leading-relaxed">{c.description}</p>
              <div className="mb-1.5 flex items-end justify-between">
                <span className="font-serif text-lg text-brand-charcoal">{formatCurrency(c.raised, 'PHP')}</span>
                <span className="text-xs text-brand-muted">of {formatCurrency(c.goal, 'PHP')} · {formatPercent(pct, 0)}</span>
              </div>
              <div className="h-2 bg-brand-border rounded-full overflow-hidden mb-4">
                <div className="h-full bg-brand-bronze rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <button className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
                {c.supported ? 'Donate Again' : 'Support This Campaign'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
