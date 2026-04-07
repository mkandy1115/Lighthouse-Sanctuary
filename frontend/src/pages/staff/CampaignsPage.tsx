import { useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, Users, TrendingUp, Plus } from 'lucide-react'

const campaigns = [
  {
    id: '1',
    name: 'Hope Rising 2025',
    goal: 500000,
    raised: 320000,
    startDate: '2025-01-01',
    endDate: '2025-06-30',
    status: 'active',
    donors: 62,
    monthlyData: [
      { month: 'Jan', amount: 42000 },
      { month: 'Feb', amount: 88000 },
      { month: 'Mar', amount: 95000 },
      { month: 'Apr', amount: 72000 },
      { month: 'May', amount: 23000 },
    ],
    description: 'Annual flagship fundraising drive focused on expanding safe home capacity and livelihood training.',
  },
  {
    id: '2',
    name: 'Annual Appeal 2024',
    goal: 1500000,
    raised: 1620000,
    startDate: '2024-10-01',
    endDate: '2024-12-31',
    status: 'completed',
    donors: 142,
    monthlyData: [
      { month: 'Oct', amount: 420000 },
      { month: 'Nov', amount: 580000 },
      { month: 'Dec', amount: 620000 },
    ],
    description: 'Year-end appeal that exceeded its goal, funding 2025 operational budget.',
  },
  {
    id: '3',
    name: 'Livelihood Training Sponsorship',
    goal: 300000,
    raised: 145000,
    startDate: '2025-01-15',
    endDate: '2025-07-30',
    status: 'active',
    donors: 29,
    monthlyData: [
      { month: 'Jan', amount: 45000 },
      { month: 'Feb', amount: 62000 },
      { month: 'Mar', amount: 38000 },
    ],
    description: 'Targeted campaign sponsoring 3 cohorts of the vocational training program.',
  },
]

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2 text-xs">
      <p className="font-semibold text-brand-charcoal mb-0.5">{label}</p>
      <p className="text-brand-bronze">₵{(payload[0].value / 1000).toFixed(0)}k raised</p>
    </div>
  )
}

export default function CampaignsPage() {
  const [expanded, setExpanded] = useState<string | null>('1')
  const [newAlert, setNewAlert] = useState(false)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Campaigns</h1>
          <p className="text-brand-muted text-sm mt-1">Fundraising campaign management and tracking</p>
        </div>
        <button
          onClick={() => setNewAlert(true)}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          New Campaign
        </button>
      </div>

      {newAlert && (
        <div className="mb-4 flex items-center gap-2 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
          Campaign creation would open a setup wizard in the full system.
          <button onClick={() => setNewAlert(false)} className="ml-auto text-brand-teal/70">✕</button>
        </div>
      )}

      <div className="space-y-4">
        {campaigns.map((c) => {
          const pct = Math.min((c.raised / c.goal) * 100, 100)
          const isExpanded = expanded === c.id
          return (
            <div key={c.id} className="bg-white border border-brand-border rounded-xl overflow-hidden">
              {/* Campaign header */}
              <button
                onClick={() => setExpanded(isExpanded ? null : c.id)}
                className="w-full text-left p-5 hover:bg-brand-stone/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h2 className="font-semibold text-brand-charcoal">{c.name}</h2>
                    <p className="text-xs text-brand-muted mt-1">
                      {new Date(c.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      {' – '}
                      {new Date(c.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    c.status === 'active' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Target className="w-4 h-4 text-brand-muted" />
                    <span className="font-serif text-brand-charcoal">₵{(c.raised / 1000).toFixed(0)}k</span>
                    <span className="text-brand-muted text-xs">of ₵{(c.goal / 1000).toFixed(0)}k</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-brand-muted" />
                    <span className="text-brand-muted text-xs">{c.donors} donors</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <TrendingUp className="w-4 h-4 text-brand-muted" />
                    <span className={`text-xs font-semibold ${pct >= 100 ? 'text-brand-teal' : 'text-brand-bronze'}`}>
                      {Math.round(pct)}% funded
                    </span>
                  </div>
                </div>
                {/* Progress bar */}
                <div className="mt-3 h-2 bg-brand-stone rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${pct >= 100 ? 'bg-brand-teal' : 'bg-brand-bronze'}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>

              {/* Expanded detail */}
              {isExpanded && (
                <div className="border-t border-brand-border px-5 pb-5 pt-4">
                  <p className="text-sm text-brand-muted mb-5 leading-relaxed">{c.description}</p>
                  <div className="h-[140px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={c.monthlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barSize={20}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#78716C' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => `₵${(v / 1000).toFixed(0)}k`}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="amount" fill="#92642A" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
