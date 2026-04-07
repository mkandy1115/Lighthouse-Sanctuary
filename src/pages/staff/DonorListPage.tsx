import { Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/lib/formatters'

const donors = [
  { id: '1', name: 'Arcega Family Foundation', type: 'Foundation', totalGiven: 1200000, lastGift: '2025-01-10', status: 'active' },
  { id: '2', name: 'Anonymous', type: 'Individual', totalGiven: 85000, lastGift: '2025-01-08', status: 'active' },
  { id: '3', name: 'Sunrise Corp CSR', type: 'Corporate', totalGiven: 500000, lastGift: '2024-12-01', status: 'active' },
  { id: '4', name: 'Reyes Family', type: 'Individual', totalGiven: 45000, lastGift: '2024-11-15', status: 'lapsed' },
  { id: '5', name: 'Global Solidarity Fund', type: 'Foundation', totalGiven: 750000, lastGift: '2025-01-02', status: 'active' },
]

export default function StaffDonorListPage() {
  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">Donors</h1>
          <p className="text-brand-muted text-sm mt-1">{donors.length} donor records</p>
        </div>
        <button className="bg-brand-bronze text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-bronze-light transition-colors shadow-bronze">
          + Add Donor
        </button>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Donor', 'Type', 'Total Given', 'Last Gift', 'Status', ''].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {donors.map((d) => (
              <tr key={d.id} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 font-medium text-brand-charcoal">{d.name}</td>
                <td className="px-4 py-3 text-brand-muted">{d.type}</td>
                <td className="px-4 py-3 text-brand-charcoal font-semibold">{formatCurrency(d.totalGiven, 'PHP')}</td>
                <td className="px-4 py-3 text-brand-muted">{formatDate(d.lastGift)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                    d.status === 'active' ? 'bg-brand-teal-muted text-brand-teal' : 'bg-brand-stone text-brand-muted'
                  }`}>
                    {d.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link to={`/staff/donors/${d.id}`} className="text-brand-bronze text-xs font-medium hover:underline">
                    View →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
