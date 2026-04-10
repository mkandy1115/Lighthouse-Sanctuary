import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import Modal from '@/components/ui/Modal'
import {
  createStaffDonation,
  getSafehouses,
  getSupporter,
  type SafehouseListItem,
  type SupporterDetailResponse,
} from '@/lib/staff'
import { formatDate, formatUsdFromPhp } from '@/lib/formatters'
import { useTableSort } from '@/lib/tableSort'
import { ArrowLeft } from 'lucide-react'
import { inRange, looksUnsafe, sanitizeText } from '@/lib/validation'

export default function StaffDonorProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const [data, setData] = useState<SupporterDetailResponse | null>(null)
  const [safehouses, setSafehouses] = useState<SafehouseListItem[]>([])
  const [error, setError] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({
    donationType: 'Monetary',
    donationDate: new Date().toISOString().slice(0, 10),
    isRecurring: false,
    campaignName: '',
    channelSource: 'Direct',
    currencyCode: 'PHP',
    amount: '',
    estimatedValue: '',
    impactUnit: 'pesos',
    notes: '',
    safehouseId: '1',
    programArea: 'Education',
    amountAllocated: '',
    allocationNotes: '',
  })

  async function loadSupporter() {
    setData(await getSupporter(id))
  }

  useEffect(() => {
    async function load() {
      try {
        const [supporter, safehouseList] = await Promise.all([getSupporter(id), getSafehouses()])
        setData(supporter)
        setSafehouses(safehouseList)
        if (safehouseList.length > 0) {
          setForm((f) => ({ ...f, safehouseId: String(safehouseList[0].safehouseId) }))
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load supporter.')
      }
    }

    load()
  }, [id])

  const donations = data?.donations ?? []
  const allocations = data?.allocations ?? []
  const donationsSort = useTableSort<(typeof donations)[number], 'date' | 'campaign' | 'amount' | 'type' | 'channel'>(
    donations,
    (donation, key) => {
      switch (key) {
        case 'date': return donation.donationDate ?? ''
        case 'campaign': return donation.campaignName ?? 'Direct Giving'
        case 'amount': return Number(donation.amount ?? donation.estimatedValue ?? 0)
        case 'type': return donation.donationType ?? ''
        case 'channel': return donation.channelSource ?? ''
        default: return ''
      }
    },
  )
  const allocationsSort = useTableSort<(typeof allocations)[number], 'date' | 'programArea' | 'safehouse' | 'allocated'>(
    allocations,
    (allocation, key) => {
      switch (key) {
        case 'date': return allocation.allocationDate ?? ''
        case 'programArea': return allocation.programArea ?? ''
        case 'safehouse': return Number(allocation.safehouseId ?? 0)
        case 'allocated': return Number(allocation.amountAllocated ?? 0)
        default: return ''
      }
    },
  )

  if (error) {
    return <div className="py-16 text-center text-rose-700">{error}</div>
  }

  if (!data) {
    return <div className="py-16 text-center text-brand-muted">Loading supporter profile…</div>
  }

  const { supporter } = data
  const totalGiven = donations.reduce((sum, donation) => sum + Number(donation.amount ?? donation.estimatedValue ?? 0), 0)

  async function handleCreateDonation(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    try {
      setError('')
      const amount = form.amount ? Number(form.amount) : null
      const allocated = Number(form.amountAllocated || form.amount || 0)
      if ((amount !== null && !inRange(amount, 0, 10_000_000)) || !inRange(allocated, 0, 10_000_000)) {
        setError('Donation amounts must be between 0 and 10,000,000.')
        return
      }
      if ([form.campaignName, form.notes, form.allocationNotes].some(looksUnsafe)) {
        setError('Submitted text contains unsafe input.')
        return
      }
      await createStaffDonation({
        supporterId: supporter.supporterId,
        donationType: sanitizeText(form.donationType, 40),
        donationDate: form.donationDate,
        isRecurring: form.isRecurring,
        campaignName: sanitizeText(form.campaignName, 120) || null,
        channelSource: sanitizeText(form.channelSource, 64) || null,
        currencyCode: sanitizeText(form.currencyCode, 12) || null,
        amount,
        estimatedValue: form.estimatedValue ? Number(form.estimatedValue) : null,
        impactUnit: sanitizeText(form.impactUnit, 32) || null,
        notes: sanitizeText(form.notes, 1000, true) || null,
        safehouseId: Number(form.safehouseId),
        programArea: sanitizeText(form.programArea, 40),
        amountAllocated: allocated,
        allocationNotes: sanitizeText(form.allocationNotes, 1000, true) || null,
      })
      setIsModalOpen(false)
      await loadSupporter()
      setForm((f) => ({
        ...f,
        donationDate: new Date().toISOString().slice(0, 10),
        campaignName: '',
        amount: '',
        estimatedValue: '',
        notes: '',
        amountAllocated: '',
        allocationNotes: '',
      }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to create contribution.')
    }
  }

  return (
    <div className="animate-fade-in max-w-5xl">
      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Contribution">
        <form onSubmit={handleCreateDonation} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <select value={form.donationType} onChange={(e) => setForm((f) => ({ ...f, donationType: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm">
              <option value="Monetary">Monetary</option>
              <option value="InKind">InKind</option>
              <option value="Time">Time</option>
              <option value="Skills">Skills</option>
              <option value="SocialMedia">SocialMedia</option>
            </select>
            <input type="date" value={form.donationDate} onChange={(e) => setForm((f) => ({ ...f, donationDate: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input value={form.amount} onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))} placeholder="Amount" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
            <input value={form.estimatedValue} onChange={(e) => setForm((f) => ({ ...f, estimatedValue: e.target.value }))} placeholder="Estimated value" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select value={form.safehouseId} onChange={(e) => setForm((f) => ({ ...f, safehouseId: e.target.value }))} className="rounded-lg border border-brand-border px-4 py-3 text-sm">
              {safehouses.map((s) => <option key={s.safehouseId} value={s.safehouseId}>{s.name}</option>)}
            </select>
            <input value={form.programArea} onChange={(e) => setForm((f) => ({ ...f, programArea: e.target.value }))} placeholder="Program area" className="rounded-lg border border-brand-border px-4 py-3 text-sm" />
          </div>
          <input value={form.amountAllocated} onChange={(e) => setForm((f) => ({ ...f, amountAllocated: e.target.value }))} placeholder="Amount allocated" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm" />
          <input value={form.campaignName} onChange={(e) => setForm((f) => ({ ...f, campaignName: e.target.value }))} placeholder="Campaign name" className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm" />
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} placeholder="Donation notes" rows={2} className="w-full rounded-lg border border-brand-border px-4 py-3 text-sm" />
          <button className="w-full rounded-lg bg-brand-bronze px-4 py-3 text-sm font-semibold text-white">Save Contribution</button>
        </form>
      </Modal>

      <Link to="/admin/donors" className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Donors
      </Link>

      <div className="flex items-start justify-between mb-6 gap-3">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">{supporter.displayName}</h1>
          <p className="text-brand-muted text-sm mt-1">{supporter.supporterType} · ID {supporter.supporterId}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="bg-brand-teal-muted text-brand-teal text-xs font-medium px-3 py-1 rounded-full capitalize">
            {supporter.status}
          </span>
          <button onClick={() => setIsModalOpen(true)} className="bg-brand-bronze text-white text-xs font-semibold px-3 py-1.5 rounded-md hover:bg-brand-bronze-light transition-colors">
            + Add Contribution
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="bg-brand-cream rounded-xl border border-brand-border p-5 md:col-span-2">
          <h2 className="font-semibold text-brand-charcoal mb-4 text-sm">Contact & Profile</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div><dt className="text-brand-muted text-xs mb-0.5">Email</dt><dd className="text-brand-charcoal">{supporter.email ?? '—'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Phone</dt><dd className="text-brand-charcoal">{supporter.phone ?? '—'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Region</dt><dd className="text-brand-charcoal">{supporter.region ?? '—'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Country</dt><dd className="text-brand-charcoal">{supporter.country ?? '—'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Relationship</dt><dd className="text-brand-charcoal">{supporter.relationshipType ?? '—'}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Acquisition</dt><dd className="text-brand-charcoal">{supporter.acquisitionChannel ?? '—'}</dd></div>
          </dl>
        </div>

        <div className="bg-brand-bronze-muted rounded-xl border border-brand-bronze/20 p-5 text-center">
          <p className="text-xs text-brand-bronze font-medium uppercase tracking-wider mb-2">Total Lifetime Giving</p>
          <p className="font-serif text-3xl text-brand-bronze">{formatUsdFromPhp(totalGiven)}</p>
          <p className="text-xs text-brand-muted mt-2">{donations.length} gifts recorded</p>
        </div>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden mb-6">
        <div className="px-5 py-4 border-b border-brand-border">
          <h2 className="font-semibold text-brand-charcoal text-sm">Gift History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationsSort.toggleSort('date')} className="hover:text-brand-charcoal">Date{donationsSort.indicator('date')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationsSort.toggleSort('campaign')} className="hover:text-brand-charcoal">Campaign{donationsSort.indicator('campaign')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationsSort.toggleSort('amount')} className="hover:text-brand-charcoal">Amount{donationsSort.indicator('amount')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationsSort.toggleSort('type')} className="hover:text-brand-charcoal">Type{donationsSort.indicator('type')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationsSort.toggleSort('channel')} className="hover:text-brand-charcoal">Channel{donationsSort.indicator('channel')}</button></th>
            </tr>
          </thead>
          <tbody>
            {donationsSort.sortedRows.map((donation, index) => (
              <tr key={index} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-brand-muted">{donation.donationDate ? formatDate(String(donation.donationDate)) : '—'}</td>
                <td className="px-4 py-3 text-brand-charcoal">{String(donation.campaignName ?? 'Direct Giving')}</td>
                <td className="px-4 py-3 font-semibold text-brand-charcoal">{formatUsdFromPhp(Number(donation.amount ?? donation.estimatedValue ?? 0))}</td>
                <td className="px-4 py-3 text-brand-muted">{String(donation.donationType ?? '—')}</td>
                <td className="px-4 py-3 text-brand-muted">{String(donation.channelSource ?? '—')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h2 className="font-semibold text-brand-charcoal text-sm">Donation Allocations</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => allocationsSort.toggleSort('date')} className="hover:text-brand-charcoal">Date{allocationsSort.indicator('date')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => allocationsSort.toggleSort('programArea')} className="hover:text-brand-charcoal">Program Area{allocationsSort.indicator('programArea')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => allocationsSort.toggleSort('safehouse')} className="hover:text-brand-charcoal">Safehouse{allocationsSort.indicator('safehouse')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => allocationsSort.toggleSort('allocated')} className="hover:text-brand-charcoal">Allocated{allocationsSort.indicator('allocated')}</button></th>
            </tr>
          </thead>
          <tbody>
            {allocationsSort.sortedRows.map((allocation, index) => (
              <tr key={index} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-brand-muted">{allocation.allocationDate ? formatDate(String(allocation.allocationDate)) : '—'}</td>
                <td className="px-4 py-3 text-brand-charcoal">{String(allocation.programArea ?? '—')}</td>
                <td className="px-4 py-3 text-brand-muted">Safehouse #{String(allocation.safehouseId ?? '—')}</td>
                <td className="px-4 py-3 font-semibold text-brand-charcoal">{formatUsdFromPhp(Number(allocation.amountAllocated ?? 0))}</td>
              </tr>
            ))}
            {allocations.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-brand-muted">No allocations recorded for this supporter yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
