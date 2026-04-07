import { useState } from 'react'
import { MapPin, Plus, Check, AlertTriangle, Clock } from 'lucide-react'

const visits = [
  { id: '1', caseId: 'LH-2024-0042', firstName: 'Amara', scheduledDate: '2025-04-22', completedDate: null, staffName: 'Ana Reyes', status: 'scheduled', notes: '' },
  { id: '2', caseId: 'LH-2024-0031', firstName: 'Akua', scheduledDate: '2025-04-10', completedDate: '2025-04-10', staffName: 'Kofi Asante', status: 'completed', notes: 'Client settled well, employment is stable. No safety concerns observed.' },
  { id: '3', caseId: 'LH-2024-0019', firstName: 'Nana', scheduledDate: '2025-04-08', completedDate: null, staffName: 'Ana Reyes', status: 'overdue', notes: '' },
  { id: '4', caseId: 'LH-2024-0026', firstName: 'Serwa', scheduledDate: '2025-03-28', completedDate: '2025-03-28', staffName: 'Abena Owusu', status: 'completed', notes: 'Housing secure. Savings group participation confirmed.' },
  { id: '5', caseId: 'LH-2024-0051', firstName: 'Adwoa', scheduledDate: '2025-04-25', completedDate: null, staffName: 'Kofi Asante', status: 'scheduled', notes: '' },
]

const statusMeta: Record<string, { bg: string; text: string; icon: React.ComponentType<{ className?: string }>; label: string }> = {
  scheduled: { bg: 'bg-amber-50',  text: 'text-amber-700',  icon: Clock,          label: 'Scheduled' },
  completed: { bg: 'bg-brand-teal-muted', text: 'text-brand-teal', icon: Check, label: 'Completed' },
  overdue:   { bg: 'bg-rose-50',   text: 'text-rose-700',   icon: AlertTriangle,  label: 'Overdue'   },
}

export default function HomeVisitsPage() {
  const [filter, setFilter] = useState('all')
  const [newAlert, setNewAlert] = useState(false)

  const filtered = filter === 'all' ? visits : visits.filter((v) => v.status === filter)
  const overdueCnt = visits.filter((v) => v.status === 'overdue').length

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Home Visits</h1>
          <p className="text-brand-muted text-sm mt-1">
            Welfare checks and follow-up visits for transitioned clients
          </p>
        </div>
        <button
          onClick={() => setNewAlert(true)}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          Schedule Visit
        </button>
      </div>

      {newAlert && (
        <div className="mb-4 flex items-center gap-2 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
          Visit scheduling would open an assignment form in the full system.
          <button onClick={() => setNewAlert(false)} className="ml-auto text-brand-teal/70">✕</button>
        </div>
      )}

      {overdueCnt > 0 && (
        <div className="mb-5 flex items-center gap-3 bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <p className="text-sm text-rose-800">
            <span className="font-semibold">{overdueCnt} visit{overdueCnt > 1 ? 's' : ''} overdue.</span>{' '}
            Prioritize scheduling to keep aftercare plans on track.
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex bg-brand-stone rounded-lg p-1 mb-5 w-fit gap-0.5">
        {['all', 'scheduled', 'overdue', 'completed'].map((v) => (
          <button
            key={v}
            onClick={() => setFilter(v)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
              filter === v
                ? 'bg-white text-brand-charcoal shadow-sm'
                : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-stone border-b border-brand-border">
              {['Case', 'Participant', 'Scheduled', 'Staff', 'Status', 'Notes'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.map((v) => {
              const meta = statusMeta[v.status]
              const Icon = meta.icon
              return (
                <tr key={v.id} className="hover:bg-brand-cream transition-colors">
                  <td className="px-4 py-3.5 font-mono text-xs text-brand-muted">{v.caseId}</td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-brand-stone flex items-center justify-center text-xs font-semibold text-brand-charcoal">
                        {v.firstName[0]}
                      </div>
                      <span className="font-medium text-brand-charcoal">{v.firstName}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-brand-muted text-xs">
                    {new Date(v.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3.5 text-brand-muted text-sm">{v.staffName}</td>
                  <td className="px-4 py-3.5">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full ${meta.bg} ${meta.text}`}>
                      <Icon className="w-3 h-3" />
                      {meta.label}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-brand-muted italic max-w-xs truncate">
                    {v.notes || '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
