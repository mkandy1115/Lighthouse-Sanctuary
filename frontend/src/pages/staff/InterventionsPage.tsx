import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { formatDate } from '@/lib/formatters'
import {
  createConference,
  deleteConference,
  getConferences,
  getResidents,
  updateConference,
  type ConferenceItem,
  type StaffResidentListItem,
} from '@/lib/staff'
import { ClipboardList } from 'lucide-react'
import { looksUnsafe, sanitizeText } from '@/lib/validation'

export default function InterventionsPage() {
  const [plans, setPlans] = useState<ConferenceItem[]>([])
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingPlanId, setEditingPlanId] = useState<number | null>(null)
  const [form, setForm] = useState({
    residentId: '',
    planCategory: 'Crisis Intervention',
    planDescription: '',
    servicesProvided: '',
    status: 'Scheduled',
    caseConferenceDate: '',
  })

  async function loadPlans() {
    const data = await getConferences({ scheduledOnly: false })
    setPlans(data)
  }

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const [planData, residentData] = await Promise.all([
          getConferences({ scheduledOnly: false }),
          getResidents(),
        ])
        setPlans(planData)
        setResidents(residentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load intervention plans.')
      } finally {
        setIsLoading(false)
      }
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    const list = plans.slice().sort((a, b) => String(b.updatedAt).localeCompare(String(a.updatedAt)))
    if (filter === 'all') return list
    const done = (s: string | null | undefined) => (s ?? '').toLowerCase() === 'completed'
    if (filter === 'completed') return list.filter((p) => done(p.status))
    return list.filter((p) => !done(p.status))
  }, [filter, plans])

  function resetForm() {
    setForm({
      residentId: '',
      planCategory: 'Crisis Intervention',
      planDescription: '',
      servicesProvided: '',
      status: 'Scheduled',
      caseConferenceDate: '',
    })
    setEditingPlanId(null)
  }

  function openCreate() {
    resetForm()
    setIsModalOpen(true)
    setError('')
  }

  function openEdit(p: ConferenceItem) {
    setEditingPlanId(p.planId)
    setForm({
      residentId: String(p.residentId),
      planCategory: p.planCategory ?? 'Crisis Intervention',
      planDescription: p.planDescription ?? '',
      servicesProvided: p.servicesProvided ?? '',
      status: p.status ?? 'Scheduled',
      caseConferenceDate: p.caseConferenceDate ? String(p.caseConferenceDate).slice(0, 10) : '',
    })
    setIsModalOpen(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setError('')
      if (!form.residentId || !form.planDescription.trim()) {
        setError('Resident and plan description are required.')
        return
      }
      if ([form.planCategory, form.planDescription, form.servicesProvided].some(looksUnsafe)) {
        setError('Submitted text contains unsafe input.')
        return
      }
      const caseConferenceDate = form.caseConferenceDate.trim() || null
      const payload = {
        residentId: Number(form.residentId),
        planCategory: sanitizeText(form.planCategory, 64),
        planDescription: sanitizeText(form.planDescription, 1000, true),
        servicesProvided: sanitizeText(form.servicesProvided, 200, true) || null,
        status: sanitizeText(form.status, 24),
        caseConferenceDate,
      }
      if (editingPlanId != null) {
        await updateConference(editingPlanId, {
          planCategory: payload.planCategory,
          planDescription: payload.planDescription,
          servicesProvided: payload.servicesProvided,
          status: payload.status,
          caseConferenceDate: caseConferenceDate ?? undefined,
        })
      } else {
        await createConference(payload)
      }
      setIsModalOpen(false)
      resetForm()
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save intervention plan.')
    }
  }

  async function markCompleted(planId: number) {
    try {
      setError('')
      await updateConference(planId, { status: 'Completed' })
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to update status.')
    }
  }

  async function handleDelete(planId: number) {
    if (!window.confirm('Delete this intervention plan?')) return
    try {
      setError('')
      await deleteConference(planId)
      await loadPlans()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete plan.')
    }
  }

  const control =
    'rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal'

  return (
    <div className="animate-fade-in">
      <Modal
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          resetForm()
        }}
        title={editingPlanId != null ? 'Edit intervention plan' : 'Log intervention plan'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={form.residentId}
            onChange={(e) => setForm((f) => ({ ...f, residentId: e.target.value }))}
            className={`w-full ${control}`}
            required
          >
            <option value="">Select participant</option>
            {residents.map((resident) => (
              <option key={resident.residentId} value={resident.residentId}>
                {resident.caseControlNo} · {resident.internalCode}
              </option>
            ))}
          </select>
          <input
            value={form.planCategory}
            onChange={(e) => setForm((f) => ({ ...f, planCategory: e.target.value }))}
            placeholder="Plan category (e.g. Crisis, Medical, Legal)"
            className={`w-full ${control}`}
          />
          <textarea
            value={form.planDescription}
            onChange={(e) => setForm((f) => ({ ...f, planDescription: e.target.value }))}
            placeholder="Intervention summary and next steps"
            className={`w-full ${control} min-h-24`}
            required
          />
          <textarea
            value={form.servicesProvided}
            onChange={(e) => setForm((f) => ({ ...f, servicesProvided: e.target.value }))}
            placeholder="Services provided (optional)"
            className={`w-full ${control} min-h-20`}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="text-xs text-brand-muted col-span-2">
              Case conference date (optional)
              <input
                type="date"
                value={form.caseConferenceDate}
                onChange={(e) => setForm((f) => ({ ...f, caseConferenceDate: e.target.value }))}
                className={`mt-1 w-full ${control}`}
              />
            </label>
            <select
              value={form.status}
              onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
              className={control}
            >
              <option value="Scheduled">Scheduled</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <button type="submit" className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">
            {editingPlanId != null ? 'Save changes' : 'Save plan'}
          </button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Interventions</h1>
          <p className="text-brand-muted text-sm mt-1">Case intervention and conference plans (same records as Conferences; includes plans without a set conference date)</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          + Log plan
        </button>
      </div>

      <div className="flex bg-brand-stone rounded-lg p-1 mb-5 w-fit gap-0.5">
        {[
          { value: 'all', label: 'All' },
          { value: 'active', label: 'Active' },
          { value: 'completed', label: 'Completed' },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value as 'all' | 'active' | 'completed')}
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
        {!isLoading && filtered.map((p) => (
          <div key={p.planId} className="bg-brand-cream rounded-xl border border-brand-border p-5">
            <div className="flex items-start gap-4">
              <div className="bg-brand-bronze-muted rounded-lg p-2.5 shrink-0">
                <ClipboardList className="w-5 h-5 text-brand-bronze" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-2 gap-3 flex-wrap">
                  <h2 className="font-semibold text-brand-charcoal text-sm">
                    {p.planCategory ?? 'Intervention'} — {p.residentCaseControlNo ?? `Resident ${p.residentId}`}
                  </h2>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      (p.status ?? '').toLowerCase() === 'completed'
                        ? 'bg-brand-teal-muted text-brand-teal'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {p.status ?? 'Scheduled'}
                  </span>
                </div>
                <p className="text-xs text-brand-muted mb-3">
                  {p.caseConferenceDate ? formatDate(p.caseConferenceDate, 'long') : 'No case conference date set'}
                </p>
                <p className="text-sm text-brand-charcoal mb-2">{p.planDescription}</p>
                <p className="text-xs text-brand-muted">
                  Participant: {p.residentInternalCode ?? '—'} | Services: {p.servicesProvided ?? '—'}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  <button type="button" onClick={() => openEdit(p)} className="text-xs font-semibold text-brand-charcoal hover:underline">
                    Edit
                  </button>
                  {(p.status ?? '').toLowerCase() !== 'completed' && (
                    <button type="button" onClick={() => markCompleted(p.planId)} className="text-xs font-semibold text-brand-bronze hover:underline">
                      Mark completed
                    </button>
                  )}
                  <button type="button" onClick={() => handleDelete(p.planId)} className="text-xs font-semibold text-rose-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {!isLoading && filtered.length === 0 && (
          <div className="rounded-xl border border-brand-border bg-white px-6 py-12 text-center text-sm text-brand-muted">
            No intervention plans match this filter.
          </div>
        )}
        {isLoading && <div className="py-10 text-center text-brand-muted">Loading intervention plans…</div>}
      </div>
    </div>
  )
}
