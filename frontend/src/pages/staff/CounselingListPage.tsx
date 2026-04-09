import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import {
  createProcessRecording,
  deleteProcessRecording,
  getProcessRecordings,
  getResidents,
  updateProcessRecording,
  type ProcessRecordingItem,
  type StaffResidentListItem,
} from '@/lib/staff'
import { formatDate } from '@/lib/formatters'
import { looksUnsafe, sanitizeText } from '@/lib/validation'

function emptyForm() {
  return {
    residentId: '',
    sessionDate: new Date().toISOString().slice(0, 10),
    socialWorker: '',
    sessionType: 'Individual',
    emotionalStateObserved: 'Calm',
    emotionalStateEnd: 'Hopeful',
    sessionNarrative: '',
    interventionsApplied: '',
    followUpActions: '',
    progressNoted: true,
    concernsFlagged: false,
    referralMade: false,
  }
}

export default function CounselingListPage() {
  const [recordings, setRecordings] = useState<ProcessRecordingItem[]>([])
  const [residents, setResidents] = useState<StaffResidentListItem[]>([])
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState(emptyForm)

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

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setIsModalOpen(true)
    setError('')
  }

  function openEdit(record: ProcessRecordingItem) {
    setEditingId(record.recordingId)
    setForm({
      residentId: String(record.residentId),
      sessionDate: String(record.sessionDate).slice(0, 10),
      socialWorker: record.socialWorker ?? '',
      sessionType: record.sessionType ?? 'Individual',
      emotionalStateObserved: record.emotionalStateObserved ?? '',
      emotionalStateEnd: record.emotionalStateEnd ?? '',
      sessionNarrative: record.sessionNarrative ?? '',
      interventionsApplied: record.interventionsApplied ?? '',
      followUpActions: record.followUpActions ?? '',
      progressNoted: record.progressNoted,
      concernsFlagged: record.concernsFlagged,
      referralMade: record.referralMade,
    })
    setIsModalOpen(true)
    setError('')
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError('')
    const safeNarrative = sanitizeText(form.sessionNarrative, 4000, true)
    const safeWorker = sanitizeText(form.socialWorker, 120)
    if (!form.residentId || !form.sessionDate) {
      setError('Resident and session date are required.')
      return
    }
    if (looksUnsafe(safeNarrative) || looksUnsafe(safeWorker)) {
      setError('Submitted text contains unsafe input.')
      return
    }

    const payload = {
      residentId: Number(form.residentId),
      sessionDate: form.sessionDate,
      socialWorker: safeWorker,
      sessionType: sanitizeText(form.sessionType, 24),
      emotionalStateObserved: sanitizeText(form.emotionalStateObserved, 32),
      emotionalStateEnd: sanitizeText(form.emotionalStateEnd, 32),
      sessionNarrative: safeNarrative,
      interventionsApplied: sanitizeText(form.interventionsApplied, 2000, true),
      followUpActions: sanitizeText(form.followUpActions, 2000, true),
      progressNoted: form.progressNoted,
      concernsFlagged: form.concernsFlagged,
      referralMade: form.referralMade,
    }

    try {
      if (editingId != null) {
        const updated = await updateProcessRecording(editingId, payload)
        setRecordings((current) => current.map((r) => (r.recordingId === editingId ? { ...r, ...updated } : r)))
      } else {
        const created = await createProcessRecording(payload)
        setRecordings((current) => [created, ...current])
      }
      setIsModalOpen(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save recording.')
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm('Delete this process recording?')) return
    try {
      setError('')
      await deleteProcessRecording(id)
      setRecordings((current) => current.filter((r) => r.recordingId !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to delete.')
    }
  }

  return (
    <div className="animate-fade-in">
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId != null ? 'Edit process recording' : 'Log process recording'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={form.residentId}
            onChange={(e) => setForm((f) => ({ ...f, residentId: e.target.value }))}
            className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          >
            <option value="">Select resident</option>
            {residents.map((resident) => (
              <option key={resident.residentId} value={resident.residentId}>
                {resident.caseControlNo} · {resident.internalCode}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="date"
              value={form.sessionDate}
              onChange={(e) => setForm((f) => ({ ...f, sessionDate: e.target.value }))}
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
            <input
              value={form.socialWorker}
              onChange={(e) => setForm((f) => ({ ...f, socialWorker: e.target.value }))}
              placeholder="Social worker"
              className="rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
            />
          </div>
          <textarea
            value={form.sessionNarrative}
            onChange={(e) => setForm((f) => ({ ...f, sessionNarrative: e.target.value }))}
            placeholder="Narrative summary"
            className="w-full min-h-28 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          />
          <textarea
            value={form.interventionsApplied}
            onChange={(e) => setForm((f) => ({ ...f, interventionsApplied: e.target.value }))}
            placeholder="Interventions applied"
            className="w-full min-h-24 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          />
          <textarea
            value={form.followUpActions}
            onChange={(e) => setForm((f) => ({ ...f, followUpActions: e.target.value }))}
            placeholder="Follow-up actions"
            className="w-full min-h-24 rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
          />
          <button type="submit" className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">
            {editingId != null ? 'Save changes' : 'Save process recording'}
          </button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Process Recording</h1>
          <p className="text-brand-muted text-sm mt-1">Enter and review counseling session notes chronologically</p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          + Log Session
        </button>
      </div>

      <div className="mb-4 max-w-sm">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search case or counselor…"
          className="w-full rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal"
        />
      </div>

      {error && <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

      <div className="space-y-4">
        {!isLoading && filtered.map((record) => (
          <div key={record.recordingId} className="bg-white border border-brand-border rounded-xl p-5">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <div className="font-semibold text-brand-charcoal">{record.residentCaseControlNo ?? 'Case'} · {record.sessionType ?? 'Session'}</div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-brand-muted">{formatDate(record.sessionDate)}</span>
                <button
                  type="button"
                  onClick={() => openEdit(record)}
                  className="text-xs font-semibold text-brand-bronze hover:underline"
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(record.recordingId)}
                  className="text-xs font-semibold text-rose-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
            <div className="text-xs text-brand-muted mb-3">{record.socialWorker ?? 'Unassigned worker'}</div>
            <p className="text-sm text-brand-muted leading-relaxed">{record.sessionNarrative ?? 'No narrative recorded.'}</p>
            <div className="mt-3 text-xs text-brand-muted">Interventions: {record.interventionsApplied ?? '—'}</div>
            <div className="mt-1 text-xs text-brand-muted">Follow-up: {record.followUpActions ?? '—'}</div>
            <Link to={`/admin/counseling/${record.recordingId}`} className="mt-3 inline-block text-xs font-semibold text-brand-bronze hover:underline">
              View details →
            </Link>
          </div>
        ))}
        {isLoading && <div className="py-10 text-center text-brand-muted">Loading process recordings…</div>}
      </div>
    </div>
  )
}
