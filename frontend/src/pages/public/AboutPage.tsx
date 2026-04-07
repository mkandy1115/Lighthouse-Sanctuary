import PublicNav from '@/components/layout/PublicNav'
import PublicFooter from '@/components/layout/PublicFooter'
import { Heart, Shield, Users, BookOpen, Globe, Lightbulb } from 'lucide-react'

const values = [
  {
    icon: Shield,
    title: 'Dignity First',
    body:
      'Every person who enters our doors is treated as a full human being with inherent worth — not a case number, a statistic, or a victim.',
  },
  {
    icon: Heart,
    title: 'Compassionate Care',
    body:
      'Trauma-informed practice is our standard, not an exception. We meet survivors where they are and move at their pace.',
  },
  {
    icon: Users,
    title: 'Community Rooted',
    body:
      'We are Ghanaian-led and community-owned. Our staff, our advisors, and our approach reflect the communities we serve.',
  },
  {
    icon: BookOpen,
    title: 'Transparency',
    body:
      'We publish annual impact reports, invite independent audits, and maintain open governance. Accountability is not optional.',
  },
  {
    icon: Globe,
    title: 'Holistic Support',
    body:
      'Safety, healing, legal, livelihood, education — we address every dimension of a survivor\'s journey, not just the immediate crisis.',
  },
  {
    icon: Lightbulb,
    title: 'Continuous Learning',
    body:
      'We adapt our programs based on outcomes data, survivor feedback, and emerging research in trauma-informed practice.',
  },
]

const team = [
  {
    name: 'Amara Mensah',
    role: 'Executive Director',
    bio: 'Former social policy advisor to the Ghana Ministry of Gender, Children and Social Protection. 18 years in survivor advocacy across Sub-Saharan Africa.',
    initials: 'AM',
    color: 'from-brand-teal to-brand-teal-light',
  },
  {
    name: 'Kofi Asante',
    role: 'Director of Programs',
    bio: 'Clinical psychologist with specialization in trauma and displacement. Led survivor services at UNHCR Ghana for 8 years before joining Imari.',
    initials: 'KA',
    color: 'from-brand-bronze to-brand-bronze-light',
  },
  {
    name: 'Abena Owusu',
    role: 'Head of Partnerships',
    bio: 'Builds and maintains relationships with government agencies, UN bodies, and international funders. Fluent in Twi, Ga, and English.',
    initials: 'AO',
    color: 'from-slate-500 to-slate-400',
  },
  {
    name: 'Yaw Darko',
    role: 'Finance & Operations',
    bio: 'Certified public accountant with 12 years in NGO financial management. Oversees compliance, grants management, and organizational sustainability.',
    initials: 'YD',
    color: 'from-brand-teal to-brand-teal-light',
  },
]

