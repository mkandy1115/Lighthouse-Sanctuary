import { formatCurrency, formatDate } from '@/lib/formatters'
import DataTable from '@/components/tables/DataTable'

export function DonorTable({
  records,
}: {
  records: {
    id: string
    name: string
    tier: string
    totalGiven: number
    lastGiftDate: string
  }[]
}) {
  return (
    <DataTable headers={['Donor', 'Tier', 'Total Given', 'Last Gift']}>
      {records.map((record) => (
        <tr key={record.id} className="border-b border-brand-border/50 transition-colors hover:bg-white">
          <td className="px-4 py-3 text-brand-charcoal">{record.name}</td>
          <td className="px-4 py-3 text-brand-muted capitalize">{record.tier}</td>
          <td className="px-4 py-3 text-brand-charcoal">{formatCurrency(record.totalGiven, 'PHP')}</td>
          <td className="px-4 py-3 text-brand-muted">{formatDate(record.lastGiftDate, 'long')}</td>
        </tr>
      ))}
    </DataTable>
  )
}

export default DonorTable
