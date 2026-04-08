import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { createHomeVisitation, getHomeVisitations, getResidents, type HomeVisitationItem, type StaffResidentListItem } from '@/lib/staff'
import { formatDate } from '@/lib/formatters'
import { looksUnsafe, sanitizeText } from '@/lib/validation'

export default function HomeVisitsPage() {
  const [visits, setVisits] = useState<HomeVisitationItem[]>([])
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    residentId: '',
    visitDate: new Date().toISOString().slice(0, 10),
    socialWorker: '',
    visitType: 'Routine Follow-Up',
    locationVisited: '',
    purpose: '',
    observations: '',
    familyCooperationLevel: 'Cooperative',
    followUpNotes: '',
    visitOutcome: 'Favorable',
  })

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const [visitData, residentData] = await Promise.all([getHomeVisitations(), getResidents()])
        setVisits(visitData)
        setResidents(residentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load home visits.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (filter === 'all') return visits
    return visits.filter((visit) => (visit.followUpNeeded ? 'needs-follow-up' : 'completed') === filter)
  }, [filter, visits])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    if (!form.residentId || !form.visitDate) {
      setError('Resident and visit date are required.')
      return
    }
    if ([form.socialWorker, form.locationVisited, form.observations, form.followUpNotes].some(looksUnsafe)) {
      setError('Submitted text contains unsafe input.')
      return
    }
    const created = await createHomeVisitation({
      residentId: Number(form.residentId),
      visitDate: form.visitDate,
      socialWorker: sanitizeText(form.socialWorker, 120),
      visitType: sanitizeText(form.visitType, 64),
      locationVisited: sanitizeText(form.locationVisited, 240),
      purpose: sanitizeText(form.purpose, 500),
      observations: sanitizeText(form.observations, 4000, true),
      familyCooperationLevel: sanitizeText(form.familyCooperationLevel, 40),
      safetyConcernsNoted: false,
      followUpNeeded: Boolean(form.followUpNotes),
      followUpNotes: sanitizeText(form.followUpNotes, 2000, true),
      visitOutcome: sanitizeText(form.visitOutcome, 40),
    })
    setVisits((current) => [created, ...current])
    setIsModalOpen(false)
  }

  return (
    <div className="animate-fade-in">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Home Visitation">
        <form onSubmit={handleCreate} className="space-y-4">
          <select value={form.residentId} onChange={(e) => setForm((f) => ({ ...f, residentId: e.target.value }))} className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm">
            <option value="">Select resident</option>
            {residents.map((resident) => (
              <option key={resident.residentId} value={resident.residentId}>
                {resident.caseControlNo} · {resident.internalCode}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input type="date" value={form.visitDate} onChange={(e) => setForm((f) => ({ ...f, visitDate: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
            <input value={form.socialWorker} onChange={(e) => setForm((f) => ({ ...f, socialWorker: e.target.value }))} placeholder="Social worker" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <input value={form.locationVisited} onChange={(e) => setForm((f) => ({ ...f, locationVisited: e.target.value }))} placeholder="Location visited" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm" />
          <textarea value={form.observations} onChange={(e) => setForm((f) => ({ ...f, observations: e.target.value }))} placeholder="Observations" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-24" />
          <textarea value={form.followUpNotes} onChange={(e) => setForm((f) => ({ ...f, followUpNotes: e.target.value }))} placeholder="Follow-up notes" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-24" />
          <button className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">Save Home Visit</button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Home Visitation & Follow-Up</h1>
          <p className="text-brand-muted text-sm mt-1">Field visits, reintegration checks, and family observations</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
          + Log Visit
        </button>
      </div>

      <div className="flex bg-brand-stone rounded-lg p-1 mb-5 w-fit gap-0.5">
        {[
          { value: 'all', label: 'All' },
          { value: 'completed', label: 'Completed' },
          { value: 'needs-follow-up', label: 'Needs Follow-up' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value)}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === item.value ? 'bg-white text-brand-charcoal shadow-sm' : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="bg-white border border-brand-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-brand-stone border-b border-brand-border">
              {['Case', 'Visit Date', 'Type', 'Social Worker', 'Outcome', 'Follow-up'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!isLoading && filtered.map((visit) => (
              <tr key={visit.visitationId} className="hover:bg-brand-cream transition-colors border-b border-brand-border">
                <td className="px-4 py-3.5 font-mono text-xs text-brand-muted">{visit.residentCaseControlNo ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-muted">{formatDate(visit.visitDate)}</td>
                <td className="px-4 py-3.5 text-brand-charcoal">{visit.visitType ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-muted">{visit.socialWorker ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-charcoal">{visit.visitOutcome ?? '—'}</td>
                <td className="px-4 py-3.5 text-brand-muted">{visit.followUpNeeded ? visit.followUpNotes ?? 'Yes' : 'None'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {isLoading && <div className="px-4 py-10 text-center text-brand-muted">Loading home visitations…</div>}
      </div>
    </div>
  )
}
