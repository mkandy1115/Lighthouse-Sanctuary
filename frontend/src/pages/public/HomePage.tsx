import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Home,
  Heart,
  BookOpen,
  ArrowRight,
  Shield,
  Users,
  TrendingUp,
  Star,
} from 'lucide-react'
import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import Button from '@/components/ui/Button'
import SharedHeroSection from '@/components/shared/HeroSection'
import ProgramCard from '@/components/shared/ProgramCard'
import OutcomeMetric from '@/components/shared/OutcomeMetric'
import DonorImpactCard from '@/components/shared/DonorImpactCard'
import { formatPercent, formatUsdFromPhp } from '@/lib/formatters'
import { getSiteMetrics, type SiteMetricsResponse } from '@/lib/siteMetrics'

// ─── Decorative SVG pattern ───────────────────────────────────────────────────
function GeometricPattern() {
  return (
    <svg
      className="home-hero-pattern absolute inset-0 w-full h-full opacity-[0.045] pointer-events-none"
      aria-hidden="true"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="lh-grid" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#92642A" strokeWidth="0.6" />
        </pattern>
        <pattern id="lh-dots" width="30" height="30" patternUnits="userSpaceOnUse">
          <circle cx="15" cy="15" r="1.2" fill="#2D8A8A" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#lh-grid)" />
      <rect width="100%" height="100%" fill="url(#lh-dots)" opacity="0.4" />
    </svg>
  )
}

