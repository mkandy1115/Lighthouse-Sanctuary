import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { Home, HeartHandshake, Scale, Briefcase, MapPin, Users, ArrowRight, Check } from 'lucide-react'

const programs = [
  {
    icon: Home,
    title: 'Residential Safe Homes',
    tag: 'Core',
    color: 'brand-bronze',
    description:
      'Fully staffed safe homes across Accra, Kumasi, and Takoradi provide immediate, secure housing for survivors. Each home offers private rooms, communal support spaces, nutritious meals, and around-the-clock on-site support.',
    features: [
      'Residential capacity is managed per facility need',
      'Around-the-clock house parents and security',
      'Culturally appropriate meals and cultural activities',
      'Visitor policy managed by resident consent',
    ],
  },
  {
    icon: HeartHandshake,
    title: 'Trauma-Focused Counseling',
    tag: 'Core',
    color: 'brand-teal',
    description:
      'Individual and group therapy with certified trauma counselors, available in Twi, Ga, Hausa, and English. Sessions are voluntary, survivor-paced, and built on evidence-based trauma treatment models.',
    features: [
      'Cognitive Processing Therapy (CPT) certified staff',
      'Group sessions for peer connection and solidarity',
      'Art and movement therapy options',
      'Multilingual support',
    ],
  },
  {
    icon: Scale,
    title: 'Legal Advocacy & Documentation',
    tag: 'Support',
    color: 'brand-bronze',
    description:
      'Comprehensive legal support including case accompaniment, national ID and documentation assistance, court preparation, and referrals to our partner legal aid organizations.',
    features: [
      'Pro bono legal network with partner firms',
      'National ID registration and documentation drives',
      'Court accompaniment for prosecution cases',
      'Immigration and asylum referral pathways',
    ],
  },
  {
    icon: Briefcase,
    title: 'Livelihood & Vocational Training',
    tag: 'Long-term',
    color: 'brand-teal',
    description:
      'Vocational skills programs, microenterprise coaching, savings group facilitation, and job placement partnerships with vetted local employers — building real economic independence.',
    features: [
      'Vocational tracks including tailoring, catering, and ICT',
      'Starter kit grants for microenterprise',
      'Savings group (susu) facilitation',
      'Employer partnerships in Accra and Kumasi',
    ],
  },
  {
    icon: MapPin,
    title: 'Home Visits & Follow-up',
    tag: 'Long-term',
    color: 'brand-bronze',
    description:
      'Regular welfare checks and structured follow-up support for survivors who have transitioned to independent living. Our outreach team maintains contact throughout the post-discharge period.',
    features: [
      'Recurring home visits after discharge',
      'Periodic check-ins through long-term follow-up',
      'Crisis re-entry protocol if needed',
      'Peer mentors matched from graduate program',
    ],
  },
  {
    icon: Users,
    title: 'Community Reintegration',
    tag: 'Community',
    color: 'brand-teal',
    description:
      'Structured reintegration plans, community sensitization workshops, and a survivor-led peer network that turns graduates into advocates and mentors for those still in the program.',
    features: [
      'Structured reintegration plan',
      'Community liaison officer in each district',
      'Survivor-led awareness events in schools',
      'Peer mentor certification program',
    ],
  },
]

const tagColors: Record<string, string> = {
  Core: 'bg-brand-teal-muted text-brand-teal',
  Support: 'bg-brand-bronze-muted text-brand-bronze',
  'Long-term': 'bg-amber-50 text-amber-700',
  Community: 'bg-slate-100 text-slate-600',
}

const stages = [
  { step: '1', label: 'Crisis Intake', desc: 'Safe intake and immediate needs assessment after referral.' },
  { step: '2', label: 'Safe Home Placement', desc: 'Temporary residential placement while a full needs assessment is completed.' },
  { step: '3', label: 'Holistic Assessment', desc: 'Medical, legal, psychological, and livelihood needs mapped by a multidisciplinary team.' },
  { step: '4', label: 'Care Planning', desc: 'Individualized care plan developed with the survivor — not for them.' },
  { step: '5', label: 'Active Support', desc: 'Counseling, legal, training, and community services delivered in parallel.' },
  { step: '6', label: 'Reintegration & Aftercare', desc: 'Gradual transition to independence with structured follow-up.' },
]

export default function ProgramsPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-5">
            What we do
          </p>
          <div className="grid md:grid-cols-2 gap-10 items-end">
            <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-brand-charcoal leading-tight">
              Integrated programs. One commitment.
            </h1>
            <p className="text-brand-muted text-lg leading-relaxed pb-1">
              Every program at Imari is designed with survivor voices at the center —
              ensuring culturally sensitive, trauma-informed care at every stage of the
              journey from crisis to lasting independence.
            </p>
          </div>
        </div>
      </section>

      {/* Wave divider */}
      <div className="h-8 bg-brand-cream relative overflow-hidden">
        <svg viewBox="0 0 1440 32" className="absolute bottom-0 w-full" preserveAspectRatio="none">
          <path d="M0,0 C360,32 1080,0 1440,32 L1440,32 L0,32 Z" fill="white" />
        </svg>
      </div>

      {/* ── Programs grid ────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map(({ icon: Icon, title, tag, color, description, features }) => (
              <div
                key={title}
                className="bg-white border border-brand-border rounded-xl overflow-hidden flex flex-col hover:shadow-card-md transition-shadow"
              >
                {/* Color stripe */}
                <div
                  className={`h-1.5 ${color === 'brand-teal' ? 'bg-brand-teal' : 'bg-brand-bronze'}`}
                />
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        color === 'brand-teal' ? 'bg-brand-teal-muted' : 'bg-brand-bronze-muted'
                      }`}
                    >
                      <Icon
                        className={`w-5 h-5 ${
                          color === 'brand-teal' ? 'text-brand-teal' : 'text-brand-bronze'
                        }`}
                      />
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagColors[tag]}`}>
                      {tag}
                    </span>
                  </div>
                  <h2 className="font-serif text-xl text-brand-charcoal mb-3">{title}</h2>
                  <p className="text-brand-muted text-sm leading-relaxed mb-5">{description}</p>
                  <ul className="space-y-2 mt-auto">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-brand-muted">
                        <Check className="w-3.5 h-3.5 text-brand-teal mt-0.5 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Journey stages ───────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-4">
              The process
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal">
              From intake to aftercare
            </h2>
            <p className="text-brand-muted mt-4 max-w-xl mx-auto">
              Every survivor follows a flexible, individualized path — but this framework
              guides how our teams coordinate care across departments.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {stages.map(({ step, label, desc }, i) => (
              <div key={step} className="bg-white border border-brand-border rounded-xl p-6 relative">
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-serif text-3xl text-brand-bronze/30 font-bold leading-none">
                    {step}
                  </span>
                  <h3 className="font-semibold text-brand-charcoal">{label}</h3>
                </div>
                <p className="text-brand-muted text-sm leading-relaxed">{desc}</p>
                {i < stages.length - 1 && (
                  <ArrowRight className="absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-brand-border hidden lg:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Referral CTA ─────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-charcoal">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-5">
            Need help?
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-white mb-5">
            Refer a survivor to Imari
          </h2>
          <p className="text-brand-muted-light text-lg mb-8 leading-relaxed">
            We accept referrals from social workers, law enforcement, medical providers,
              and community members. Our intake team responds as quickly as possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
            >
              Submit a Referral
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="/about"
              className="inline-flex items-center px-6 py-3 border border-white/20 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Learn About Our Team
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
