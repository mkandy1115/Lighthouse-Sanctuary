import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { useEffect, useState } from 'react'
import { TrendingUp, Home, BookOpen, Briefcase, Heart, ArrowRight } from 'lucide-react'
import { formatUsdFromPhp, formatPercent, formatNumber } from '@/lib/formatters'
import { getSiteMetrics, type SiteMetricsResponse } from '@/lib/siteMetrics'

function getOutcomes(metrics: SiteMetricsResponse | null) {
  return [
    {
    icon: Home,
    title: 'Safe & Stable Housing',
    description:
      'Post-placement monitoring visits are tracked in our case system. Among those visits, the share with a Favorable housing stability outcome reflects movement toward safe, appropriate placement.',
    progress: Math.round(metrics?.aggregates.stableHousingVisitPct ?? 0),
    color: 'brand-teal',
    detail: `${formatPercent(metrics?.aggregates.stableHousingVisitPct ?? 0, 1)} Favorable (post-placement visits)`,
  },
  {
    icon: BookOpen,
    title: 'Education Re-enrollment',
    description:
      'Using the latest education record per resident, we measure progress toward course completion. Strong progress scores indicate residents are on track in formal or vocational pathways.',
    progress: Math.round(metrics?.aggregates.educationProgressPct ?? 0),
    color: 'brand-bronze',
    detail: `${formatPercent(metrics?.aggregates.educationProgressPct ?? 0, 1)} at ≥67% learning progress`,
  },
  {
    icon: Briefcase,
    title: 'School engagement',
    description:
      'Consistent attendance is a leading indicator of persistence in education and training. We report the share of residents whose latest record shows attendance at or above a 71% threshold.',
    progress: Math.round(metrics?.aggregates.attendanceEngagementPct ?? 0),
    color: 'brand-teal',
    detail: `${formatPercent(metrics?.aggregates.attendanceEngagementPct ?? 0, 1)} at ≥71% attendance`,
  },
  {
    icon: TrendingUp,
    title: 'Psychological Wellbeing',
    description:
      'Clinical check-ins record general health scores on a 1–5 scale. Residents scoring 3.0 or above on the latest record are counted as meeting a stable-or-better wellbeing band.',
    progress: Math.round(metrics?.aggregates.wellbeingPct ?? 0),
    color: 'brand-bronze',
    detail: `${formatPercent(metrics?.aggregates.wellbeingPct ?? 0, 1)} general health score ≥3.0`,
  },
]
}

const stories = [
  {
    initials: 'A.K.',
    region: 'Accra',
    quote:
      '"When I arrived at Imari I had nothing — no documents, no family contact, no hope. With support, I now run a small tailoring business and have my own room. That is because of the people here."',
    program: 'Livelihood Program Graduate',
  },
  {
    initials: 'E.M.',
    region: 'Kumasi',
    quote:
      '"The counselors here never made me feel broken. They helped me see that what happened to me was not who I am. I am back in school now and I want to be a nurse."',
    program: 'Back in Secondary School',
  },
  {
    initials: 'S.A.',
    region: 'Takoradi',
    quote:
      '"I stayed at Imari through recovery and now I return as a peer mentor. Helping others go through what I went through — that is how I heal."',
    program: 'Peer Mentor',
  },
]

