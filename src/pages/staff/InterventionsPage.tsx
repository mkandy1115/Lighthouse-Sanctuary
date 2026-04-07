import { useState } from 'react'
import { AlertTriangle, Plus } from 'lucide-react'

const interventions = [
  {
    id: '1',
    caseId: 'LH-2024-0042',
    firstName: 'Amara',
    type: 'Crisis Intervention',
    date: '2024-11-15',
    outcome: 'Situation de-escalated, new safety plan created and reviewed with resident.',
    staffLead: 'Ana Reyes',
    followUpRequired: true,
    status: 'active',
  },
  {
    id: '2',
    caseId: 'LH-2024-0031',
    firstName: 'Akua',
    type: 'Medical Referral',
    date: '2024-12-03',
    outcome: 'Referred to Korle-Bu Teaching Hospital partner clinic. Appointment confirmed for Dec 7.',
    staffLead: 'Kofi Asante',
    followUpRequired: false,
    status: 'completed',
  },
  {
    id: '3',
    caseId: 'LH-2024-0019',
    firstName: 'Nana',
    type: 'Legal Intervention',
    date: '2024-12-10',
    outcome: 'Police report filed with Accra Central Police. Case reference number obtained.',
    staffLead: 'Abena Owusu',
    followUpRequired: true,
    status: 'active',
  },
  {
    id: '4',
    caseId: 'LH-2024-0026',
    firstName: 'Serwa',
    type: 'Economic Intervention',
    date: '2025-01-05',
    outcome: 'Livelihood starter kit released. Enrolled in January vocational training cohort.',
    staffLead: 'Ana Reyes',
    followUpRequired: false,
    status: 'completed',
  },
  {
    id: '5',
    caseId: 'LH-2024-0051',
    firstName: 'Adwoa',
    type: 'Family Tracing',
    date: '2025-03-18',
    outcome: 'Contact established with maternal aunt in Kumasi. Consent for family visit in progress.',
    staffLead: 'Kofi Asante',
    followUpRequired: true,
    status: 'active',
  },
]

const typeMeta: Record<string, { bg: string; text: string }> = {
  'Crisis Intervention': { bg: 'bg-rose-50',   text: 'text-rose-700'   },
  'Medical Referral':   { bg: 'bg-blue-50',    text: 'text-blue-700'   },
  'Legal Intervention': { bg: 'bg-purple-50',  text: 'text-purple-700' },
  'Economic Intervention': { bg: 'bg-brand-bronze-muted', text: 'text-brand-bronze' },
  'Family Tracing':     { bg: 'bg-brand-teal-muted', text: 'text-brand-teal' },
}

export default function InterventionsPage() {
  const [filter, setFilter] = useState('all')
  const [newAlert, setNewAlert] = useState(false)

  const filtered = filter === 'all' ? interventions : interventions.filter((i) => i.status === filter)

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Interventions</h1>
          <p className="text-brand-muted text-sm mt-1">
            Crisis, legal, medical, and economic interventions
          </p>
        </div>
        <button
          onClick={() => setNewAlert(true)}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          Log Intervention
        </button>
      </div>

      {newAlert && (
        <div className="mb-4 flex items-center gap-2 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
          Intervention logging would open a case form in the full system.
          <button onClick={() => setNewAlert(false)} className="ml-auto text-brand-teal/70">✕</button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-brand-stone rounded-lg p-1 mb-5 w-fit gap-0.5">
        {['all', 'active', 'completed'].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              filter === v
                ? 'bg-white text-brand-charcoal shadow-sm'
                : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map((i) => {
          const type = typeMeta[i.type] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
          return (
            <div key={i.id} className="bg-white border border-brand-border rounded-xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-brand-stone flex items-center justify-center text-xs font-semibold text-brand-charcoal shrink-0 mt-0.5">
                    {i.firstName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-brand-muted">{i.caseId}</span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${type.bg} ${type.text}`}>
                        {i.type}
                      </span>
                    </div>
                    <p className="text-xs text-brand-muted">
                      {new Date(i.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                      {' · '}{i.staffLead}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {i.followUpRequired && (
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 text-xs font-medium px-2.5 py-1 rounded-full">
                      <AlertTriangle className="w-3 h-3" />
                      Follow-up Required
                    </span>
                  )}
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    i.status === 'completed'
                      ? 'bg-brand-teal-muted text-brand-teal'
                      : 'bg-orange-50 text-orange-700'
                  }`}>
                    {i.status}
                  </span>
                </div>
              </div>
              <p className="text-sm text-brand-muted leading-relaxed pl-11">{i.outcome}</p>
            </div>
          )
        })}
      </div>
    </div>
  )
}
