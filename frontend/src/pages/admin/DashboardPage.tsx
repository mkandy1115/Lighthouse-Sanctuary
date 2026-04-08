import { useEffect, useMemo, useState } from 'react'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts'
import {
  TrendingUp, Users, Heart, AlertTriangle, CheckCircle, BarChart2, ClipboardList, CalendarClock, Shield,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatNumber, formatPercent, formatUsdFromPhp, formatDate } from '@/lib/formatters'
import {
  getAdminDashboard,
  getMlInsights,
  getReportsSummary,
  refreshMlInsights,
  type AdminDashboardResponse,
  type MlInsightsResponse,
  type ReportsSummaryResponse,
} from '@/lib/staff'

interface AdminDashboardData {
  dashboard: AdminDashboardResponse
  reports: ReportsSummaryResponse
  ml: MlInsightsResponse
}

function monthLabel(value: string): string {
  if (!value) return '—'
  const date = new Date(`${value}-01T00:00:00`)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString('en-US', { month: 'short' })
}

function numberFromRecord(record: Record<string, unknown>, key: string): number {
  return Number(record[key] ?? 0)
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<AdminDashboardData | null>(null)
  const [loadError, setLoadError] = useState('')
  const [mlError, setMlError] = useState('')
  const [refreshingMl, setRefreshingMl] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const [dashboard, reports, ml] = await Promise.all([
          getAdminDashboard(),
          getReportsSummary(),
          getMlInsights(),
        ])
        setData({ dashboard, reports, ml })
        setLoadError('')
      } catch (err) {
        setLoadError(err instanceof Error ? err.message : 'Unable to load admin dashboard.')
      }
    }

    load()
  }, [])

  const derived = useMemo(() => {
    if (!data) return null

    const residentTrend = [...data.dashboard.safehouseMetrics]
      .slice()
      .reverse()
      .map((metric) => {
        const row = metric as Record<string, unknown>
        return {
          month: String(row.monthStart ?? '').slice(0, 7),
          active: numberFromRecord(row, 'activeResidents'),
          support: numberFromRecord(row, 'homeVisitationCount'),
        }
      })

    const donorTrend = data.reports.donationsByMonth.slice(-6).map((month) => ({
      month: monthLabel(month.month),
      raised: Number(month.raised ?? 0),
      donors: Number(month.donors ?? 0),
    }))

    const latestMetrics = data.dashboard.safehouseMetrics[0] as Record<string, unknown> | undefined
    const totalRaised = data.reports.donationsByMonth.reduce((sum, month) => sum + Number(month.raised ?? 0), 0)
    const totalDonors = donorTrend.length > 0 ? donorTrend[donorTrend.length - 1].donors : 0
    const conferenceCount = data.dashboard.upcomingCaseConferences.length
    const reintegrationRate = data.reports.reintegration.totalTracked > 0
      ? (data.reports.reintegration.completed / data.reports.reintegration.totalTracked) * 100
      : 0

    const okrs = [
      {
        key: 'residents',
        label: 'Active Residents',
        value: data.dashboard.activeResidents,
        unit: 'residents',
        pct: Math.min((data.dashboard.activeResidents / 120) * 100, 100),
        target: 120,
        trendLabel: 'current caseload',
        status: 'on-track' as const,
        icon: Users,
        color: '#2D8A8A',
        bgColor: '#D4EEEE',
      },
      {
        key: 'donors',
        label: 'Recent Donor Activity',
        value: totalDonors,
        unit: 'donors',
        pct: Math.min((totalDonors / 75) * 100, 100),
        target: 75,
        trendLabel: 'latest monthly donors',
        status: 'on-track' as const,
        icon: Heart,
        color: '#92642A',
        bgColor: '#F0E6D3',
      },
      {
        key: 'reintegration',
        label: 'Reintegration Progress',
        value: Math.round(reintegrationRate),
        unit: '%',
        pct: reintegrationRate,
        target: 100,
        trendLabel: `${data.reports.reintegration.completed}/${data.reports.reintegration.totalTracked} tracked`,
        status: reintegrationRate >= 60 ? 'on-track' as const : 'needs-attention' as const,
        icon: Shield,
        color: reintegrationRate >= 60 ? '#6B8F71' : '#EA580C',
        bgColor: reintegrationRate >= 60 ? '#E7F6EA' : '#FEF3C7',
      },
    ]

    const programOutcomeData = [
      {
        category: 'Education',
        achieved: Number(latestMetrics?.avgEducationProgress ?? 0),
        target: 80,
      },
      {
        category: 'Health',
        achieved: Number(latestMetrics?.avgHealthScore ?? 0) * 20,
        target: 85,
      },
      {
        category: 'Home Visits',
        achieved: Math.min(numberFromRecord(latestMetrics ?? {}, 'homeVisitationCount') * 10, 100),
        target: 70,
      },
      {
        category: 'Process Notes',
        achieved: Math.min(numberFromRecord(latestMetrics ?? {}, 'processRecordingCount') * 5, 100),
        target: 75,
      },
    ]

    const commandMix = [
      { name: 'Safehouses', value: data.dashboard.activeSafehouses, color: '#6B8F71' },
      { name: 'Conferences', value: conferenceCount, color: '#D97706' },
      { name: 'Donations', value: data.dashboard.recentDonations.length, color: '#2D8A8A' },
      { name: 'Reports', value: data.dashboard.safehouseMetrics.length, color: '#7899C0' },
    ]

    const recentActivity = [
      ...data.dashboard.recentDonations.slice(0, 3).map((donation) => {
        const row = donation as Record<string, unknown>
        return {
          time: formatDate(String(row.donationDate ?? ''), 'relative'),
          text: `Donation recorded for ${formatUsdFromPhp(Number(row.amount ?? 0))}${row.campaignName ? ` via ${String(row.campaignName)}` : ''}.`,
        }
      }),
      ...data.dashboard.upcomingCaseConferences.slice(0, 2).map((conference) => {
        const row = conference as Record<string, unknown>
        return {
          time: formatDate(String(row.caseConferenceDate ?? '')),
          text: `Case conference on resident #${String(row.residentId)} for ${String(row.planCategory ?? 'general planning')}.`,
        }
      }),
    ]

    return {
      residentTrend,
      donorTrend,
      okrs,
      programOutcomeData,
      commandMix,
      recentActivity,
      totalRaised,
      conferenceCount,
      reintegrationRate,
      totalTracked: data.reports.reintegration.totalTracked,
      completedTracked: data.reports.reintegration.completed,
      ml: data.ml
    }
  }, [data])

  async function handleRefreshMl() {
    try {
      setRefreshingMl(true)
      await refreshMlInsights()
      const [dashboard, reports, ml] = await Promise.all([
        getAdminDashboard(),
        getReportsSummary(),
        getMlInsights(),
      ])
      setData({ dashboard, reports, ml })
      setMlError('')
    } catch (err) {
      setMlError(err instanceof Error ? err.message : 'Unable to refresh ML insights.')
    } finally {
      setRefreshingMl(false)
    }
  }

  if (loadError) {
    return <div className="py-16 text-center text-rose-700">{loadError}</div>
  }

  if (!data || !derived) {
    return <div className="py-16 text-center text-brand-muted">Loading admin dashboard…</div>
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {mlError ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          <span className="font-semibold">ML refresh did not complete.</span>{' '}
          {mlError} Charts above still show the last loaded data.
        </div>
      ) : null}
      <div className="mb-8">
        <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-brand-teal">Organization Overview</p>
        <h1 className="font-serif text-3xl text-brand-charcoal">Welcome back.</h1>
        <p className="mt-1 text-sm text-brand-muted">
          Here&apos;s how Imari: Safe Haven is performing across operations, donations, and resident progress.
        </p>
        <div className="mt-4 flex items-center gap-3">
          <button
            type="button"
            onClick={handleRefreshMl}
            disabled={refreshingMl}
            className="rounded-lg bg-brand-bronze px-4 py-2 text-xs font-semibold text-white hover:bg-brand-bronze-light disabled:opacity-70"
          >
            {refreshingMl ? 'Refreshing ML scores...' : 'Refresh ML Scores'}
          </button>
          <span className="text-xs text-brand-muted">
            Last refreshed: {derived.ml.lastRefreshedAtUtc ? formatDate(derived.ml.lastRefreshedAtUtc) : 'Not yet scored'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        {derived.okrs.map((okr) => {
          const Icon = okr.icon
          const isGood = okr.status === 'on-track'

          return (
            <div key={okr.key} className="relative overflow-hidden rounded-xl border border-brand-border bg-white p-6">
              <div className="absolute left-0 right-0 top-0 h-1 rounded-t-xl" style={{ backgroundColor: okr.color }} />
              <div className="mb-4 mt-1 flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ backgroundColor: okr.bgColor }}>
                  <Icon className="h-5 w-5" style={{ color: okr.color }} />
                </div>
                <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium', isGood ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600')}>
                  {isGood ? <CheckCircle className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
                  {isGood ? 'On Track' : 'Needs Attention'}
                </span>
              </div>
              <p className="mb-1 text-xs font-medium uppercase tracking-wider text-brand-muted">{okr.label}</p>
              <p className="font-serif text-4xl text-brand-charcoal">
                {okr.value}
                <span className="ml-1 font-sans text-base font-normal text-brand-muted">{okr.unit}</span>
              </p>
              <div className="mb-2 mt-4">
                <div className="mb-1.5 flex justify-between text-xs text-brand-muted">
                  <span>Progress to goal</span>
                  <span>{Math.round(okr.pct)}% of {okr.target}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-brand-stone">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${Math.min(okr.pct, 100)}%`, backgroundColor: okr.color }} />
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5">
                <TrendingUp className="h-3.5 w-3.5 text-green-500" />
                <span className="text-xs font-medium text-brand-muted">{okr.trendLabel}</span>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-brand-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-brand-charcoal">Resident Activity</h3>
              <p className="mt-0.5 text-xs text-brand-muted">Latest safehouse activity snapshots</p>
            </div>
            <BarChart2 className="h-4 w-4 text-brand-muted" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={derived.residentTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="activeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2D8A8A" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2D8A8A" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="supportGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6B8F71" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6B8F71" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={monthLabel} />
              <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="active" name="Active Residents" stroke="#2D8A8A" strokeWidth={2} fill="url(#activeGrad)" dot={{ r: 3, fill: '#2D8A8A' }} />
              <Area type="monotone" dataKey="support" name="Home Visits" stroke="#6B8F71" strokeWidth={2} fill="url(#supportGrad)" dot={{ r: 3, fill: '#6B8F71' }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-brand-charcoal">Fundraising Activity</h3>
              <p className="mt-0.5 text-xs text-brand-muted">Monthly donations and donor count</p>
            </div>
            <TrendingUp className="h-4 w-4 text-brand-bronze" />
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={derived.donorTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${Math.round(value / 1000)}k`} />
              <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} formatter={(value: number, name: string) => name === 'Amount Raised' ? [formatUsdFromPhp(value), name] : [value, name]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="raised" name="Amount Raised" fill="#92642A" radius={[3, 3, 0, 0]} />
              <Bar dataKey="donors" name="Active Donors" fill="#D4EEEE" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-brand-border bg-white p-6 lg:col-span-2">
          <h3 className="mb-1 font-semibold text-brand-charcoal">Program Outcomes vs. Targets</h3>
          <p className="mb-4 text-xs text-brand-muted">Operational measures from the latest reporting window</p>
          <ResponsiveContainer width="100%" height={185}>
            <BarChart data={derived.programOutcomeData} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 10, fill: '#78716C' }} axisLine={false} tickLine={false} tickFormatter={(value) => `${value}%`} />
              <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} width={88} />
              <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} formatter={(value: number) => [`${Math.round(value)}%`]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" name="Target" fill="#E5E3DF" radius={[0, 3, 3, 0]} barSize={8} />
              <Bar dataKey="achieved" name="Achieved" fill="#2D8A8A" radius={[0, 3, 3, 0]} barSize={8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-brand-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-charcoal">Command Center Mix</h3>
            <ResponsiveContainer width="100%" height={130}>
              <PieChart>
                <Pie data={derived.commandMix} cx="50%" cy="50%" innerRadius={36} outerRadius={55} paddingAngle={3} dataKey="value">
                  {derived.commandMix.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ border: '1px solid #E5E3DF', borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-1 grid grid-cols-2 gap-1">
              {derived.commandMix.map(({ name, value, color }) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] text-brand-muted">{name}: <strong className="text-brand-charcoal">{value}</strong></span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-brand-border bg-white p-5">
            <h3 className="mb-3 text-sm font-semibold text-brand-charcoal">Recent Activity</h3>
            <ul className="space-y-2.5">
              {derived.recentActivity.map((activity, index) => (
                <li key={`${activity.time}-${index}`} className="flex gap-2 text-xs">
                  <span className="w-16 shrink-0 text-brand-muted">{activity.time}</span>
                  <span className="leading-relaxed text-brand-charcoal">{activity.text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="rounded-xl border border-brand-border bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-brand-teal-muted p-2">
              <ClipboardList className="h-5 w-5 text-brand-teal" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-muted">Recent Giving</p>
              <p className="font-serif text-2xl text-brand-charcoal">{formatUsdFromPhp(derived.totalRaised)}</p>
            </div>
          </div>
          <p className="text-sm text-brand-muted">Combined monetary donations represented in the reporting data.</p>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-brand-bronze-muted p-2">
              <CalendarClock className="h-5 w-5 text-brand-bronze" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-muted">Upcoming Conferences</p>
              <p className="font-serif text-2xl text-brand-charcoal">{formatNumber(derived.conferenceCount)}</p>
            </div>
          </div>
          <p className="text-sm text-brand-muted">Conference-linked intervention plans currently scheduled for review.</p>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-6">
          <div className="mb-3 flex items-center gap-3">
            <div className="rounded-xl bg-brand-stone p-2">
              <Shield className="h-5 w-5 text-brand-charcoal" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-brand-muted">Reintegration Rate</p>
              <p className="font-serif text-2xl text-brand-charcoal">{formatPercent(derived.reintegrationRate, 0)}</p>
            </div>
          </div>
          <p className="text-sm text-brand-muted">{derived.completedTracked} completed out of {derived.totalTracked} tracked reintegration cases.</p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-xl border border-brand-border bg-white p-6">
          <h3 className="font-semibold text-brand-charcoal">Pipelines 1 &amp; 4 · Donor churn risk and uplift</h3>
          <p className="mt-1 text-xs text-brand-muted">
            Pipeline 1: likelihood a donor will not give again within a year. Pipeline 4: donor-level uplift signal
            (also blended into post-level scores downstream).
          </p>
          <div className="mt-4 max-h-80 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2">Donor</th>
                  <th className="pb-2">Churn (P1)</th>
                  <th className="pb-2">Tier</th>
                  <th className="pb-2">Uplift (P4)</th>
                </tr>
              </thead>
              <tbody>
                {derived.ml.donorPipeline.map((row) => (
                  <tr key={row.supporterId} className="border-b border-brand-border/70">
                    <td className="py-2 pr-2 text-brand-charcoal">{row.donorName}</td>
                    <td className="py-2 pr-2 text-brand-charcoal">
                      {row.churnScore != null ? formatPercent(row.churnScore * 100, 1) : '—'}
                    </td>
                    <td className="py-2 text-brand-muted">{row.churnTier ?? '—'}</td>
                    <td className="py-2 text-brand-charcoal">
                      {row.donorUpliftScore != null ? formatPercent(row.donorUpliftScore * 100, 1) : '—'}
                    </td>
                  </tr>
                ))}
                {derived.ml.donorPipeline.length === 0 && (
                  <tr>
                    <td className="py-3 text-brand-muted" colSpan={4}>
                      No donor ML rows yet. If refresh fails, check that the Azure ML Function App is deployed and{' '}
                      <code className="text-xs">MlRuntime:FunctionAppUrl</code> is set in API config.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-brand-border bg-white p-6">
          <h3 className="font-semibold text-brand-charcoal">Pipeline 2 · Social post scoring</h3>
          <p className="mt-1 text-xs text-brand-muted">
            Post-level churn influence and uplift (uplift may incorporate a donor-level blend after refresh).
          </p>
          <div className="mt-4 max-h-80 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2">Post</th>
                  <th className="pb-2">Churn</th>
                  <th className="pb-2">Uplift</th>
                </tr>
              </thead>
              <tbody>
                {derived.ml.socialPostScores.map((row) => (
                  <tr key={row.postId} className="border-b border-brand-border/70">
                    <td className="py-2 pr-2 text-brand-charcoal">
                      {row.platform} · {row.postType ?? 'Post'} #{row.postId}
                    </td>
                    <td className="py-2 pr-2 text-brand-charcoal">{formatPercent(row.churnScore * 100, 1)}</td>
                    <td className="py-2 text-brand-charcoal">{formatPercent(row.upliftScore * 100, 1)}</td>
                  </tr>
                ))}
                {derived.ml.socialPostScores.length === 0 && (
                  <tr>
                    <td className="py-3 text-brand-muted" colSpan={3}>
                      No social post ML scores yet. Run &quot;Refresh ML Scores&quot; after posts exist in the database
                      and the ML pipeline is configured.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-brand-border bg-white p-6">
        <h3 className="font-semibold text-brand-charcoal">Pipeline 3 · Participant Reintegration Readiness</h3>
        <p className="mt-1 text-xs text-brand-muted">
          Predicted readiness to reintegrate based on current risk, education, attendance, and wellbeing signals.
        </p>
        <div className="mt-4 max-h-96 overflow-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-brand-border text-left text-brand-muted">
                <th className="pb-2">Participant</th>
                <th className="pb-2">Readiness</th>
                <th className="pb-2">Tier</th>
              </tr>
            </thead>
            <tbody>
              {derived.ml.residentReadiness.map((row) => (
                <tr key={row.residentId} className="border-b border-brand-border/70">
                  <td className="py-2 pr-2 text-brand-charcoal">{row.caseControlNo} ({row.internalCode})</td>
                  <td className="py-2 pr-2 text-brand-charcoal">{formatPercent(row.readinessScore * 100, 1)}</td>
                  <td className="py-2 text-brand-muted">{row.readinessTier}</td>
                </tr>
              ))}
              {derived.ml.residentReadiness.length === 0 && (
                <tr>
                  <td className="py-3 text-brand-muted" colSpan={3}>
                    No reintegration readiness scores yet. Refresh ML after residents and pipeline data are available.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
