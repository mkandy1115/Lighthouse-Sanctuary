import PublicFooter from '@/components/layout/PublicFooter'
import PublicNav from '@/components/layout/PublicNav'

const sections = [
  {
    title: 'What data we collect',
    body: [
      'We collect contact and account information that you provide directly, including your name, email address, phone number, username, password, and donation details when you create an account, sign in, contact us, or make a donation.',
      'We collect limited technical information needed to operate the website, including device and browser information, IP address, and preference data such as cookie consent choices and session-related storage.',
      'We may receive supporter or donor information from trusted referrals, partner organizations, or administrative imports when we are onboarding historical records into the platform.',
    ],
  },
  {
    title: 'How we use your data',
    body: [
      'We use your personal data to process donations, create and maintain donor accounts, provide donation history and impact reporting, respond to inquiries, and secure access to authenticated parts of the platform.',
      'We use limited operational data to administer the website, detect misuse, troubleshoot errors, and improve accessibility, performance, and reliability.',
      'We do not use resident-sensitive information for public fundraising in any identifying way. Public impact content is aggregated or anonymized before display.',
    ],
  },
  {
    title: 'Legal bases for processing',
    body: [
      'We process donor and contact information to perform services you request, including account access, donation management, and support communications.',
      'We process certain data based on legitimate interests, including fraud prevention, platform security, and basic service analytics needed to maintain the website.',
      'Where consent is required, including optional cookie preferences, you may withdraw that consent at any time by updating your browser settings or using our cookie controls.',
    ],
  },
  {
    title: 'How we store and protect data',
    body: [
      'We store website and donation data in secured application and database environments managed by our team and hosting providers. We use role-based access controls, encrypted transport, and restricted administrative access.',
      'We retain donor and operational records only for as long as they are needed for legal, financial, safeguarding, and reporting purposes, or as otherwise required by applicable law.',
      'We review retained records periodically and delete or anonymize data when it is no longer needed for the purposes for which it was collected.',
    ],
  },
  {
    title: 'Who receives data',
    body: [
      'We share data only with service providers and partners who help us operate the platform, process donations, host infrastructure, or meet legal obligations.',
      'We do not sell personal data. We do not publish personally identifying donor or resident information without an appropriate lawful basis and, where relevant, clear consent.',
      'If data is transferred across borders, we use contractual, technical, and organizational safeguards designed to protect that information.',
    ],
  },
  {
    title: 'Your rights',
    body: [
      'Subject to applicable law, you may request access to the personal data we hold about you, ask us to correct inaccurate data, request deletion, restrict processing, object to certain processing, or request portability of your data.',
      'If you created an account, you may also contact us to update your account information or donation-related contact details.',
      'You may lodge a complaint with the relevant supervisory authority if you believe your personal data has been handled unlawfully.',
    ],
  },
  {
    title: 'Cookies and similar technologies',
    body: [
      'We use essential cookies or local-storage equivalents to remember authentication state, cookie preferences, and basic website functionality.',
      'If you accept optional cookies, we may use analytics-oriented measurement features in the future to understand how visitors use the site and improve the experience. You can revisit your choice at any time through the footer cookie settings link.',
      'Disabling cookies in your browser may prevent some parts of the website from functioning correctly.',
    ],
  },
  {
    title: 'Contact and updates',
    body: [
      'If you have questions about this policy or would like to exercise your privacy rights, contact us at info@imarighana.org or by mail at 14 Hope Close, East Legon, Accra, Ghana GA-182-3456.',
      'We may update this Privacy Policy as the platform evolves. When we make material changes, we will update the effective date on this page and publish the revised policy on the website.',
    ],
  },
]

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <PublicNav />

      <section className="bg-brand-charcoal pt-32 pb-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-brand-bronze">
            Privacy Policy
          </p>
          <h1 className="font-serif text-4xl text-white md:text-5xl">
            How Imari: Safe Haven uses personal data
          </h1>
          <p className="mt-5 max-w-2xl text-brand-muted-light leading-relaxed">
            This policy explains what data we collect, why we collect it, how we protect it, and what
            choices you have. It is written for donors, visitors, staff, and partners who interact with the platform.
          </p>
          <p className="mt-4 text-sm text-brand-muted-light">
            Effective date: April 7, 2026
          </p>
        </div>
      </section>

      <section className="bg-brand-cream py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="rounded-2xl border border-brand-border bg-white p-8 shadow-card">
            <div className="mb-10">
              <h2 className="font-serif text-2xl text-brand-charcoal mb-3">Summary</h2>
              <p className="text-sm leading-relaxed text-brand-muted">
                Imari: Safe Haven operates a donor and case-support platform for a humanitarian nonprofit.
                We collect only the information needed to process donations, administer accounts, operate the
                website, and safeguard sensitive data. Public impact content is anonymized or aggregated.
              </p>
            </div>

            <div className="space-y-10">
              {sections.map((section) => (
                <section key={section.title}>
                  <h3 className="font-serif text-2xl text-brand-charcoal mb-3">{section.title}</h3>
                  <div className="space-y-3">
                    {section.body.map((paragraph) => (
                      <p key={paragraph} className="text-sm leading-relaxed text-brand-muted">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  )
}
