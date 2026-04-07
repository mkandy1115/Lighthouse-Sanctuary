import { formatDate } from '@/lib/formatters'
import { Calendar } from 'lucide-react'

const conferences = [
  { id: '1', title: 'Case Conference — Survivors Cohort Q1', date: '2025-01-25', time: '9:00 AM', attendees: ['Ana Reyes', 'Ben Morales', 'Supervisor Cruz'], caseIds: ['#0421', '#0419', '#0415'], status: 'scheduled' },
  { id: '2', title: 'Multi-Agency Review — DSWD Coordination', date: '2025-01-18', time: '2:00 PM', attendees: ['Ana Reyes', 'Ines Tan', 'DSWD Liaison'], caseIds: ['#0402'], status: 'completed' },
  { id: '3', title: 'Emergency Case Conference', date: '2024-11-16', time: '10:30 AM', attendees: ['All Staff'], caseIds: ['#0421'], status: 'completed' },
]

export default function ConferencesPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Conferences</h1>
          <p className="text-brand-muted text-sm mt-1">Case conferences and multi-agency coordination meetings</p>
        </div>
        <button className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
          + Schedule Conference
        </button>
      </div>

      <div className="space-y-4">
        {conferences.map((c) => (
          <div key={c.id} className="bg-brand-cream rounded-xl border border-brand-border p-5">
            <div className="flex items-start gap-4">
              <div className="bg-brand-bronze-muted rounded-lg p-2.5 shrink-0">
                <Calendar className="w-5 h-5 text-brand-bronze" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-brand-charcoal text-sm">{c.title}</h2>
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                    c.status === 'completed' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-amber-50 text-amber-700'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-brand-muted mb-3">
                  {formatDate(c.date, 'long')} at {c.time}
                </p>
                <div className="flex gap-6">
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Cases</p>
                    <div className="flex gap-1.5">
                      {c.caseIds.map((id) => (
                        <span key={id} className="font-mono text-xs bg-white border border-brand-border px-2 py-0.5 rounded text-brand-charcoal">
                          {id}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-brand-muted uppercase tracking-wider mb-1">Attendees</p>
                    <p className="text-xs text-brand-charcoal">{c.attendees.join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
