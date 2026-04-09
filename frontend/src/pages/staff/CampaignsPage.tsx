import { useEffect, useMemo, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Target, Users, TrendingUp, Plus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import {
  createStaffDonation,
  getCampaignSummaries,
  getSafehouses,
  getSupporters,
  type CampaignSummaryItem,
  type SafehouseListItem,
  type SupporterListItem,
} from '@/lib/staff'
import { formatPhilippinePeso, formatUsdFromPhp } from '@/lib/formatters'

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-brand-border rounded-lg shadow-card px-3 py-2 text-xs text-brand-charcoal">
      <p className="font-semibold mb-0.5">{label}</p>
      <p className="text-brand-bronze">{formatUsdFromPhp(payload[0].value)}</p>
    </div>
  )
}

function isActiveCampaign(lastIso: string): boolean {
  const t = new Date(lastIso).getTime()
  if (Number.isNaN(t)) return false
  const yearMs = 365.25 * 24 * 60 * 60 * 1000
  return Date.now() - t < yearMs
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignSummaryItem[]>([])
  const [supporters, setSupporters] = useState<SupporterListItem[]>([])
  const [safehouses, setSafehouses] = useState<SafehouseListItem[]>([])
  const [expanded, setExpanded] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [giftModalOpen, setGiftModalOpen] = useState(false)
  const [prefillCampaign, setPrefillCampaign] = useState('')
  const [giftSaving, setGiftSaving] = useState(false)
  const [giftForm, setGiftForm] = useState({
    campaignName: '',
    supporterId: '',
    amount: '',
    safehouseId: '',
    programArea: 'Education',
    donationDate: new Date().toISOString().slice(0, 10),
    notes: '',
  })

  const maxRaised = useMemo(() => campaigns.reduce((m, c) => Math.max(m, c.raised), 0), [campaigns])

  useEffect(() => {
    async function load() {
      try {
        setLoading(true)
        setError('')
        const [c, sup, sh] = await Promise.all([getCampaignSummaries(), getSupporters(), getSafehouses()])
        setCampaigns(c)
        setSupporters(sup)
        setSafehouses(sh)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load campaigns.')
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [])

  useEffect(() => {
    if (safehouses.length === 0) return
    setGiftForm((f) => (f.safehouseId ? f : { ...f, safehouseId: String(safehouses[0].safehouseId) }))
  }, [safehouses])

  function openRecordGift(campaignName?: string) {
    setPrefillCampaign(campaignName ?? '')
    setGiftForm((f) => ({
      ...f,
      campaignName: campaignName ?? '',
      supporterId: supporters[0] ? String(supporters[0].supporterId) : '',
      amount: '',
      donationDate: new Date().toISOString().slice(0, 10),
      notes: '',
      safehouseId: f.safehouseId || (safehouses[0] ? String(safehouses[0].safehouseId) : ''),
    }))
    setGiftModalOpen(true)
    setError('')
  }

  async function handleGiftSubmit(e: React.FormEvent) {
    e.preventDefault()
    const name = giftForm.campaignName.trim()
    const amt = Number(giftForm.amount)
    const sid = Number(giftForm.supporterId)
    const hid = Number(giftForm.safehouseId)
    if (!name || !giftForm.donationDate || !sid || !hid || !Number.isFinite(amt) || amt <= 0) {
      setError('Campaign name, supporter, safehouse, valid amount, and date are required.')
      return
    }
    try {
      setGiftSaving(true)
      setError('')
      await createStaffDonation({
        supporterId: sid,
        donationType: 'Monetary',
        donationDate: giftForm.donationDate,
        isRecurring: false,
        campaignName: name,
        channelSource: 'Direct',
        currencyCode: 'PHP',
        amount: amt,
        estimatedValue: amt,
        impactUnit: 'pesos',
        notes: giftForm.notes.trim() || 'Staff-recorded campaign gift',
        safehouseId: hid,
        programArea: giftForm.programArea,
        amountAllocated: amt,
      })
      setGiftModalOpen(false)
      const refreshed = await getCampaignSummaries()
      setCampaigns(refreshed)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to record gift.')
    } finally {
      setGiftSaving(false)
    }
  }

  const ctrl = 'rounded-lg border border-brand-border bg-white px-4 py-3 text-sm text-brand-charcoal'

  return (
    <div className="animate-fade-in">
      <Modal
        open={giftModalOpen}
        onClose={() => {
          setGiftModalOpen(false)
          setPrefillCampaign('')
        }}
        title={prefillCampaign ? `Record gift — ${prefillCampaign}` : 'Record campaign gift'}
      >
        <form onSubmit={handleGiftSubmit} className="space-y-3">
          <input
            value={giftForm.campaignName}
            onChange={(e) => setGiftForm((f) => ({ ...f, campaignName: e.target.value }))}
            placeholder="Campaign name (matches donation campaign tag)"
            className={`w-full ${ctrl}`}
            required
          />
          <select
            value={giftForm.supporterId}
            onChange={(e) => setGiftForm((f) => ({ ...f, supporterId: e.target.value }))}
            className={`w-full ${ctrl}`}
            required
          >
            <option value="">Select supporter</option>
            {supporters.map((s) => (
              <option key={s.supporterId} value={s.supporterId}>
                {s.displayName}
              </option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <input
              type="number"
              min={0.01}
              step="0.01"
              value={giftForm.amount}
              onChange={(e) => setGiftForm((f) => ({ ...f, amount: e.target.value }))}
              placeholder="Amount (PHP)"
              className={ctrl}
              required
            />
            <input type="date" value={giftForm.donationDate} onChange={(e) => setGiftForm((f) => ({ ...f, donationDate: e.target.value }))} className={ctrl} required />
          </div>
          <select
            value={giftForm.safehouseId}
            onChange={(e) => setGiftForm((f) => ({ ...f, safehouseId: e.target.value }))}
            className={`w-full ${ctrl}`}
            required
          >
            <option value="">Safehouse allocation</option>
            {safehouses.map((h) => (
              <option key={h.safehouseId} value={h.safehouseId}>
                {h.name}
              </option>
            ))}
          </select>
          <select
            value={giftForm.programArea}
            onChange={(e) => setGiftForm((f) => ({ ...f, programArea: e.target.value }))}
            className={`w-full ${ctrl}`}
          >
            {['Education', 'Wellbeing', 'Operations', 'Transport', 'Maintenance', 'Outreach'].map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <input
            value={giftForm.notes}
            onChange={(e) => setGiftForm((f) => ({ ...f, notes: e.target.value }))}
            placeholder="Notes (optional)"
            className={`w-full ${ctrl}`}
          />
          <button
            type="submit"
            disabled={giftSaving}
            className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {giftSaving ? 'Saving…' : 'Record gift'}
          </button>
        </form>
      </Modal>

      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Campaigns</h1>
          <p className="text-brand-muted text-sm mt-1">Totals grouped from donation campaign names in the database</p>
        </div>
        <button
          type="button"
          onClick={() => openRecordGift()}
          className="inline-flex items-center gap-2 bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze"
        >
          <Plus className="w-4 h-4" />
          Record gift
        </button>
      </div>

      {error && !giftModalOpen && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}
      {giftModalOpen && error && (
        <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
      )}

      {loading && <div className="py-12 text-center text-brand-muted">Loading campaigns…</div>}

      {!loading && campaigns.length === 0 && (
        <div className="rounded-xl border border-brand-border bg-brand-cream px-6 py-12 text-center text-sm text-brand-muted">
          No campaign-tagged donations yet. Record a gift with a campaign name to see it here.
        </div>
      )}

      <div className="space-y-4">
        {!loading && campaigns.map((c) => {
          const active = isActiveCampaign(c.lastDonationDate)
          const isExpanded = expanded === c.name
          const pctBar = maxRaised > 0 ? Math.min(100, Math.round((c.raised / maxRaised) * 100)) : 0
          return (
            <div key={c.name} className="bg-white border border-brand-border rounded-xl overflow-hidden">
              <button
                type="button"
                onClick={() => setExpanded(isExpanded ? null : c.name)}
                className="w-full text-left p-5 hover:bg-brand-stone/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3 gap-3 flex-wrap">
                  <div>
                    <h2 className="font-semibold text-brand-charcoal">{c.name}</h2>
                    <p className="text-xs text-brand-muted mt-1">
                      {c.donationCount} gifts · {c.donorCount} distinct supporters ·{' '}
                      {c.firstDonationDate === c.lastDonationDate
                        ? c.firstDonationDate
                        : `${c.firstDonationDate} – ${c.lastDonationDate}`}
                    </p>
                  </div>
                  <span
                    className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${
                      active ? 'bg-brand-teal-muted text-brand-teal' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {active ? 'active' : 'inactive'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-6">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Target className="w-4 h-4 text-brand-muted shrink-0" />
                    <span className="font-serif text-brand-charcoal">{formatUsdFromPhp(c.raised)}</span>
                    <span className="text-brand-muted text-xs">raised</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <Users className="w-4 h-4 text-brand-muted shrink-0" />
                    <span className="text-brand-muted text-xs">{c.donorCount} donors</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm">
                    <TrendingUp className="w-4 h-4 text-brand-muted shrink-0" />
                    <span className="text-xs font-semibold text-brand-bronze">{c.monthlyData.length} months with activity</span>
                  </div>
                </div>
                <div className="mt-3 h-2 bg-brand-stone rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${active ? 'bg-brand-bronze' : 'bg-slate-300'}`}
                    style={{ width: `${pctBar}%` }}
                  />
                </div>
              </button>

              <div className="flex flex-wrap gap-2 px-5 pb-3">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    openRecordGift(c.name)
                  }}
                  className="text-xs font-semibold text-brand-bronze hover:underline"
                >
                  Record gift to this campaign
                </button>
              </div>

              {isExpanded && c.monthlyData.length > 0 && (
                <div className="border-t border-brand-border px-5 pb-5 pt-4">
                  <p className="text-sm text-brand-muted mb-4 leading-relaxed">
                    Monthly totals include all monetary gifts tagged with this campaign name.
                  </p>
                  <div className="h-[160px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={c.monthlyData} margin={{ top: 0, right: 0, left: -12, bottom: 0 }} barSize={22}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E3DF" vertical={false} />
                        <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#78716C' }} axisLine={false} tickLine={false} />
                        <YAxis
                          tick={{ fontSize: 11, fill: '#78716C' }}
                          axisLine={false}
                          tickLine={false}
                          tickFormatter={(v: number) => formatPhilippinePeso(v)}
                        />
                        <Tooltip content={<ChartTooltip />} />
                        <Bar dataKey="amount" fill="#92642A" radius={[3, 3, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
