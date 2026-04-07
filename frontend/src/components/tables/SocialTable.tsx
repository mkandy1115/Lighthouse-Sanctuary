import DataTable from '@/components/tables/DataTable'

export function SocialTable({
  records,
}: {
  records: {
    id: string
    platform: string
    title: string
    reach: number
    engagementRate: number
  }[]
}) {
  return (
    <DataTable headers={['Platform', 'Post', 'Reach', 'Engagement']}>
      {records.map((record) => (
        <tr key={record.id} className="border-b border-brand-border/50 transition-colors hover:bg-white">
          <td className="px-4 py-3 capitalize text-brand-charcoal">{record.platform}</td>
          <td className="px-4 py-3 text-brand-charcoal">{record.title}</td>
          <td className="px-4 py-3 text-brand-muted">{record.reach.toLocaleString()}</td>
          <td className="px-4 py-3 text-brand-muted">{record.engagementRate}%</td>
        </tr>
      ))}
    </DataTable>
  )
}

export default SocialTable
