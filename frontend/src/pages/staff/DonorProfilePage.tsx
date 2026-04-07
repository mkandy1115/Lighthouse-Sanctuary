import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getSupporter, type SupporterDetailResponse } from '@/lib/staff'
import { formatDate, formatUsdFromPhp } from '@/lib/formatters'
import { ArrowLeft } from 'lucide-react'

export default function StaffDonorProfilePage() {
  const { id = '' } = useParams<{ id: string }>()
  const [data, setData] = useState<SupporterDetailResponse | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        setData(await getSupporter(id))
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unable to load supporter.')
      }
    }

    load()
  }, [id])

  if (error) {
    return <div className="py-16 text-center text-rose-700">{error}</div>
  }

  if (!data) {
    return <div className="py-16 text-center text-brand-muted">Loading supporter profile…</div>
  }

  const { supporter, donations, allocations } = data
  const totalGiven = donations.reduce((sum, donation) => sum + Number(donation.amount ?? donation.estimatedValue ?? 0), 0)

  return (
    <div className="animate-fade-in max-w-5xl">
      <Link to="/staff/donors" className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Donors
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">{supporter.displayName}</h1>
          <p className="text-brand-muted text-sm mt-1">{supporter.supporterType} · ID {supporter.supporterId}</p>
        </div>
        <span className="bg-brand-teal-muted text-brand-teal text-xs font-medium px-3 py-1 rounded-full capitalize">
          {supporter.status}
        </span>
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
              {['Date', 'Campaign', 'Amount', 'Type', 'Channel'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donations.map((donation, index) => (
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
              {['Date', 'Program Area', 'Safehouse', 'Allocated'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allocations.map((allocation, index) => (
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
