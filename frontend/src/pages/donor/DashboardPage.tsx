import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  CreditCard, Settings, Sparkles,
  ChevronLeft, LogOut, Heart,
  Globe, Home, BookOpen, ChevronRight, LoaderCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { clearAuthSession, getStoredAuthUser } from '@/lib/auth'
import Modal from '@/components/ui/Modal'
import { createDonorDonation, getDonorDashboard, type DonorDashboardData } from '@/lib/donor'
import { convertPhpToUsd, convertUsdToPhp, formatCurrency, formatDate, formatUsdFromPhp, initials } from '@/lib/formatters'

const navItems = [
  { label: 'My Impact', icon: Sparkles, key: 'impact' },
  { label: 'Payment History', icon: CreditCard, key: 'history' },
  { label: 'Payment Method', icon: Globe, key: 'payment' },
  { label: 'User Settings', icon: Settings, key: 'settings' },
] as const

interface PaymentHistoryProps {
  donations: DonorDashboardData['recentDonations']
}

function PaymentHistory({ donations }: PaymentHistoryProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Payment History</h2>
      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-stone">
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Date</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Amount</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Campaign</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Allocation</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {donations.map((donation) => (
              <tr key={donation.donationId} className="border-b border-brand-border last:border-0 hover:bg-brand-cream transition-colors">
                <td className="px-5 py-3.5 text-brand-charcoal">{formatDate(donation.date, 'short')}</td>
                <td className="px-5 py-3.5 font-semibold text-brand-charcoal">
                  {formatUsdFromPhp(donation.amount)}
                </td>
                <td className="px-5 py-3.5 text-brand-muted">{donation.campaign}</td>
                <td className="px-5 py-3.5 text-brand-muted">General Programs</td>
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-teal-muted text-brand-teal">
                    {donation.status}
                  </span>
                </td>
              </tr>
            ))}
            {donations.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-8 text-center text-brand-muted">
                  No donations have been recorded for this account yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function PaymentMethod() {
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-6">Payment Method</h2>
      <div className="max-w-md space-y-4">
        <div className="bg-white rounded-xl border border-brand-border p-5">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-brand-charcoal">Payment profile</span>
            <span className="text-xs bg-brand-teal-muted text-brand-teal px-2 py-0.5 rounded-full font-medium">Demo</span>
          </div>
          <p className="text-brand-muted text-sm">
            Payment method management is not connected yet. Donation history and donor identity are now pulled from the backend.
          </p>
        </div>
      </div>
    </div>
  )
}

interface UserSettingsProps {
  profile: DonorDashboardData['profile']
}

function UserSettings({ profile }: UserSettingsProps) {
  return (
    <div className="animate-fade-in">
      <h2 className="font-serif text-2xl text-brand-charcoal mb-6">User Settings</h2>
      <div className="max-w-xl space-y-6">
        {[
          { label: 'First Name', value: profile.firstName ?? '—' },
          { label: 'Last Name', value: profile.lastName ?? '—' },
          { label: 'Email', value: profile.email ?? '—' },
          { label: 'Phone', value: profile.phone ?? '—' },
          { label: 'Country', value: profile.country ?? '—' },
          { label: 'Region', value: profile.region ?? '—' },
        ].map(({ label, value }) => (
          <div key={label}>
            <label className="block text-xs font-semibold text-brand-muted uppercase tracking-wider mb-1.5">
              {label}
            </label>
            <input
              type="text"
              value={value}
              disabled
              className="w-full px-4 py-2.5 border border-brand-border rounded-lg text-brand-charcoal text-sm bg-white"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

interface ImpactViewProps {
  data: DonorDashboardData
}

function ImpactView({ data }: ImpactViewProps) {
  const [view, setView] = useState<'personal' | 'total'>('personal')

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center gap-1 p-1 bg-brand-stone rounded-lg w-fit">
        {(['personal', 'total'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={cn(
              'px-5 py-1.5 rounded-md text-sm font-medium transition-all',
              view === v
                ? 'bg-white text-brand-charcoal shadow-card'
                : 'text-brand-muted hover:text-brand-charcoal',
            )}
          >
            {v === 'personal' ? 'My Impact' : 'Total Impact'}
          </button>
        ))}
      </div>

      {view === 'personal' ? <PersonalImpact data={data} /> : <TotalImpact data={data} />}
    </div>
  )
}

function PersonalImpact({ data }: ImpactViewProps) {
  const { profile, summary, monthlyGiving, recentDonations } = data

  const personalAllocation = useMemo(() => {
    const total = summary.totalGiven || 0
    const slices = [
      { category: 'Safe Housing', pct: 40, icon: Home, color: '#2D8A8A' },
      { category: 'Trauma Counseling', pct: 30, icon: Heart, color: '#92642A' },
      { category: 'Education & Training', pct: 20, icon: BookOpen, color: '#6B8F71' },
      { category: 'Operations', pct: 10, icon: Settings, color: '#A8A29E' },
    ]

    return slices.map((slice) => ({
      ...slice,
      amount: Math.round((total * slice.pct) / 100),
    }))
  }, [summary.totalGiven])

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #92642A 0%, #B8864A 100%)' }}>
        <div className="absolute -right-12 -top-12 w-48 h-48 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} aria-hidden="true" />
        <div className="absolute right-8 bottom-0 w-24 h-24 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.5)' }} aria-hidden="true" />
        <p className="text-white/80 text-sm font-medium mb-2">Welcome, {profile.firstName ?? profile.displayName}</p>
        <h2 className="font-serif text-3xl md:text-4xl text-white leading-snug mb-1">
          Thanks to your contributions of
          <br />
          <span className="text-white font-bold">{formatUsdFromPhp(summary.totalGiven)}</span>
        </h2>
        <p className="text-white/90 text-lg mt-3">
          you have helped support
          {' '}
          <span className="font-bold text-2xl">{summary.residentsHelpedEstimate} residents</span>
        </p>

        <div className="grid grid-cols-3 gap-4 mt-8">
          {[
            { label: 'Total Donated', value: formatUsdFromPhp(summary.totalGiven) },
            { label: 'Donations Made', value: String(summary.donationCount) },
            { label: 'Sessions Funded', value: String(summary.counselingSessionsFunded) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white/15 rounded-xl p-3 text-center">
              <p className="text-white font-bold text-xl">{value}</p>
              <p className="text-white/70 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Your Giving History</h3>
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={monthlyGiving} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="donorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#92642A" stopOpacity={0.15} />
                <stop offset="95%" stopColor="#92642A" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${Math.round(convertPhpToUsd(Number(v)) / 1000)}k`} />
            <Tooltip
              contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }}
              formatter={(v: number) => [formatUsdFromPhp(v), 'Donated']}
            />
            <Area type="monotone" dataKey="amount" stroke="#92642A" strokeWidth={2} fill="url(#donorGradient)" dot={{ r: 3, fill: '#92642A' }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-1">Estimated program allocation</h3>
        <p className="text-brand-muted text-sm mb-5">This is a donor-facing estimate based on current program mix.</p>
        <div className="space-y-3">
          {personalAllocation.map(({ category, amount, pct, icon: Icon, color }) => (
            <div key={category}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center" style={{ backgroundColor: `${color}20` }}>
                    <Icon className="w-3.5 h-3.5" style={{ color }} />
                  </div>
                  <span className="text-sm text-brand-charcoal font-medium">{category}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-brand-muted">{formatUsdFromPhp(amount)}</span>
                  <span className="text-xs text-brand-muted w-8 text-right">{pct}%</span>
                </div>
              </div>
              <div className="h-2 bg-brand-stone rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border overflow-hidden">
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between">
          <h3 className="font-semibold text-brand-charcoal">Recent Donations</h3>
          <Link to="/donor/donations" className="text-xs text-brand-bronze font-medium hover:underline flex items-center gap-0.5">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border bg-brand-stone/50">
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Date</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Amount</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Allocation</th>
              <th className="text-left px-5 py-3 text-brand-muted font-medium text-xs">Date Used</th>
            </tr>
          </thead>
          <tbody>
            {recentDonations.map((donation) => (
              <tr key={donation.donationId} className="border-b border-brand-border last:border-0 hover:bg-brand-cream transition-colors">
                <td className="px-5 py-3 text-brand-charcoal">{formatDate(donation.date, 'short')}</td>
                <td className="px-5 py-3 font-semibold text-brand-charcoal">{formatUsdFromPhp(donation.amount)}</td>
                <td className="px-5 py-3 text-brand-muted">{donation.campaign}</td>
                <td className="px-5 py-3 text-brand-muted">{formatDate(donation.date, 'short')}</td>
              </tr>
            ))}
            {recentDonations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-5 py-8 text-center text-brand-muted">
                  No donations have been recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="text-center py-4">
        <Link to="/donate" className="inline-flex items-center gap-2 px-8 py-3 bg-brand-bronze text-white font-semibold rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze text-sm">
          <Heart className="w-4 h-4" />
          Make a Donation
        </Link>
      </div>
    </div>
  )
}

function TotalImpact({ data }: ImpactViewProps) {
  const impact = data.organizationImpact
  const orgStats = [
    {
      label: 'Active Supporters',
      value: String(impact.activeSupporters),
      sub: 'currently in database',
      color: '#2D8A8A',
    },
    {
      label: 'Monetary Donors',
      value: String(impact.activeMonetaryDonors),
      sub: 'active donor records',
      color: '#92642A',
    },
    {
      label: 'Recurring Donors',
      value: String(impact.recurringDonors),
      sub: 'repeat contributors',
      color: '#6B8F71',
    },
    {
      label: 'Total Contributions',
      value: formatUsdFromPhp(impact.totalContributionValue),
      sub: 'recorded donation value',
      color: '#7899C0',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="rounded-2xl p-8" style={{ background: 'linear-gradient(135deg, #1C1917 0%, #2C2420 100%)' }}>
        <p className="text-brand-bronze text-xs font-semibold uppercase tracking-widest mb-3">Imari: Safe Haven · Ghana</p>
        <h2 className="font-serif text-3xl text-white mb-2">
          Here is the real donor-side impact reflected in the current database.
        </h2>
        <p className="text-white/70 text-sm">
          These figures are aggregated from supporter and donation records, not mock values.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          {orgStats.map(({ label, value, sub, color }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4 text-center">
              <p className="font-bold text-2xl text-white" style={{ color }}>{value}</p>
              <p className="text-white/80 text-xs font-medium mt-0.5">{label}</p>
              <p className="text-white/50 text-xs">{sub}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Donor Activity Over Time</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={impact.monthlyTrends} margin={{ top: 0, right: 0, left: -20, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
            <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }}
              formatter={(value: number, name: string) => {
                if (name === 'Donation Value') {
                  return [formatUsdFromPhp(value), name]
                }
                return [value, name]
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: '#78716C' }} />
            <Bar dataKey="totalAmount" name="Donation Value" fill="#2D8A8A" radius={[3, 3, 0, 0]} />
            <Bar dataKey="donorCount" name="Donors Giving" fill="#92642A" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {[
          {
            label: 'Donation Events',
            stat: String(impact.donationEvents),
            sub: 'recorded gifts',
            color: '#2D8A8A',
            icon: Heart,
          },
          {
            label: 'Average Gift',
            stat: formatUsdFromPhp(impact.averageGiftAmount),
            sub: 'across all donations',
            color: '#92642A',
            icon: CreditCard,
          },
          {
            label: 'Top Campaign',
            stat: impact.campaignBreakdown[0]?.label ?? 'Direct Giving',
            sub: impact.campaignBreakdown[0]
              ? `${formatUsdFromPhp(impact.campaignBreakdown[0].totalAmount)} raised`
              : 'no campaign data yet',
            color: '#6B8F71',
            icon: BookOpen,
          },
        ].map(({ label, stat, sub, color, icon: Icon }) => (
          <div key={label} className="bg-white rounded-xl border border-brand-border p-5">
            <div className="w-9 h-9 rounded-full flex items-center justify-center mb-3" style={{ backgroundColor: `${color}20` }}>
              <Icon className="w-4.5 h-4.5" style={{ color }} />
            </div>
            <p className="text-xs text-brand-muted font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className="font-serif text-2xl text-brand-charcoal">{stat}</p>
            <p className="text-brand-muted text-xs mt-0.5">{sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-brand-border p-6">
        <h3 className="font-semibold text-brand-charcoal mb-4">Top Campaigns by Donation Value</h3>
        <div className="space-y-3">
          {impact.campaignBreakdown.map((campaign) => (
            <div key={campaign.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm text-brand-charcoal font-medium">{campaign.label}</span>
                <div className="text-right">
                  <div className="text-sm text-brand-charcoal font-semibold">
                    {formatUsdFromPhp(campaign.totalAmount)}
                  </div>
                  <div className="text-xs text-brand-muted">
                    {campaign.donationCount} donations
                  </div>
                </div>
              </div>
              <div className="h-2 bg-brand-stone rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-bronze"
                  style={{
                    width: impact.totalContributionValue > 0
                      ? `${Math.max(8, (campaign.totalAmount / impact.totalContributionValue) * 100)}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          ))}
          {impact.campaignBreakdown.length === 0 && (
            <p className="text-sm text-brand-muted">No campaign-linked donations are available yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default function DonorPortalPage() {
  const navigate = useNavigate()
  const authUser = getStoredAuthUser()
  const [activeNav, setActiveNav] = useState<string>('impact')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [data, setData] = useState<DonorDashboardData | null>(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isDonationModalOpen, setIsDonationModalOpen] = useState(false)
  const [donationAmount, setDonationAmount] = useState('100')
  const [campaignName, setCampaignName] = useState('')
  const [isRecurring, setIsRecurring] = useState(false)
  const [donationError, setDonationError] = useState('')
  const [isSubmittingDonation, setIsSubmittingDonation] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadDashboard() {
      try {
        setIsLoading(true)
        const dashboard = await getDonorDashboard()
        if (!cancelled) {
          setData(dashboard)
          setError('')
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Unable to load donor dashboard.')
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false)
        }
      }
    }

    loadDashboard()
    return () => {
      cancelled = true
    }
  }, [])

  async function loadDashboardData() {
    const dashboard = await getDonorDashboard()
    setData(dashboard)
    setError('')
  }

  function handleSignOut() {
    clearAuthSession()
    localStorage.removeItem('lighthouse_role')
    navigate('/login')
  }

  async function handleDonationSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setDonationError('')

    const amountUsd = Number(donationAmount)
    if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
      setDonationError('Enter a valid donation amount.')
      return
    }

    try {
      setIsSubmittingDonation(true)
      await createDonorDonation({
        amount: Math.round(convertUsdToPhp(amountUsd)),
        isRecurring,
        campaignName: campaignName.trim() || undefined,
      })
      await loadDashboardData()
      setIsDonationModalOpen(false)
      setDonationAmount('100')
      setCampaignName('')
      setIsRecurring(false)
    } catch (err) {
      setDonationError(err instanceof Error ? err.message : 'Unable to process donation right now.')
    } finally {
      setIsSubmittingDonation(false)
    }
  }

  function renderContent() {
    if (!data) return null

    switch (activeNav) {
      case 'impact': return <ImpactView data={data} />
      case 'history': return <PaymentHistory donations={data.recentDonations} />
      case 'payment': return <PaymentMethod />
      case 'settings': return <UserSettings profile={data.profile} />
      default: return <ImpactView data={data} />
    }
  }

  const currentItem = navItems.find((n) => n.key === activeNav)
  const displayName = data?.profile.displayName ?? authUser?.displayName ?? 'Donor'
  const firstName = data?.profile.firstName ?? displayName.split(' ')[0]
  const avatarLabel = data ? initials(data.profile.displayName) : initials(displayName)

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Modal open={isDonationModalOpen} onClose={() => setIsDonationModalOpen(false)} title="Make a Donation">
        <form onSubmit={handleDonationSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-1.5">Donation amount (USD)</label>
            <input
              type="number"
              min="1"
              step="1"
              value={donationAmount}
              onChange={(e) => setDonationAmount(e.target.value)}
              className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
            />
            <p className="mt-2 text-xs text-brand-muted">
              This is displayed in USD and stored internally as PHP for reporting consistency.
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-brand-charcoal mb-1.5">Campaign name</label>
            <input
              type="text"
              value={campaignName}
              onChange={(e) => setCampaignName(e.target.value)}
              placeholder="Optional campaign name"
              className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/30 focus:border-brand-bronze"
            />
          </div>

          <label className="flex items-center gap-3 rounded-lg border border-brand-border bg-brand-stone px-4 py-3 text-sm text-brand-charcoal">
            <input
              type="checkbox"
              checked={isRecurring}
              onChange={(e) => setIsRecurring(e.target.checked)}
              className="h-4 w-4 rounded border-brand-border"
            />
            Make this a recurring monthly gift
          </label>

          {donationError && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {donationError}
            </div>
          )}

          <div className="rounded-lg border border-brand-border bg-brand-cream px-4 py-3 text-sm text-brand-muted">
            You are about to create a fake donor payment for demo purposes:
            {' '}
            <span className="font-semibold text-brand-charcoal">{formatCurrency(Number(donationAmount) || 0, 'USD')}</span>
            {isRecurring ? ' per month' : ''}.
          </div>

          <button
            type="submit"
            disabled={isSubmittingDonation}
            className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-bronze-light disabled:opacity-70"
          >
            {isSubmittingDonation ? 'Processing donation...' : 'Submit Donation'}
          </button>
        </form>
      </Modal>

      <header className="h-14 bg-white border-b border-brand-border flex items-center justify-between px-4 sm:px-6 z-20 sticky top-0">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-lg">🕊️</span>
          <div className="flex flex-col leading-none">
            <span className="font-semibold text-brand-charcoal text-sm tracking-tight">Imari</span>
            <span className="text-[9px] text-brand-muted tracking-widest uppercase">Safe Haven</span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-1" aria-label="Donor portal navigation">
          {(['Home', 'About', 'Learn More'] as const).map((label) => (
            <Link
              key={label}
              to={label === 'Home' ? '/' : `/${label.toLowerCase().replace(' ', '-')}`}
              className="px-4 py-1.5 text-sm text-brand-charcoal hover:text-brand-bronze transition-colors"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <button type="button" onClick={handleSignOut} className="text-sm text-brand-muted hover:text-brand-charcoal transition-colors">
            Sign out
          </button>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold text-white cursor-pointer select-none"
            style={{ background: 'linear-gradient(135deg, #92642A, #B8864A)' }}
            title={displayName}
          >
            {avatarLabel}
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside
          className={cn(
            'bg-white border-r border-brand-border flex flex-col shrink-0 transition-all duration-300',
            sidebarCollapsed ? 'w-14' : 'w-56',
          )}
        >
          <div className={cn('flex items-center border-b border-brand-border py-3', sidebarCollapsed ? 'justify-center px-2' : 'justify-between px-4')}>
            {!sidebarCollapsed && (
              <span className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
                Donor Menu
              </span>
            )}
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="p-1 rounded text-brand-muted hover:text-brand-charcoal hover:bg-brand-stone transition-colors"
              aria-label={sidebarCollapsed ? 'Expand menu' : 'Collapse menu'}
            >
              <ChevronLeft className={cn('w-4 h-4 transition-transform', sidebarCollapsed && 'rotate-180')} />
            </button>
          </div>

          <nav className="flex-1 py-2 px-2 space-y-0.5">
            {navItems.map(({ label, icon: Icon, key }) => (
              <button
                key={key}
                onClick={() => setActiveNav(key)}
                className={cn(
                  'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left',
                  sidebarCollapsed && 'justify-center',
                  activeNav === key
                    ? 'bg-brand-bronze-muted text-brand-bronze font-medium'
                    : 'text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal',
                )}
                title={sidebarCollapsed ? label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!sidebarCollapsed && <span>{label}</span>}
              </button>
            ))}
          </nav>

          <div className="border-t border-brand-border px-2 py-2">
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(
                'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-brand-muted hover:bg-brand-stone hover:text-brand-charcoal transition-colors',
                sidebarCollapsed && 'justify-center',
              )}
              title={sidebarCollapsed ? 'Sign out' : undefined}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {!sidebarCollapsed && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        <main className="flex-1 overflow-auto bg-brand-cream">
          <div className="max-w-4xl mx-auto px-6 py-8">
            {isLoading && (
              <div className="rounded-xl border border-brand-border bg-white px-6 py-16 text-center">
                <LoaderCircle className="w-6 h-6 animate-spin mx-auto text-brand-bronze mb-3" />
                <p className="text-brand-muted">Loading your donor dashboard…</p>
              </div>
            )}

            {!isLoading && error && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-6 py-8 text-center">
                <p className="text-rose-700 font-medium mb-2">{error}</p>
                <p className="text-rose-600 text-sm">Make sure you are signed in as a donor account with a linked supporter record.</p>
              </div>
            )}

            {!isLoading && !error && data && (
              <>
                {activeNav === 'impact' && (
                  <div className="mb-6">
                    <h1 className="font-serif text-3xl text-brand-charcoal">
                      Welcome, {firstName}
                    </h1>
                    <p className="text-brand-muted mt-1 text-sm">
                      Here is a summary of your impact and giving activity with Imari: Safe Haven.
                    </p>
                  </div>
                )}

                {activeNav !== 'impact' && (
                  <div className="mb-6 flex items-center gap-2">
                    {currentItem && <currentItem.icon className="w-5 h-5 text-brand-bronze" />}
                    <h1 className="font-serif text-2xl text-brand-charcoal">{currentItem?.label}</h1>
                  </div>
                )}

                {renderContent()}
              </>
            )}
          </div>
        </main>
      </div>

      {!isLoading && !error && data && (
        <div className="pointer-events-none fixed bottom-5 right-5 z-40">
          <button
            type="button"
            onClick={() => setIsDonationModalOpen(true)}
            className="pointer-events-auto inline-flex items-center gap-2 rounded-full bg-brand-bronze px-5 py-3 text-sm font-semibold text-white shadow-2xl transition-colors hover:bg-brand-bronze-light"
          >
            <Heart className="h-4 w-4" />
            Make a Donation
          </button>
        </div>
      )}
    </div>
  )
}
