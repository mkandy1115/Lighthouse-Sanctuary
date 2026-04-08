import { useState, useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { RoleContext } from '@/App'
import type { UserRole } from '@/hooks/useRole'
import { LayoutDashboard, Users, ShieldCheck, Check } from 'lucide-react'

const tabs = ['Profile', 'Notifications', 'Security', 'Demo Controls']

const demoRoles: {
  value: UserRole
  label: string
  subtitle: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  color: string
  path: string
}[] = [
  {
    value: 'staff',
    label: 'Staff Portal',
    subtitle: 'Current role',
    description: 'Case management, counseling sessions, home visits, interventions, and staff reporting.',
    icon: Users,
    color: 'border-brand-teal bg-brand-teal-muted',
    path: '/staff',
  },
  {
    value: 'donor',
    label: 'Donor Portal',
    subtitle: 'External user',
    description: 'Personal impact dashboard, donation history, campaign support, and messaging.',
    icon: LayoutDashboard,
    color: 'border-brand-bronze bg-brand-bronze-muted',
    path: '/donor',
  },
  {
    value: 'admin',
    label: 'Manager Console',
    subtitle: 'Administrative',
    description: 'OKR tracking, participant overview, donor management, user administration, and analytics.',
    icon: ShieldCheck,
    color: 'border-slate-400 bg-slate-50',
    path: '/admin',
  },
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('Profile')
  const [saved, setSaved] = useState(false)
  const { role, setRole } = useContext(RoleContext)
  const navigate = useNavigate()

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function switchTo(r: UserRole, path: string) {
    setRole(r)
    navigate(path)
  }

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Settings</h1>
        <p className="text-brand-muted text-sm mt-1">Manage your account, preferences, and demo navigation</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-brand-stone rounded-lg p-1 mb-6 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-md text-sm font-medium whitespace-nowrap transition-all ${
              activeTab === tab
                ? 'bg-white text-brand-charcoal shadow-sm'
                : 'text-brand-muted hover:text-brand-charcoal'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* ── Profile ──────────────────────────────────────────────────────── */}
      {activeTab === 'Profile' && (
        <div className="space-y-5">
          {saved && (
            <div className="flex items-center gap-2 bg-brand-teal-muted border border-brand-teal/20 rounded-lg px-4 py-3 text-sm text-brand-teal font-medium">
              <Check className="w-4 h-4" />
              Profile saved successfully.
            </div>
          )}
          <section className="bg-white border border-brand-border rounded-xl p-6">
            <h2 className="font-semibold text-brand-charcoal mb-5">Personal Information</h2>
            <div className="grid sm:grid-cols-2 gap-4 mb-5">
              {[
                { label: 'First Name', value: 'Ana', type: 'text' },
                { label: 'Last Name', value: 'Reyes', type: 'text' },
                { label: 'Email', value: 'ana.reyes@imarighana.org', type: 'email' },
                { label: 'Role', value: 'Social Worker', type: 'text' },
                { label: 'Department', value: 'Case Management', type: 'text' },
                { label: 'Phone', value: 'Staff contact line', type: 'tel' },
              ].map(({ label, value, type }) => (
                <div key={label}>
                  <label className="block text-xs font-medium text-brand-muted mb-1">{label}</label>
                  <input
                    type={type}
                    defaultValue={value}
                    className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
                  />
                </div>
              ))}
            </div>
            <button
              onClick={handleSave}
              className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
            >
              Save Changes
            </button>
          </section>
        </div>
      )}

      {/* ── Notifications ────────────────────────────────────────────────── */}
      {activeTab === 'Notifications' && (
        <section className="bg-white border border-brand-border rounded-xl p-6">
          <h2 className="font-semibold text-brand-charcoal mb-5">Notification Preferences</h2>
          <div className="space-y-4">
            {[
              { label: 'Email me when a case is assigned to me', defaultChecked: true },
              { label: 'Email me when a home visit is overdue', defaultChecked: true },
              { label: 'Weekly summary digest', defaultChecked: false },
              { label: 'Notify me when a donor makes a major gift', defaultChecked: true },
              { label: 'System maintenance alerts', defaultChecked: true },
              { label: 'New campaign milestone alerts', defaultChecked: false },
            ].map(({ label, defaultChecked }) => (
              <label key={label} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked={defaultChecked}
                  className="w-4 h-4 rounded border-brand-border text-brand-bronze focus:ring-brand-bronze"
                />
                <span className="text-sm text-brand-charcoal">{label}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleSave}
            className="mt-6 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
          >
            Save Preferences
          </button>
        </section>
      )}

      {/* ── Security ─────────────────────────────────────────────────────── */}
      {activeTab === 'Security' && (
        <section className="bg-white border border-brand-border rounded-xl p-6">
          <h2 className="font-semibold text-brand-charcoal mb-5">Change Password</h2>
          <div className="space-y-4 max-w-sm">
            {['Current Password', 'New Password', 'Confirm New Password'].map((l) => (
              <div key={l}>
                <label className="block text-xs font-medium text-brand-muted mb-1">{l}</label>
                <input
                  type="password"
                  className="w-full border border-brand-border rounded-lg px-3 py-2.5 text-sm bg-white text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
                  placeholder="••••••••"
                />
              </div>
            ))}
            <button className="bg-brand-charcoal text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
              Update Password
            </button>
          </div>
        </section>
      )}

      {/* ── Demo Controls ────────────────────────────────────────────────── */}
      {activeTab === 'Demo Controls' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            <span className="font-semibold">Demo mode:</span> Use these cards to navigate between portals during stakeholder walkthroughs.
          </div>
          {demoRoles.map(({ value, label, subtitle, description, icon: Icon, color, path }) => {
            const isActive = role === value
            return (
              <div
                key={value}
                className={`rounded-xl border-2 p-5 transition-all ${
                  isActive ? color : 'border-brand-border bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-brand-stone flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-charcoal" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-brand-charcoal">{label}</p>
                      {isActive && (
                        <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-brand-teal-muted text-brand-teal">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-brand-muted mb-3">{subtitle}</p>
                    <p className="text-sm text-brand-muted leading-relaxed">{description}</p>
                  </div>
                </div>
                {!isActive && (
                  <div className="mt-4 pt-4 border-t border-brand-border">
                    <button
                      onClick={() => switchTo(value, path)}
                      className="text-sm font-semibold text-brand-bronze hover:text-brand-charcoal transition-colors"
                    >
                      Switch to {label} →
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
