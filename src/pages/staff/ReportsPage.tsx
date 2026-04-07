import { useState } from 'react'
import { FileBarChart, Download, Plus, Check, Clock } from 'lucide-react'

const reports = [
  { id: '1', title: 'Monthly Operations Report — March 2025', generated: '2025-04-01', type: 'Operations', author: 'System', format: 'PDF', size: '1.2 MB' },
  { id: '2', title: 'Annual Impact Report 2024', generated: '2025-01-10', type: 'Impact', author: 'Ana Reyes', format: 'PDF', size: '3.8 MB' },
  { id: '3', title: 'Q1 2025 Donor Summary', generated: '2025-04-03', type: 'Fundraising', author: 'System', format: 'XLSX', size: '0.4 MB' },
  { id: '4', title: 'Case Outcomes — Q4 2024', generated: '2024-12-31', type: 'Outcomes', author: 'Kofi Asante', format: 'PDF', size: '2.1 MB' },
  { id: '5', title: 'Monthly Operations Report — February 2025', generated: '2025-03-04', type: 'Operations', author: 'System', format: 'PDF', size: '1.1 MB' },
  { id: '6', title: 'Counseling Engagement Summary — Q1 2025', generated: '2025-04-02', type: 'Programs', author: 'Ana Reyes', format: 'PDF', size: '0.9 MB' },
]

const typeColors: Record<string, { bg: string; text: string }> = {
  Operations: { bg: 'bg-slate-100',           text: 'text-slate-600'   },
  Impact:     { bg: 'bg-brand-teal-muted',    text: 'text-brand-teal'  },
  Fundraising:{ bg: 'bg-brand-bronze-muted',  text: 'text-brand-bronze'},
  Outcomes:   { bg: 'bg-blue-50',             text: 'text-blue-700'    },
  Programs:   { bg: 'bg-green-50',            text: 'text-green-700'   },
}

const generateOptions = [
  'Monthly Operations Report',
  'Case Outcomes Summary',
  'Donor Engagement Report',
  'Program Impact Summary',
  'Counseling Session Log',
]

export default function ReportsPage() {
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated]   = useState<string | null>(null)
  const [showModal, setShowModal]   = useState(false)
  const [selectedType, setSelectedType] = useState(generateOptions[0])

  function handleGenerate() {
    setGenerating(true)
    setGenerated(null)
    setTimeout(() => {
      setGenerating(false)
      setGenerated(selectedType)
      setShowModal(false)
    }, 1800)
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Reports</h1>
          <p className="text-brand-muted text-sm mt-1">Generated reports and data exports</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          Generate Report
        </button>
      </div>

      {/* Success banner */}
      {generated && (
        <div className="mb-4 flex items-center gap-3 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
          <Check className="w-4 h-4 shrink-0" />
          <span>
            <span className="font-semibold">{generated}</span> has been generated and is ready to download.
          </span>
          <button onClick={() => setGenerated(null)} className="ml-auto text-brand-teal/70 hover:text-brand-teal">✕</button>
        </div>
      )}

      {/* Generate modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-brand-border shadow-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-brand-charcoal mb-4">Generate New Report</h2>
            <div className="mb-4">
              <label className="block text-xs font-medium text-brand-muted mb-2">Report Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30"
              >
                {generateOptions.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div className="mb-5">
              <label className="block text-xs font-medium text-brand-muted mb-2">Period</label>
              <select className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30">
                <option>Q1 2025 (Jan–Mar)</option>
                <option>Q4 2024 (Oct–Dec)</option>
                <option>Full Year 2024</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleGenerate}
                disabled={generating}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-brand-bronze text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-brand-bronze-light disabled:opacity-60 transition-colors"
              >
                {generating ? (
                  <>
                    <Clock className="w-4 h-4 animate-spin" />
                    Generating…
                  </>
                ) : 'Generate'}
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 border border-brand-border rounded-lg text-sm font-medium text-brand-muted hover:text-brand-charcoal transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reports list */}
      <div className="space-y-3">
        {reports.map((r) => {
          const meta = typeColors[r.type] ?? { bg: 'bg-gray-100', text: 'text-gray-600' }
          return (
            <div
              key={r.id}
              className="bg-white border border-brand-border rounded-xl p-4 flex items-center gap-4 hover:shadow-card transition-shadow"
            >
              <div className="bg-brand-stone rounded-lg p-2.5 shrink-0">
                <FileBarChart className="w-5 h-5 text-brand-muted" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-brand-charcoal text-sm truncate">{r.title}</p>
                <p className="text-xs text-brand-muted mt-0.5">
                  {new Date(r.generated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {' · by '}{r.author} · {r.size}
                </p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${meta.bg} ${meta.text}`}>
                {r.type}
              </span>
              <span className="text-xs text-brand-muted shrink-0 font-mono">{r.format}</span>
              <button
                className="text-brand-muted hover:text-brand-bronze transition-colors shrink-0"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
