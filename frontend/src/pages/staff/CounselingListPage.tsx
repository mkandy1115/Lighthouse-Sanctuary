import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ArrowRight } from 'lucide-react'

const sessions = [
  { id: '1', caseId: 'LH-2024-0042', firstName: 'Amara', counselor: 'Dr. Abena Owusu', sessionNum: 8, total: 12, date: '2025-03-15', type: 'Individual', status: 'completed', focus: 'Empowerment & Future Planning' },
  { id: '2', caseId: 'LH-2024-0038', firstName: 'Esi', counselor: 'Dr. Kwame Boateng', sessionNum: 3, total: 12, date: '2025-03-18', type: 'Group', status: 'scheduled', focus: 'Peer Connection & Safety' },
  { id: '3', caseId: 'LH-2024-0031', firstName: 'Akua', counselor: 'Dr. Abena Owusu', sessionNum: 10, total: 12, date: '2025-03-14', type: 'Individual', status: 'completed', focus: 'Reintegration Readiness' },
  { id: '4', caseId: 'LH-2024-0026', firstName: 'Serwa', counselor: 'Dr. Yaa Mensah', sessionNum: 12, total: 12, date: '2025-02-28', type: 'Individual', status: 'completed', focus: 'Program Completion Review' },
  { id: '5', caseId: 'LH-2024-0019', firstName: 'Nana', counselor: 'Dr. Kwame Boateng', sessionNum: 6, total: 12, date: '2025-03-22', type: 'Group', status: 'scheduled', focus: 'Trauma Processing' },
  { id: '6', caseId: 'LH-2024-0051', firstName: 'Adwoa', counselor: 'Dr. Yaa Mensah', sessionNum: 2, total: 12, date: '2025-03-20', type: 'Individual', status: 'scheduled', focus: 'Initial Assessment' },
]

const statusMeta: Record<string, { bg: string; text: string }> = {
  completed: { bg: 'bg-brand-teal-muted',    text: 'text-brand-teal'  },
  scheduled:  { bg: 'bg-amber-50',            text: 'text-amber-700'   },
  cancelled:  { bg: 'bg-rose-50',             text: 'text-rose-700'    },
}

const typeMeta: Record<string, { bg: string; text: string }> = {
  Individual: { bg: 'bg-blue-50',    text: 'text-blue-700'   },
  Group:      { bg: 'bg-purple-50',  text: 'text-purple-700' },
}

export default function CounselingListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [newAlert, setNewAlert] = useState(false)

  const filtered = sessions.filter((s) => {
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch = !q ||
      s.caseId.toLowerCase().includes(q) ||
      s.counselor.toLowerCase().includes(q) ||
      s.firstName.toLowerCase().includes(q) ||
      s.focus.toLowerCase().includes(q)
    return matchStatus && matchSearch
  })

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Counseling Sessions</h1>
          <p className="text-brand-muted text-sm mt-1">Track all therapy and counseling engagements</p>
        </div>
        <button
          onClick={() => setNewAlert(true)}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          Log Session
        </button>
      </div>

      {newAlert && (
        <div className="mb-4 flex items-center gap-2 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
          Session logging would open an intake form in the full system.
          <button onClick={() => setNewAlert(false)} className="ml-auto text-brand-teal/70">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6 flex-wrap">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search counselor, case, or focus…"
            className="pl-9 pr-4 py-2.5 w-64 border border-brand-border rounded-lg text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light"
          />
        </div>
        <div className="flex bg-brand-stone rounded-lg p-1 gap-0.5">
          {['all', 'completed', 'scheduled'].map((v) => (
            <button
              key={v}
              onClick={() => setStatusFilter(v)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                statusFilter === v
                  ? 'bg-white text-brand-charcoal shadow-sm'
                  : 'text-brand-muted hover:text-brand-charcoal'
              }`}
            >
              {v === 'all' ? 'All' : v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-brand-muted">
          <Search className="w-8 h-8 mx-auto mb-3 opacity-40" />
          <p className="font-medium">No sessions match your filters.</p>
          <button
            onClick={() => { setSearch(''); setStatusFilter('all') }}
            className="mt-3 text-xs text-brand-bronze font-medium hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((s) => {
            const status = statusMeta[s.status] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
            const type   = typeMeta[s.type]    ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
            const pct    = Math.round((s.sessionNum / s.total) * 100)
            return (
              <div key={s.id} className="bg-white border border-brand-border rounded-xl p-5 flex flex-col">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-brand-charcoal text-sm">{s.firstName}</p>
                    <p className="font-mono text-xs text-brand-muted mt-0.5">{s.caseId}</p>
                  </div>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${status.bg} ${status.text}`}>
                    {s.status}
                  </span>
                </div>

                {/* Focus area — masked pattern */}
                <div className="bg-brand-stone rounded-lg px-3 py-2 mb-3 text-xs text-brand-muted italic select-none">
                  {s.status === 'completed' ? s.focus : '• • • • • • (session notes — click to reveal)'}
                </div>

                {/* Progress */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-brand-muted">Session progress</span>
                    <span className="font-semibold text-brand-charcoal">{s.sessionNum} / {s.total}</span>
                  </div>
                  <div className="h-1.5 bg-brand-stone rounded-full overflow-hidden">
                    <div className="h-full bg-brand-teal rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>

                {/* Meta row */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${type.bg} ${type.text}`}>
                    {s.type}
                  </span>
                  <span className="text-xs text-brand-muted">
                    {new Date(s.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                  <span className="text-xs text-brand-muted ml-auto">{s.counselor.split(' ').slice(-1)}</span>
                </div>

                <Link
                  to={`/staff/counseling/${s.id}`}
                  className="mt-auto inline-flex items-center gap-1 text-xs font-medium text-brand-bronze hover:text-brand-charcoal transition-colors"
                >
                  View session <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