const timeline = [
  {
    year: '2010',
    title: 'Founded in Accra',
    body: 'Imari opened its first safe home in East Legon, Accra, with capacity for 8 residents and a staff of 4.',
  },
  {
    year: '2013',
    title: 'National Recognition',
    body: 'Awarded the Ghana Social Protection Excellence Award and entered a formal partnership with the Department of Social Welfare.',
  },
  {
    year: '2016',
    title: 'Second Safe Home',
    body: 'Expanded to Kumasi with a second residential facility, extending our reach to the Ashanti Region.',
  },
  {
    year: '2019',
    title: 'Livelihood Program Launch',
    body: 'Launched vocational training and microenterprise support, responding to survivor requests for long-term economic independence.',
  },
  {
    year: '2022',
    title: 'Third Facility',
    body: 'Opened our third safe home in Takoradi, serving the Western Region and coastal communities.',
  },
  {
    year: '2025',
    title: 'Digital Systems Launch',
    body: 'Imari\'s integrated case management and donor platform goes live, connecting operations across all three facilities.',
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="pt-32 pb-20 bg-brand-charcoal relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%">
            <pattern id="about-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
              <circle cx="12" cy="12" r="1.5" fill="white" />
            </pattern>
            <rect width="100%" height="100%" fill="url(#about-dots)" />
          </svg>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-5">
            Our Story
          </p>
          <h1 className="font-serif text-4xl md:text-5xl lg:text-6xl text-white max-w-3xl leading-tight mb-8">
            Built from the ground up — by Ghana, for Ghana.
          </h1>
          <p className="text-brand-muted-light text-lg md:text-xl max-w-2xl leading-relaxed">
            Imari: Safe Haven was founded in 2010 by a group of Ghanaian social workers, lawyers,
            and community advocates who saw a gap no government agency was filling: a safe,
            holistic, survivor-centered refuge for trafficking victims and displaced youth.
          </p>
        </div>
      </section>

      {/* ── Mission & Vision ─────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-10">
            <div className="bg-white border border-brand-border rounded-2xl p-8">
              <div className="w-8 h-1 bg-brand-bronze rounded-full mb-5" />
              <h2 className="font-serif text-2xl text-brand-charcoal mb-4">Our Mission</h2>
              <p className="text-brand-muted leading-relaxed text-lg">
                To provide trauma-informed care, holistic support, and pathways to lasting
                independence for survivors of trafficking, exploitation, and displacement
                across the Ghana region of Africa.
              </p>
            </div>
            <div className="bg-brand-charcoal rounded-2xl p-8">
              <div className="w-8 h-1 bg-brand-teal rounded-full mb-5" />
              <h2 className="font-serif text-2xl text-white mb-4">Our Vision</h2>
              <p className="text-brand-muted-light leading-relaxed text-lg">
                A Ghana where every young person — regardless of their past — has access
                to safety, healing, and the genuine opportunity to build a dignified future
                on their own terms.
              </p>
            </div>
          </div>

          {/* Pull quote */}
          <blockquote className="mt-12 text-center max-w-3xl mx-auto">
            <p className="font-serif text-2xl md:text-3xl text-brand-charcoal leading-snug mb-5">
              "We do not rescue people. We stand alongside them until they no longer need us."
            </p>
            <footer className="text-sm text-brand-muted">
              <span className="font-semibold text-brand-charcoal">Amara Mensah</span>
              {' '}— Executive Director, Imari: Safe Haven
            </footer>
          </blockquote>
        </div>
      </section>

      {/* ── Values ───────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-4">
              What guides us
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal">Core Values</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="bg-white border border-brand-border rounded-xl p-6 hover:shadow-card-md transition-shadow"
              >
                <div className="w-10 h-10 rounded-lg bg-brand-cream flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-bronze" />
                </div>
                <h3 className="font-semibold text-brand-charcoal mb-2">{title}</h3>
                <p className="text-brand-muted text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Team ─────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-stone">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-4">
              Leadership
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal max-w-xl">
              The team behind the work
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map(({ name, role, bio, initials, color }) => (
              <div key={name} className="bg-white border border-brand-border rounded-xl p-6">
                <div
                  className={`w-14 h-14 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white font-semibold text-lg mb-4`}
                >
                  {initials}
                </div>
                <h3 className="font-semibold text-brand-charcoal">{name}</h3>
                <p className="text-brand-bronze text-xs font-medium uppercase tracking-wide mt-1 mb-3">
                  {role}
                </p>
                <p className="text-brand-muted text-sm leading-relaxed">{bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ─────────────────────────────────────────────────────── */}
      <section className="py-20 bg-brand-charcoal">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-14">
            <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-4">
              Our journey
            </p>
            <h2 className="font-serif text-3xl md:text-4xl text-white">15 years of safe haven</h2>
          </div>
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[22px] top-0 bottom-0 w-px bg-white/10 hidden md:block" />
            <div className="space-y-10">
              {timeline.map(({ year, title, body }, i) => (
                <div key={year} className="flex gap-8 items-start">
                  <div className="flex-shrink-0 flex flex-col items-center">
                    <div
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold border-2 z-10 ${
                        i === timeline.length - 1
                          ? 'border-brand-bronze bg-brand-bronze text-white'
                          : 'border-white/20 bg-brand-charcoal text-brand-muted-light'
                      }`}
                    >
                      {year.slice(2)}
                    </div>
                  </div>
                  <div className="pt-1 pb-2">
                    <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-1">
                      {year}
                    </p>
                    <h3 className="font-semibold text-white mb-2">{title}</h3>
                    <p className="text-brand-muted-light text-sm leading-relaxed max-w-lg">{body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Partners strip ───────────────────────────────────────────────── */}
      <section className="py-14 bg-brand-cream border-t border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-brand-muted text-xs uppercase tracking-widest font-semibold mb-8">
            Trusted by leading organizations in Ghana and beyond
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-brand-muted-light">
            {[
              'Ghana Dept. of Social Welfare',
              'UN Women Ghana',
              'African Development Fund',
              'Interfaith Council Ghana',
              'University of Ghana',
            ].map((p) => (
              <span key={p}>{p}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-serif text-3xl md:text-4xl text-brand-charcoal mb-5">
            Stand with Imari
          </h2>
          <p className="text-brand-muted text-lg mb-8 leading-relaxed">
            Whether you give, volunteer, refer a case, or simply share our mission —
            every act of solidarity makes the work possible.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="/donate"
              className="inline-flex items-center gap-2 px-6 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
            >
              <Heart className="w-4 h-4" />
              Make a Donation
            </a>
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-brand-border text-brand-charcoal font-semibold rounded-lg hover:bg-brand-stone transition-colors"
            >
              Partner With Us
            </a>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
