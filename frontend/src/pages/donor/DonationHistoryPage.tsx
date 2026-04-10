import { formatCurrency, formatDate } from '@/lib/formatters'
import { Download } from 'lucide-react'
import { useTableSort } from '@/lib/tableSort'

const donations = [
  { id: '1', date: '2025-01-10', amount: 25000, campaign: 'Emergency Shelter Fund 2025', method: 'GCash', receiptUrl: '#' },
  { id: '2', date: '2024-10-01', amount: 50000, campaign: 'Annual Appeal 2024', method: 'Bank Transfer', receiptUrl: '#' },
  { id: '3', date: '2024-06-15', amount: 10000, campaign: 'General Fund', method: 'Credit Card', receiptUrl: '#' },
]

export default function DonationHistoryPage() {
  const donationSort = useTableSort<(typeof donations)[number], 'date' | 'campaign' | 'amount' | 'method'>(
    donations,
    (row, key) => row[key],
  )

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-serif text-3xl text-brand-charcoal">Donation History</h1>
        <p className="text-brand-muted text-sm mt-1">Your full giving record with downloadable receipts</p>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('date')} className="hover:text-brand-charcoal">Date{donationSort.indicator('date')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('campaign')} className="hover:text-brand-charcoal">Campaign{donationSort.indicator('campaign')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('amount')} className="hover:text-brand-charcoal">Amount{donationSort.indicator('amount')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider"><button type="button" onClick={() => donationSort.toggleSort('method')} className="hover:text-brand-charcoal">Method{donationSort.indicator('method')}</button></th>
              <th className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">Receipt</th>
            </tr>
          </thead>
          <tbody>
            {donationSort.sortedRows.map((d) => (
              <tr key={d.id} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-brand-muted">{formatDate(d.date)}</td>
                <td className="px-4 py-3 text-brand-charcoal">{d.campaign}</td>
                <td className="px-4 py-3 font-semibold text-brand-charcoal">{formatCurrency(d.amount, 'PHP')}</td>
                <td className="px-4 py-3 text-brand-muted">{d.method}</td>
                <td className="px-4 py-3">
                  <a href={d.receiptUrl} className="text-brand-bronze hover:text-brand-bronze-light transition-colors" title="Download receipt">
                    <Download className="w-4 h-4" />
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-brand-stone rounded-xl border border-brand-border p-4 flex items-center justify-between">
        <p className="text-sm text-brand-charcoal">
          Total lifetime giving: <span className="font-semibold">{formatCurrency(85000, 'PHP')}</span>
        </p>
        <button className="text-sm text-brand-bronze hover:underline flex items-center gap-1.5">
          <Download className="w-3.5 h-3.5" />
          Download Full Tax Statement
        </button>
      </div>
    </div>
  )
}
