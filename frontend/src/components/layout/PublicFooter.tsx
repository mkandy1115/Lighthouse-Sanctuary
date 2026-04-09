import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, Linkedin } from 'lucide-react'
import { openCookiePreferences } from '@/lib/cookies'

const programLinks = [
  { label: 'Residential Safe Homes', to: '/programs' },
  { label: 'Trauma-Focused Counseling', to: '/programs' },
  { label: 'Education & Reintegration', to: '/programs' },
  { label: 'Livelihood & Vocational', to: '/programs' },
]

const involvedLinks = [
  { label: 'Make a Donation', to: '/donate' },
  { label: 'Partner With Us', to: '/contact' },
  { label: 'Volunteer', to: '/contact' },
  { label: 'Refer a Case', to: '/contact' },
]

export default function PublicFooter() {
  return (
    <footer className="bg-brand-charcoal text-white" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Col 1 — About */}
          <div>
            <div className="mb-4 flex items-center gap-2.5">
              <img src="/imari-icon.svg" alt="" className="h-10 w-10" />
              <div>
                <div className="font-semibold text-lg text-white">Imari</div>
                <div className="text-[10px] text-brand-muted-light tracking-widest uppercase mt-0.5">
                  Safe Haven
                </div>
              </div>
            </div>
            <p className="text-sm text-brand-muted-light leading-relaxed mb-5">
              Providing sanctuary, counseling, and holistic support to survivors of trafficking
              and displacement across the Ghana region of Africa. Every person deserves dignity,
              safety, and a path forward.
            </p>
            <address className="not-italic space-y-2 text-sm text-brand-muted-light">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-brand-bronze" aria-hidden="true" />
                <span>14 Hope Close, East Legon,<br />Accra, Ghana GA-182-3456</span>
              </div>
            </address>
          </div>

          {/* Col 2 — Programs */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Programs
            </h3>
            <ul className="space-y-2.5" role="list">
              {programLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-brand-muted-light hover:text-brand-bronze-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-bronze rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Get Involved */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Get Involved
            </h3>
            <ul className="space-y-2.5" role="list">
              {involvedLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    to={link.to}
                    className="text-sm text-brand-muted-light hover:text-brand-bronze-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-bronze rounded"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Contact */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-widest mb-4">
              Contact
            </h3>
            <div className="space-y-2.5 text-sm text-brand-muted-light mb-6">
              <a
                href="mailto:info@imarighana.org"
                className="flex items-center gap-2 hover:text-brand-bronze-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-bronze rounded"
              >
                <Mail className="w-4 h-4 shrink-0 text-brand-bronze" aria-hidden="true" />
                info@imarighana.org
              </a>
              <a
                href="tel:+233302123456"
                className="flex items-center gap-2 hover:text-brand-bronze-light transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-bronze rounded"
              >
                <Phone className="w-4 h-4 shrink-0 text-brand-bronze" aria-hidden="true" />
                +233 (0) 30 212 3456
              </a>
            </div>

            {/* Social icons */}
            <div>
              <p className="text-xs text-brand-muted-light uppercase tracking-widest mb-3">Follow Us</p>
              <div className="flex items-center gap-3">
                {[
                  { Icon: Facebook, href: '#', label: 'Facebook' },
                  { Icon: Twitter, href: '#', label: 'Twitter / X' },
                  { Icon: Instagram, href: '#', label: 'Instagram' },
                  { Icon: Linkedin, href: '#', label: 'LinkedIn' },
                ].map(({ Icon, href, label }) => (
                  <a
                    key={label}
                    href={href}
                    aria-label={`Imari on ${label}`}
                    className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-brand-muted-light hover:text-white hover:border-brand-bronze transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand-bronze"
                  >
                    <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-brand-muted-light">
          <p>© 2025 Imari: Safe Haven. All rights reserved. Registered NGO — Ghana.</p>
          <div className="flex items-center gap-4">
            <Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <button type="button" onClick={openCookiePreferences} className="hover:text-white transition-colors">
              Cookie Settings
            </button>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
