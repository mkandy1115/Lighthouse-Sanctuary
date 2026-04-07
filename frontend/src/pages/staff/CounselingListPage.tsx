import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import { createProcessRecording, getProcessRecordings, getResidents, type ProcessRecordingItem, type StaffResidentListItem } from '@/lib/staff'
import { formatDate } from '@/lib/formatters'

export default function CounselingListPage() {
  const [recordings, setRecordings] = useState<ProcessRecordingItem[]>([])
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    residentId: '',
    sessionDate: new Date().toISOString().slice(0, 10),
    socialWorker: '',
    sessionType: 'Individual',
    emotionalStateObserved: 'Calm',
    emotionalStateEnd: 'Hopeful',
    sessionNarrative: '',
    interventionsApplied: '',
    followUpActions: '',
  })

  useEffect(() => {
    async function load() {
      try {
        setIsLoading(true)
        const [recordingData, residentData] = await Promise.all([getProcessRecordings(), getResidents()])
        setRecordings(recordingData)
        setResidents(residentData)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load process recordings.')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return recordings
    return recordings.filter((record) =>
      (record.residentCaseControlNo ?? '').toLowerCase().includes(q)
      || (record.socialWorker ?? '').toLowerCase().includes(q)
      || (record.sessionNarrative ?? '').toLowerCase().includes(q))
  }, [recordings, search])

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const created = await createProcessRecording({
      residentId: Number(form.residentId),
      sessionDate: form.sessionDate,
      socialWorker: form.socialWorker,
      sessionType: form.sessionType,
      emotionalStateObserved: form.emotionalStateObserved,
      emotionalStateEnd: form.emotionalStateEnd,
      sessionNarrative: form.sessionNarrative,
      interventionsApplied: form.interventionsApplied,
      followUpActions: form.followUpActions,
      progressNoted: true,
      concernsFlagged: false,
      referralMade: false,
    })

    setRecordings((current) => [created, ...current])
    setIsModalOpen(false)
  }

  return (
    <div className="animate-fade-in">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Process Recording">
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
            <input type="date" value={form.sessionDate} onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
            <input value={form.socialWorker} onChange={(e) => setForm((f) => ({ ...f, socialWorker: e.target.value }))} placeholder="Social worker" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <textarea value={form.sessionNarrative} onChange={(e) => setForm((f) => ({ ...f, sessionNarrative: e.target.value }))} placeholder="Narrative summary" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-28" />
          <textarea value={form.interventionsApplied} onChange={(e) => setForm((f) => ({ ...f, interventionsApplied: e.target.value }))} placeholder="Interventions applied" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-24" />
          <textarea value={form.followUpActions} onChange={(e) => setForm((f) => ({ ...f, followUpActions: e.target.value }))} placeholder="Follow-up actions" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm min-h-24" />
          <button className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">Save Process Recording</button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Process Recording</h1>
          <p className="text-brand-muted text-sm mt-1">Enter and review counseling session notes chronologically</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
          + Log Session
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search case or counselor…" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm" />
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="space-y-4">
        {!isLoading && filtered.map((record) => (
          <div key={record.recordingId} className="bg-white border border-brand-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <div className="font-semibold text-brand-charcoal">{record.residentCaseControlNo ?? 'Case'} · {record.sessionType ?? 'Session'}</div>
              <div className="text-xs text-brand-muted">{formatDate(record.sessionDate)}</div>
            </div>
            <div className="text-xs text-brand-muted mb-3">{record.socialWorker ?? 'Unassigned worker'}</div>
            <p className="text-sm text-brand-muted leading-relaxed">{record.sessionNarrative ?? 'No narrative recorded.'}</p>
            <div className="mt-3 text-xs text-brand-muted">Interventions: {record.interventionsApplied ?? '—'}</div>
            <div className="mt-1 text-xs text-brand-muted">Follow-up: {record.followUpActions ?? '—'}</div>
          </div>
        ))}
        {isLoading && <div className="py-10 text-center text-brand-muted">Loading process recordings…</div>}
      </div>
    </div>
  )
}