// ─── A. Hero ──────────────────────────────────────────────────────────────────
function HeroSection({ metrics }: { metrics: SiteMetricsResponse | null }) {
  return (
    <section
      className="home-hero relative min-h-screen flex flex-col justify-center overflow-hidden"
      aria-labelledby="hero-heading"
    >
      <GeometricPattern />

      <div
        className="home-hero-orb-bronze absolute -right-32 top-1/3 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(146,100,42,0.10) 0%, transparent 70%)' }}
        aria-hidden="true"
      />
      <div
        className="home-hero-orb-teal absolute -left-24 bottom-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(45,138,138,0.10) 0%, transparent 70%)' }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-36 sm:px-6 lg:px-8 animate-fade-in">
        <SharedHeroSection
          eyebrow="Serving the Ghana Region of Africa"
          title={
            <>
              A Safe Haven for
              <br />
              <span className="text-brand-bronze">Ghana's Most</span> Vulnerable
            </>
          }
          description="Imari: Safe Haven provides sanctuary, trauma-informed care, and holistic support to survivors of trafficking and displacement across the Ghana region — restoring dignity, safety, and hope one life at a time."
          actions={
            <>
              <Button to="/donate" size="lg">
                <Heart className="h-4 w-4" aria-hidden="true" />
                Support Our Work
              </Button>
              <Button to="/about" variant="secondary" size="lg">
                Learn Our Story
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Button>
            </>
          }
        />

        {/* Hero chips map to SiteMetricsController: girlsSupported = female residents count; activeCases; totalImpactPhp */}
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          {[
            { label: `${metrics?.aggregates.girlsSupported ?? 0} Girls in Care`, Icon: Users },
            { label: `${metrics?.aggregates.activeCases ?? 0} Active Cases`, Icon: Star },
            { label: `${formatUsdFromPhp(metrics?.aggregates.totalImpactPhp ?? 0)} in Impact`, Icon: TrendingUp },
          ].map(({ label, Icon }) => (
            <div
              key={label}
              className="inline-flex items-center gap-2 px-5 py-2 bg-white border border-brand-border rounded-full text-sm font-medium text-brand-charcoal shadow-card"
            >
              <Icon className="w-4 h-4 text-brand-teal" aria-hidden="true" />
              {label}
            </div>
          ))}
        </div>
      </div>

      {/* Wave divider */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-[0]" aria-hidden="true">
        <svg viewBox="0 0 1440 52" className="w-full" preserveAspectRatio="none">
          <path d="M0,52 C480,0 960,48 1440,20 L1440,52 Z" fill="var(--brand-cream)" />
        </svg>
      </div>
    </section>
  )
}

// ─── B. Mission Statement ─────────────────────────────────────────────────────
function MissionSection() {
  return (
    <section className="bg-white py-24" aria-labelledby="mission-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="border-t border-brand-border mb-16" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Pull-quote left */}
          <div className="relative">
            <div className="absolute -left-4 top-0 bottom-0 w-1 rounded-full bg-brand-bronze/60" aria-hidden="true" />
            <blockquote className="pl-8">
              <p
                id="mission-heading"
                className="font-serif text-3xl md:text-4xl text-brand-charcoal leading-snug"
              >
                "Every survivor who walks through our doors carries immeasurable strength —
                our role is simply to{' '}
                <em className="text-brand-bronze not-italic">be the haven</em> they deserve."
              </p>
              <footer className="mt-6">
                <cite className="not-italic">
                  <p className="text-sm font-semibold text-brand-charcoal">Amara Mensah, Executive Director</p>
                  <p className="text-xs text-brand-muted">Imari: Safe Haven, Accra, Ghana</p>
                </cite>
              </footer>
            </blockquote>
          </div>

          {/* Mission text right */}
          <div className="space-y-5 text-brand-muted leading-relaxed text-[15px]">
            <p>
              Imari: Safe Haven exists to serve the most vulnerable across Ghana — children and young
              women who have experienced trafficking, abuse, or forced displacement. We believe
              that recovery is not merely possible; it is the right of every person who has been
              wronged. Our programs are built on a foundation of trauma-informed care,
              unconditional respect, and the quiet conviction that healing happens in safety.
            </p>
            <p>
              Since our founding in Accra, we have partnered with Ghanaian government agencies, community
              organizations, and generous donors to create a network of care that meets survivors
              where they are — providing residential support, psychological healing, educational
              opportunity, and the practical skills needed for a self-determined future. We do
              not simply shelter people; we walk alongside them toward wholeness.
            </p>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-brand-bronze font-semibold text-sm hover:text-brand-bronze-light transition-colors"
            >
              Read our full mission
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
        <div className="border-t border-brand-border mt-16" />
      </div>
    </section>
  )
}

// ─── C. Programs ──────────────────────────────────────────────────────────────
const programs = [
  {
    Icon: Home,
    title: 'Residential Safe Homes',
    description:
      'Our safe homes offer 24/7 shelter in a nurturing, trauma-sensitive environment. Residents receive nutritious meals, medical care coordination, and consistent adult support as they stabilize and begin their healing journey.',
  },
  {
    Icon: Heart,
    title: 'Trauma-Focused Counseling',
    description:
      'Licensed counselors provide individual and group therapy grounded in evidence-based approaches. Sessions focus on processing trauma, building resilience, and developing healthy coping mechanisms in a confidential setting.',
  },
  {
    Icon: BookOpen,
    title: 'Education & Reintegration',
    description:
      'We partner with schools and vocational institutions to ensure every resident has access to formal education and skills training — guiding each individual through enrollment, tutoring, and eventual community reintegration.',
  },
]

function ProgramsSection() {
  return (
    <section className="bg-brand-stone py-24" aria-labelledby="programs-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-teal font-semibold tracking-widest text-xs uppercase mb-3">
            Our Approach
          </p>
          <h2
            id="programs-heading"
            className="font-serif text-4xl md:text-5xl text-brand-charcoal"
          >
            How We Help
          </h2>
          <p className="mt-4 text-brand-muted max-w-xl mx-auto leading-relaxed text-[15px]">
            Three interconnected pillars of care — shelter, healing, and opportunity — form
            the foundation of every person's journey with Lighthouse.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {programs.map(({ Icon, title, description }) => (
            <ProgramCard key={title} icon={Icon} title={title} description={description} />
          ))}
        </div>

        <div className="text-center mt-10">
          <Button to="/programs" variant="secondary" size="lg">
            View All Programs
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── D. Impact / Outcomes ─────────────────────────────────────────────────────
function ImpactSection({ metrics }: { metrics: SiteMetricsResponse | null }) {
  const outcomeAreas = [
    {
      label: 'Safety & Shelter',
      value: `${formatPercent(metrics?.aggregates.stableHousingVisitPct ?? 0, 1)} favorable post-placement outcomes`,
    },
    {
      label: 'Education Access',
      value: `${formatPercent(metrics?.aggregates.educationProgressPct ?? 0, 1)} residents at strong learning progress`,
    },
    {
      label: 'Mental Health',
      value: `${formatPercent(metrics?.aggregates.wellbeingPct ?? 0, 1)} residents in stable wellbeing range`,
    },
    {
      label: 'Program Completion',
      value: `${formatPercent(metrics?.aggregates.programCompletionPct ?? 0, 1)} completion in latest education records`,
    },
    {
      label: 'Reintegration',
      value: `${formatPercent(metrics?.aggregates.reintegrationSuccessPct ?? 0, 1)} completed among tracked cases`,
    },
    { label: 'Active Caseload', value: `${metrics?.aggregates.activeCases ?? 0} currently active resident cases` },
  ]
  return (
    <section
      className="py-28"
      style={{ background: '#1C1917' }}
      aria-labelledby="impact-heading"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-bronze font-semibold tracking-widest text-xs uppercase mb-3">
            Measured, Meaningful Change
          </p>
          <h2
            id="impact-heading"
            className="font-serif text-4xl md:text-5xl text-white"
          >
            Our <span className="text-brand-bronze">Insights</span>
          </h2>
          <p className="mt-4 text-brand-muted-light max-w-xl mx-auto leading-relaxed text-[15px]">
            We track outcomes rigorously so we can be accountable to the communities we serve
            and continually improve our approach.
          </p>
        </div>

        {/* Big stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-14">
          {[
            {
              stat: String(metrics?.aggregates.girlsSupported ?? 0),
              label: 'Girls Supported',
              sub: 'female residents in program records',
            },
            {
              stat: formatPercent(metrics?.aggregates.reintegrationSuccessPct ?? 0, 1),
              label: 'Reintegration Success',
              sub: 'cases with Completed reintegration status',
            },
            {
              stat: formatUsdFromPhp(metrics?.aggregates.totalImpactPhp ?? 0),
              label: 'Total Impact',
              sub: 'in services delivered (allocated from donations)',
            },
          ].map(({ stat, label, sub }) => (
            <div
              key={label}
              className="text-center px-6 py-10 rounded-2xl border border-white/10 bg-white/5"
            >
              <div className="font-serif text-5xl md:text-6xl text-brand-bronze mb-2">{stat}</div>
              <div className="text-white font-semibold text-lg mb-1">{label}</div>
              <div className="text-brand-muted-light text-sm">{sub}</div>
            </div>
          ))}
        </div>

        {/* Outcome rows */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {outcomeAreas.map(({ label, value }) => (
            <div key={label} className="rounded-xl bg-white/5 p-1">
              <OutcomeMetric label={label} value={value} />
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            to="/impact"
            className="inline-flex items-center gap-2 px-6 py-3 border border-brand-bronze text-brand-bronze font-semibold rounded-lg hover:bg-brand-bronze hover:text-white transition-colors text-sm"
          >
            Read the Full Impact Report
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── E. Donor Impact Storytelling ─────────────────────────────────────────────
const donorCards = [
  {
    amount: 'Monthly recurring gift',
    impact:
      'Funds ongoing trauma-focused counseling, providing consistent psychological support during critical stages of healing.',
  },
  {
    amount: 'Supportive one-time gift',
    impact:
      'Supports safe housing and nutritious meals for a child in residential care, giving her the stable foundation recovery requires.',
  },
  {
    amount: 'Transformative lead gift',
    impact:
      'Helps establish vocational training opportunities, equipping young women with skills and confidence to build a self-determined livelihood.',
  },
]

function DonorStorytellingSection() {
  return (
    <section className="bg-brand-cream py-24" aria-labelledby="donor-story-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="text-brand-bronze font-semibold tracking-widest text-xs uppercase mb-3">
            The Power of Your Generosity
          </p>
          <h2
            id="donor-story-heading"
            className="font-serif text-4xl md:text-5xl text-brand-charcoal"
          >
            Your Generosity, Transformed
          </h2>
          <p className="mt-4 text-brand-muted max-w-xl mx-auto leading-relaxed text-[15px]">
            Every gift — no matter the size — creates a ripple of lasting change in the
            lives of those we serve.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {donorCards.map(({ amount, impact }) => (
            <DonorImpactCard key={amount} amount={amount} outcome={impact} />
          ))}
        </div>

        <div className="text-center">
          <Button to="/donate" size="lg">
            <Heart className="w-4 h-4" aria-hidden="true" />
            Make a Gift Today
          </Button>
        </div>
      </div>
    </section>
  )
}

// ─── F. Partners ──────────────────────────────────────────────────────────────
const partners = [
  'Ghana Social Welfare Dept.',
  'UN Women Ghana',
  'African Development Fund',
  'Interfaith Council Ghana',
  'University of Ghana',
]

function PartnersSection() {
  return (
    <section className="bg-white py-20" aria-labelledby="partners-heading">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p
          id="partners-heading"
          className="text-brand-muted text-xs uppercase tracking-widest font-semibold mb-10"
        >
          Trusted Partners &amp; Collaborators
        </p>
        <div className="flex flex-wrap justify-center items-center gap-4">
          {partners.map((p) => (
            <div
              key={p}
              className="h-14 px-7 bg-brand-stone border border-brand-border rounded-xl flex items-center justify-center text-sm text-brand-muted font-medium"
              aria-label={`Partner: ${p}`}
            >
              {p}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── G. CTA Banner ───────────────────────────────────────────────────────────
function CTABannerSection() {
  return (
    <section
      className="py-24"
      style={{ background: '#92642A' }}
      aria-labelledby="cta-banner-heading"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Shield className="w-10 h-10 text-white/50 mx-auto mb-6" aria-hidden="true" />
        <h2
          id="cta-banner-heading"
          className="font-serif text-4xl md:text-5xl text-white mb-5 leading-tight"
        >
          Be Part of Something<br />That Matters
        </h2>
        <p className="text-white/80 text-lg leading-relaxed mb-10 max-w-2xl mx-auto">
          When you stand with Imari, you stand with every survivor across Ghana who has ever dared
          to hope for a better future. Your partnership — in any form — is an act of love
          that echoes across generations.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/donate"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-brand-bronze font-semibold rounded-lg hover:bg-brand-cream transition-colors text-sm"
          >
            <Heart className="w-4 h-4" aria-hidden="true" />
            Give Today
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center justify-center gap-2 px-8 py-3.5 border border-white/40 text-white font-semibold rounded-lg hover:bg-white/10 transition-colors text-sm"
          >
            Become a Partner
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [metrics, setMetrics] = useState<SiteMetricsResponse | null>(null)

  useEffect(() => {
    getSiteMetrics().then(setMetrics).catch(() => {})
  }, [])

  return (
    <div className="min-h-screen bg-brand-cream">
      <PublicNav />
      <main id="main-content">
      <HeroSection metrics={metrics} />
        <MissionSection />
        <ProgramsSection />
      <ImpactSection metrics={metrics} />
        <DonorStorytellingSection />
        <PartnersSection />
        <CTABannerSection />
      </main>
      <PublicFooter />
    </div>
  )
}