export default function ImpactPage() {
  const [metrics, setMetrics] = useState<SiteMetricsResponse | null>(null)
  useEffect(() => {
    getSiteMetrics().then(setMetrics).catch(() => {})
  }, [])
  const outcomes = getOutcomes(metrics)
  const allocationTotal = metrics?.allocations.total ?? 0
  const allocationItems = (metrics?.allocations.byProgram ?? [])
    .map((row, index) => ({
      label: row.programArea?.trim() || 'Uncategorized',
      pct: allocationTotal > 0 ? (row.amount / allocationTotal) * 100 : 0,
      color: ['bg-brand-teal', 'bg-brand-bronze', 'bg-amber-400', 'bg-teal-600', 'bg-slate-400', 'bg-slate-300'][index % 6],
    }))
    .sort((a, b) => b.pct - a.pct)
  const stats = [
    {
      value: formatNumber(metrics?.aggregates.girlsSupported ?? 0),
      label: 'Survivors Served',
      sub: 'resident records (female youth)',
    },
    {
      value: formatPercent(metrics?.aggregates.programCompletionPct ?? 0, 1),
      label: 'Program Completion',
      sub: 'latest education record marked Completed',
    },
    {
      value: formatPercent(metrics?.aggregates.stableHousingVisitPct ?? 0, 1),
      label: 'Stable Housing',
      sub: 'post-placement visits with Favorable outcome',
    },
    {
      value: formatUsdFromPhp(metrics?.aggregates.totalImpactPhp ?? 0),
      label: 'Community Investment',
      sub: 'donations allocated to programs (PHP basis)',
    },
  ]
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 bg-brand-charcoal relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <pattern id="impact-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#impact-dots)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-5">
            Accountability
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white leading-tight mb-6">
                Every number is a life changed.
              </h1>
              <p className="text-brand-muted-light text-lg leading-relaxed">
                We track our outcomes rigorously — not to impress donors, but because survivors
                deserve to know their trust is well-placed. Our data is independently verified
                and published annually.
              </p>
            </div>
            {/* Big stat */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-8 text-center">
              <p className="font-serif text-6xl md:text-7xl text-brand-bronze mb-2">
                {formatNumber(metrics?.aggregates.girlsSupported ?? 0)}
              </p>
              <p className="text-white text-lg font-semibold mb-1">Survivors Served</p>
              <p className="text-brand-muted-light text-sm">Female residents in current program data</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────── */}
      <section className="py-14 bg-brand-cream border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map(({ value, label, sub }) => (
              <div
                key={label}
                className="bg-white border border-brand-border rounded-xl p-6 text-center"
              >
                <p className="font-serif text-3xl text-brand-bronze mb-1">{value}</p>
                <p className="font-semibold text-brand-charcoal text-sm">{label}</p>
                <p className="text-brand-muted text-xs mt-1">{sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Outcome areas ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-4">
              Measured outcomes
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal max-w-xl">
              Four areas. Real results.
            </h2>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {outcomes.map(({ icon: Icon, title, description, progress, color, detail }) => (
              <div key={title} className="bg-white border border-brand-border rounded-xl p-6">
                <div className="flex items-start gap-4 mb-5">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                      color === 'brand-teal' ? 'bg-brand-teal-muted' : 'bg-brand-bronze-muted'
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 ${
                        color === 'brand-teal' ? 'text-brand-teal' : 'text-brand-bronze'
                      }`}
                    />
                  </div>
                  <div>
                    <h3 className="font-semibold text-brand-charcoal">{title}</h3>
                    <p
                      className={`text-xs font-medium mt-1 ${
                        color === 'brand-teal' ? 'text-brand-teal' : 'text-brand-bronze'
                      }`}
                    >
                      {detail}
                    </p>
                  </div>
                </div>
                <p className="text-brand-muted text-sm leading-relaxed mb-5">{description}</p>
                {/* Progress bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-brand-muted">Outcome rate</span>
                    <span className="font-semibold text-brand-charcoal">{progress}%</span>
                  </div>
                  <div className="h-2 bg-brand-stone rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        color === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-bronze'
                      }`}
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Survivor stories ─────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-4">
              In their words
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal">
              Stories of resilience
            </h2>
            <p className="text-brand-muted mt-4 max-w-lg mx-auto text-sm">
              Names and identifying details have been changed or abbreviated to protect privacy.
              Shared with permission.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {stories.map(({ initials, region, quote, program }) => (
              <div key={initials} className="bg-white border border-brand-border rounded-xl p-6 flex flex-col">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-full bg-brand-bronze-muted flex items-center justify-center text-brand-bronze font-semibold text-sm">
                    {initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-brand-charcoal">Survivor story</p>
                    <p className="text-xs text-brand-muted">{region} Region</p>
                  </div>
                </div>
                <blockquote className="text-brand-charcoal text-sm leading-relaxed italic flex-1 mb-5">
                  {quote}
                </blockquote>
                <div className="pt-4 border-t border-brand-border">
                  <span className="text-xs font-medium text-brand-teal bg-brand-teal-muted px-2.5 py-1 rounded-full">
                    {program}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Fund allocation ──────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-brand-bronze dark:text-brand-bronze-light text-xs font-semibold uppercase tracking-widest mb-4">
                Financial transparency
              </p>
              <h2 className="font-serif text-3xl text-brand-charcoal dark:text-white mb-5">
                Where your money goes
              </h2>
              <p className="text-brand-muted dark:text-slate-300 leading-relaxed text-sm mb-8">
                Allocated support is shown by recorded program area. Totals reflect{' '}
                {formatUsdFromPhp(metrics?.aggregates.totalImpactPhp ?? 0)} in routed support (PHP basis, shown as USD
                equivalent where applicable).
              </p>
              <div className="space-y-4">
                {allocationItems.map(({ label, pct, color }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between text-sm mb-1.5">
                      <span className="text-brand-charcoal dark:text-white font-medium">{label}</span>
                      <span className="text-brand-muted dark:text-slate-300 font-semibold">{formatPercent(pct, 1)}</span>
                    </div>
                    <div className="h-2 bg-brand-stone dark:bg-slate-700 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-brand-teal-muted dark:bg-slate-800 border border-brand-teal/20 dark:border-brand-teal/40 rounded-2xl p-8">
              <Heart className="w-8 h-8 text-brand-teal dark:text-brand-teal-light mb-5" />
              <h3 className="font-serif text-xl text-brand-charcoal dark:text-white mb-3">
                Transparency Report
              </h3>
              <p className="text-brand-muted dark:text-slate-300 text-sm leading-relaxed mb-6">
                Imari publishes an annual impact report with full financial statements,
                program outcomes, and survivor testimonials (with consent). Our operations
                are audited annually by Deloitte Ghana.
              </p>
              <a
                href="/contact"
                className="inline-flex items-center gap-2 text-sm font-semibold text-brand-teal dark:text-brand-teal-light hover:text-brand-charcoal dark:hover:text-white transition-colors"
              >
                Request a copy of our annual report
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-charcoal">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-5">
            Be part of the next chapter
          </h2>
          <p className="text-brand-muted-light text-lg mb-8 leading-relaxed">
            These numbers represent real lives. Your donation funds more of them.
          </p>
          <a
            href="/donate"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
          >
            <Heart className="w-4 h-4" />
            Donate Today
          </a>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
