import { useParams, Link } from 'react-router-dom'
import { formatDate } from '@/lib/formatters'
import { ArrowLeft } from 'lucide-react'

const mockSession = {
  id: '1',
  caseId: '#0421',
  counselor: 'Dr. Ana Reyes',
  sessionNum: 8,
  total: 12,
  date: '2025-01-15',
  type: 'Individual',
  duration: 60,
  status: 'completed',
  goals: 'Address recurring anxiety triggers related to crowded environments. Practice grounding techniques.',
  interventions: 'CBT thought journaling, breathing exercises, EMDR preparation review.',
  clientResponse: 'Client demonstrated improved insight. Reported reduced nightmares this week.',
  nextSteps: 'Continue EMDR preparation. Introduce peer support group discussion for session 9.',
}

export default function CounselingDetailPage() {
  const { id = mockSession.id } = useParams<{ id: string }>()
  const s = { ...mockSession, id }

  return (
    <div className="animate-fade-in max-w-3xl">
      <Link to="/staff/counseling" className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Sessions
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <p className="text-brand-muted font-mono text-sm">Session #{s.id} · {s.sessionNum} of {s.total} · Case {s.caseId}</p>
          <h1 className="font-serif text-3xl text-brand-charcoal mt-1">{s.type} Counseling Session</h1>
          <p className="text-brand-muted text-sm mt-1">{s.counselor} · {formatDate(s.date, 'long')} · {s.duration} min</p>
        </div>
        <span className="bg-brand-teal-muted text-brand-teal text-xs font-medium px-3 py-1 rounded-full capitalize">
          {s.status}
        </span>
      </div>

      <div className="space-y-4">
        {[
          { label: 'Session Goals', content: s.goals },
          { label: 'Interventions Used', content: s.interventions },
          { label: 'Client Response', content: s.clientResponse },
          { label: 'Next Steps', content: s.nextSteps },
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
