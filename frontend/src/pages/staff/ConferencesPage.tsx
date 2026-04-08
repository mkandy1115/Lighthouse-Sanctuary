import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/formatters'
import {
  createConference,
  getConferences,
  getResidents,
  updateConference,
  type ConferenceItem,
  type StaffResidentListItem,
} from '@/lib/staff'
import { Calendar } from 'lucide-react'

export default function ConferencesPage() {
  const [conferences, setConferences] = useState<ConferenceItem[]>([])
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    residentId: '',
    planCategory: 'Reintegration',
    planDescription: '',
    servicesProvided: '',
    status: 'Scheduled',
    caseConferenceDate: new Date().toISOString().slice(0, 10),
  })

  async function loadConferences() {
    const query = filter === 'all'
      ? undefined
      : filter === 'upcoming'
        ? { upcoming: true }
        : { status: 'Completed' }
    const data = await getConferences(query)
    setConferences(data)
  }

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const [conferenceData, residentData] = await Promise.all([
          getConferences(),
          getResidents(),
        ])
        setConferences(conferenceData)
        setResidents(residentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load conferences.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    if (isLoading) return
    loadConferences().catch((err) => {
      setError(err instanceof Error ? err.message : 'Unable to filter conferences.')
    })
  }, [filter]) // eslint-disable-line react-hooks/exhaustive-deps

  const grouped = useMemo(() => {
    return conferences
      .slice()
      .sort((a, b) => String(a.caseConferenceDate ?? '').localeCompare(String(b.caseConferenceDate ?? '')))
  }, [conferences])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      await createConference({
        residentId: Number(form.residentId),
        planCategory: form.planCategory,
        planDescription: form.planDescription,
        servicesProvided: form.servicesProvided || null,
        status: form.status,
        caseConferenceDate: form.caseConferenceDate,
      })
      setIsModalOpen(false)
      await loadConferences()
      setForm({
        residentId: '',
        planCategory: 'Reintegration',
        planDescription: '',
        servicesProvided: '',
        status: 'Scheduled',
        caseConferenceDate: new Date().toISOString().slice(0, 10),
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create conference.')
    }
  }

  async function markCompleted(planId: number) {
    try {
      await updateConference(planId, { status: 'Completed' })
      await loadConferences()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update conference status.')
    }
  }

  return (
    <div className="animate-fade-in">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Schedule Conference">
        <form onSubmit={handleCreate} className="space-y-4">
          <select
            value={form.residentId}
            onChange={(e) => setForm((f) => ({ ...f, residentId: e.target.value }))}
            className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm"
            required
          >
            <option value="">Select resident</option>
            {residents.map((resident) => (
              <option key={resident.residentId} value={resident.residentId}>
                {resident.caseControlNo} · {resident.internalCode}
              </option>
            ))}
          </select>
          <input
            value={form.planCategory}
            onChange={(e) => setForm((f) => ({ ...f, planCategory: e.target.value }))}
            placeholder="Plan category"
            className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm"
          />
          <textarea
            value={form.planDescription}
            onChange={(e) => setForm((f) => ({ ...f, planDescription: e.target.value }))}
            placeholder="Conference purpose and plan"
            className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-24"
            required
          />
          <textarea
            value={form.servicesProvided}
            onChange={(e) => setForm((f) => ({ ...f, servicesProvided: e.target.value }))}
            placeholder="Services provided"
            className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-20"
          />
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.caseConferenceDate}
              onChange={(e) => setForm((f) => ({ ...f, caseConferenceDate: e.target.value }))}
              className="rounded-lg border border-brand-border px-4 py-3 text-sm"
              required
            />
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className="rounded-lg border border-brand-border px-4 py-3 text-sm"
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">
            Save Conference
          </button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Conferences</h1>
          <p className="text-brand-muted text-sm mt-1">Case conferences and multi-agency coordination meetings</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          + Schedule Conference
        </button>
      </div>

      <div className="flex bg-brand-stone rounded-lg p-1 mb-5 w-fit gap-0.5">
        {[
          { value: 'all', label: 'All' },
          { value: 'upcoming', label: 'Upcoming' },
          { value: 'completed', label: 'Completed' },
        ].map((item) => (
          <button
            key={item.value}
            onClick={() => setFilter(item.value as 'all' | 'upcoming' | 'completed')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
              filter === item.value ? 'bg-white text-brand-charcoal shadow-sm' : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="space-y-4">
        {!isLoading && grouped.map((c) => (
          <div key={c.planId} className="bg-brand-cream rounded-xl border border-brand-border p-5">
            <div className="flex items-start gap-4">
              <div className="bg-brand-bronze-muted rounded-lg p-2.5 shrink-0">
                <Calendar className="w-5 h-5 text-brand-bronze" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2 gap-3">
                  <h2 className="font-semibold text-brand-charcoal text-sm">
                    {c.planCategory ?? 'Case Conference'} - {c.residentCaseControlNo ?? `Resident ${c.residentId}`}
                  </h2>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    (c.status ?? '').toLowerCase() === 'completed' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.status ?? 'Scheduled'}
                  </span>
                </div>
                <p className="text-xs text-brand-muted mb-3">
                  {c.caseConferenceDate ? formatDate(c.caseConferenceDate, 'long') : 'Date TBD'}
                </p>
                <p className="text-sm text-brand-charcoal mb-2">{c.planDescription}</p>
                <p className="text-xs text-brand-muted">
                  Resident: {c.residentInternalCode ?? '—'} | Services: {c.servicesProvided ?? '—'}
                </p>
                {(c.status ?? '').toLowerCase() !== 'completed' && (
                  <button
                    onClick={() => markCompleted(c.planId)}
                    className="mt-3 text-xs font-semibold text-brand-bronze hover:underline"
                  >
                    Mark completed
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {isLoading && <div className="py-10 text-center text-brand-muted">Loading conferences…</div>}
      </div>
    </div>
  )
}
