import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, Plus, ArrowRight, ChevronUp, ChevronDown, Filter } from 'lucide-react'
import { mockParticipants } from '@/data/participants'

const riskMeta: Record<string, { bg: string; text: string; label: string; order: number }> = {
  low:      { bg: 'bg-green-50',  text: 'text-green-700',  label: 'Low',      order: 1 },
  medium:   { bg: 'bg-amber-50',  text: 'text-amber-700',  label: 'Medium',   order: 2 },
  high:     { bg: 'bg-orange-50', text: 'text-orange-700', label: 'High',     order: 3 },
  critical: { bg: 'bg-rose-50',   text: 'text-rose-700',   label: 'Critical', order: 4 },
}

const statusMeta: Record<string, { bg: string; text: string }> = {
  intake:        { bg: 'bg-slate-100',         text: 'text-slate-600'   },
  assessment:    { bg: 'bg-blue-50',           text: 'text-blue-700'    },
  active:        { bg: 'bg-brand-teal-muted',  text: 'text-brand-teal'  },
  reintegration: { bg: 'bg-brand-bronze-muted',text: 'text-brand-bronze'},
  aftercare:     { bg: 'bg-green-50',          text: 'text-green-700'   },
  closed:        { bg: 'bg-gray-100',          text: 'text-gray-500'    },
}

const statusTabs = [
  { label: 'All', value: 'all' },
  { label: 'Intake', value: 'intake' },
  { label: 'Assessment', value: 'assessment' },
  { label: 'Active', value: 'active' },
  { label: 'Reintegration', value: 'reintegration' },
  { label: 'Aftercare', value: 'aftercare' },
  { label: 'Closed', value: 'closed' },
]

const riskFilters = [
  { label: 'All Risk', value: 'all' },
  { label: 'Critical', value: 'critical' },
  { label: 'High', value: 'high' },
  { label: 'Medium', value: 'medium' },
  { label: 'Low', value: 'low' },
]

export default function CaseListPage() {
  const [search, setSearch]             = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [riskFilter, setRiskFilter]     = useState('all')
  const [sortField, setSortField]       = useState<'caseNumber' | 'risk' | 'intake'>('intake')
  const [sortDir, setSortDir]           = useState<'asc' | 'desc'>('desc')
  const [newCaseAlert, setNewCaseAlert] = useState(false)

  const filtered = mockParticipants
    .filter((p) => {
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      const matchRisk   = riskFilter === 'all' || p.riskLevel === riskFilter
      const q = search.toLowerCase()
      const matchSearch =
        !q ||
        p.caseNumber.toLowerCase().includes(q) ||
        p.firstName.toLowerCase().includes(q) ||
        p.assignedCaseworkerName.toLowerCase().includes(q) ||
        p.program.some((pr) => pr.toLowerCase().includes(q))
      return matchStatus && matchRisk && matchSearch
    })
    .sort((a, b) => {
      let cmp = 0
      if (sortField === 'caseNumber') cmp = a.caseNumber.localeCompare(b.caseNumber)
      if (sortField === 'intake')     cmp = new Date(a.intakeDate).getTime() - new Date(b.intakeDate).getTime()
      if (sortField === 'risk') {
        cmp = (riskMeta[a.riskLevel]?.order ?? 0) - (riskMeta[b.riskLevel]?.order ?? 0)
      }
      return sortDir === 'asc' ? cmp : -cmp
    })

  function toggleSort(field: typeof sortField) {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortField(field); setSortDir('asc') }
  }

  function SortIcon({ field }: { field: typeof sortField }) {
    if (sortField !== field) return <ChevronUp className="w-3 h-3 text-brand-muted opacity-40" />
    return sortDir === 'asc'
      ? <ChevronUp className="w-3 h-3 text-brand-bronze" />
      : <ChevronDown className="w-3 h-3 text-brand-bronze" />
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Cases</h1>
          <p className="text-brand-muted text-sm mt-1">
            {mockParticipants.length} total · {filtered.length} shown
          </p>
        </div>
        <button
          onClick={() => setNewCaseAlert(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-brand-bronze text-white text-sm font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          New Case
        </button>
      </div>

      {/* New case alert */}
      {newCaseAlert && (
        <div className="mb-4 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium flex items-center justify-between">
          <span>New case creation would open an intake form in the full system.</span>
          <button onClick={() => setNewCaseAlert(false)} className="text-brand-teal/70 hover:text-brand-teal ml-4">✕</button>
        </div>
      )}

      {/* Filters */}
      <div className="space-y-3 mb-6">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-brand-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search case number, name, or program…"
            className="w-full pl-9 pr-4 py-2.5 border border-brand-border rounded-lg text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze placeholder:text-brand-muted-light"
          />
        </div>

        {/* Status tabs + risk filter row */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-brand-stone rounded-lg p-1 gap-0.5 flex-wrap">
            {statusTabs.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setStatusFilter(value)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  statusFilter === value
                    ? 'bg-white text-brand-charcoal shadow-sm'
                    : 'text-brand-muted hover:text-brand-charcoal'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-brand-muted" />
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="text-xs border border-brand-border rounded-lg px-3 py-2 bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30"
            >
              {riskFilters.map(({ label, value }) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-brand-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-stone border-b border-brand-border">
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('caseNumber')}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-muted uppercase tracking-wider"
                >
                  Case <SortIcon field="caseNumber" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Participant
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('risk')}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-muted uppercase tracking-wider"
                >
                  Risk <SortIcon field="risk" />
                </button>
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Status
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider hidden md:table-cell">
                Caseworker
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => toggleSort('intake')}
                  className="flex items-center gap-1 text-xs font-semibold text-brand-muted uppercase tracking-wider"
                >
                  Intake <SortIcon field="intake" />
                </button>
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-border">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-16 text-center">
                  <Search className="w-8 h-8 text-brand-muted mx-auto mb-3 opacity-40" />
                  <p className="text-brand-muted font-medium">No cases match your filters.</p>
                  <p className="text-brand-muted text-xs mt-1">
                    Try adjusting the search or filter criteria.
                  </p>
                  <button
                    onClick={() => { setSearch(''); setStatusFilter('all'); setRiskFilter('all') }}
                    className="mt-4 text-xs text-brand-bronze font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                </td>
              </tr>
            ) : (
              filtered.map((p) => {
                const risk   = riskMeta[p.riskLevel] ?? riskMeta.medium
                const status = statusMeta[p.status]  ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
                return (
                  <tr key={p.id} className="hover:bg-brand-cream transition-colors">
                    <td className="px-4 py-3.5 font-mono text-xs text-brand-muted whitespace-nowrap">
                      {p.caseNumber}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-stone flex items-center justify-center text-xs font-semibold text-brand-charcoal shrink-0">
                          {p.firstName[0]}
                        </div>
                        <div>
                          <p className="font-medium text-brand-charcoal">{p.firstName}</p>
                          <p className="text-xs text-brand-muted">Age {p.age}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${risk.bg} ${risk.text}`}>
                        {risk.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${status.bg} ${status.text}`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 hidden md:table-cell text-sm text-brand-muted">
                      {p.assignedCaseworkerName}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-brand-muted whitespace-nowrap">
                      {new Date(p.intakeDate).toLocaleDateString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3.5">
                      <Link
                        to={`/staff/cases/${p.id}`}
                        className="inline-flex items-center gap-1 text-xs font-medium text-brand-bronze hover:text-brand-charcoal transition-colors"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
