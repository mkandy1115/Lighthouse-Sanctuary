import { useParams, Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { formatDate } from '@/lib/formatters'
import { ArrowLeft } from 'lucide-react'
import { getProcessRecording, type ProcessRecordingItem } from '@/lib/staff'

export default function CounselingDetailPage() {
  const { id = '' } = useParams<{ id: string }>()
  const [record, setRecord] = useState<ProcessRecordingItem | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setRecord(await getProcessRecording(id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load process recording.')
      }
    }
    load()
  }, [id])

  if (error) {
    return <div className="py-16 text-center text-rose-700">{error}</div>
  }

  if (!record) {
    return <div className="py-16 text-center text-brand-muted">Loading process recording…</div>
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link to="/admin/counseling" className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sessions
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-brand-muted font-mono text-sm">
            Session #{record.recordingId} · Case {record.residentCaseControlNo ?? record.residentId}
          </p>
          <h1 className="font-serif text-3xl text-brand-charcoal mt-1">
            {record.sessionType ?? 'Counseling'} Session
          </h1>
          <p className="text-brand-muted text-sm mt-1">
            {record.socialWorker ?? 'Unassigned'} · {formatDate(record.sessionDate, 'long')} · {record.sessionDurationMinutes ?? '—'} min
          </p>
        </div>
        <span className={`text-xs font-medium px-3 py-1 rounded-full capitalize ${
          record.concernsFlagged ? 'bg-amber-50 text-amber-700' : 'bg-brand-teal-muted text-brand-teal'
        }`}>
          {record.concernsFlagged ? 'needs follow-up' : 'documented'}
        </span>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Emotional State (Observed)', content: record.emotionalStateObserved ?? '—' },
          { label: 'Emotional State (End)', content: record.emotionalStateEnd ?? '—' },
          { label: 'Session Narrative', content: record.sessionNarrative ?? '—' },
          { label: 'Interventions Used', content: record.interventionsApplied ?? '—' },
          { label: 'Follow-up Actions', content: record.followUpActions ?? '—' },
        ].map(({ label, content }) => (
          <div key={label} className="bg-brand-cream rounded-xl border border-brand-border p-5">
            <h2 className="font-semibold text-brand-charcoal text-sm mb-2">{label}</h2>
            <p className="text-brand-muted text-sm leading-relaxed">{content}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
