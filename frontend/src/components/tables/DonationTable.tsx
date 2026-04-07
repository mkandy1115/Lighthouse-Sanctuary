import { formatCurrency, formatDate } from '@/lib/formatters'
import DataTable from '@/components/tables/DataTable'

export function DonationTable({
  records,
}: {
  records: {
    id: string
    amount: number
    date: string
    campaign: string
    method: string
  }[]
}) {
  return (
    <DataTable headers={['Date', 'Campaign', 'Amount', 'Method']}>
      {records.map((record) => (
        <tr key={record.id} className="border-b border-brand-border/50 transition-colors hover:bg-white">
          <td className="px-4 py-3 text-brand-muted">{formatDate(record.date)}</td>
          <td className="px-4 py-3 text-brand-charcoal">{record.campaign}</td>
          <td className="px-4 py-3 font-semibold text-brand-charcoal">{formatCurrency(record.amount, 'PHP')}</td>
          <td className="px-4 py-3 text-brand-muted">{record.method}</td>
        </tr>
      ))}
    </DataTable>
  )
}

export default DonationTable
