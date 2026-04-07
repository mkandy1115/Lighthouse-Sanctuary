import { useParams, Link } from 'react-router-dom'
import { formatCurrency, formatDate } from '@/lib/formatters'
import { ArrowLeft } from 'lucide-react'

const mockDonor = {
  id: '1',
  name: 'Arcega Family Foundation',
  type: 'Foundation',
  contact: 'Maria Arcega-Santos',
  email: 'maria@arcegafoundation.org',
  phone: '+63 2 8123 4567',
  totalGiven: 1200000,
  status: 'active',
  notes: 'Long-term foundation partner since 2018. Interested in housing and livelihood programs. Annual grant cycle closes in March.',
  gifts: [
    { date: '2025-01-10', amount: 200000, campaign: 'Emergency Shelter Fund', method: 'Bank Transfer' },
    { date: '2024-07-01', amount: 500000, campaign: 'Annual Appeal 2024', method: 'Check' },
    { date: '2024-01-15', amount: 500000, campaign: 'Annual Appeal 2023', method: 'Bank Transfer' },
  ],
}

export default function StaffDonorProfilePage() {
  const { id = mockDonor.id } = useParams<{ id: string }>()
  const d = { ...mockDonor, id }

  return (
    <div className="animate-fade-in max-w-4xl">
      <Link to="/staff/donors" className="inline-flex items-center gap-1 text-brand-muted text-sm hover:text-brand-bronze mb-6 transition-colors">
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Donors
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="font-serif text-3xl text-brand-charcoal">{d.name}</h1>
          <p className="text-brand-muted text-sm mt-1">{d.type} · {d.contact} · ID {d.id}</p>
        </div>
        <span className="bg-brand-teal-muted text-brand-teal text-xs font-medium px-3 py-1 rounded-full capitalize">
          {d.status}
        </span>
      </div>

      <div className="grid md:grid-cols-3 gap-5 mb-6">
        <div className="bg-brand-cream rounded-xl border border-brand-border p-5 md:col-span-2">
          <h2 className="font-semibold text-brand-charcoal mb-4 text-sm">Contact & Notes</h2>
          <dl className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div><dt className="text-brand-muted text-xs mb-0.5">Email</dt><dd className="text-brand-charcoal">{d.email}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Phone</dt><dd className="text-brand-charcoal">{d.phone}</dd></div>
            <div><dt className="text-brand-muted text-xs mb-0.5">Total Given</dt><dd className="font-semibold text-brand-charcoal">{formatCurrency(d.totalGiven, 'PHP')}</dd></div>
          </dl>
          <p className="text-sm text-brand-muted italic leading-relaxed">{d.notes}</p>
        </div>

        <div className="bg-brand-bronze-muted rounded-xl border border-brand-bronze/20 p-5 text-center">
          <p className="text-xs text-brand-bronze font-medium uppercase tracking-wider mb-2">Total Lifetime Giving</p>
          <p className="font-serif text-3xl text-brand-bronze">{formatCurrency(d.totalGiven, 'PHP')}</p>
          <p className="text-xs text-brand-muted mt-2">{d.gifts.length} gifts recorded</p>
        </div>
      </div>

      <div className="bg-brand-cream rounded-xl border border-brand-border overflow-hidden">
        <div className="px-5 py-4 border-b border-brand-border">
          <h2 className="font-semibold text-brand-charcoal text-sm">Gift History</h2>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border">
              {['Date', 'Campaign', 'Amount', 'Method'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-medium text-brand-muted uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {d.gifts.map((g, i) => (
              <tr key={i} className="border-b border-brand-border/50 hover:bg-white transition-colors">
                <td className="px-4 py-3 text-brand-muted">{formatDate(g.date)}</td>
                <td className="px-4 py-3 text-brand-charcoal">{g.campaign}</td>
                <td className="px-4 py-3 font-semibold text-brand-charcoal">{formatCurrency(g.amount, 'PHP')}</td>
                <td className="px-4 py-3 text-brand-muted">{g.method}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
