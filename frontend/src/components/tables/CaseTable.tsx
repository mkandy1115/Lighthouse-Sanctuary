import { Link } from 'react-router-dom'
import { formatDate } from '@/lib/formatters'
import CaseStatusBadge from '@/components/shared/CaseStatusBadge'
import RiskIndicator from '@/components/shared/RiskIndicator'
import SensitiveDataMask from '@/components/shared/SensitiveDataMask'
import DataTable from '@/components/tables/DataTable'

export type CaseTableRecord = {
  id: string
  caseNumber: string
  firstName: string
  displayName: string
  assignedCaseworkerName: string
  intakeDate: string
  lastActivityDate: string
  status: string
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  program: string[]
}

export function CaseTable({ records }: { records: CaseTableRecord[] }) {
  return (
    <DataTable
      headers={['Case', 'Resident', 'Program', 'Risk', 'Status', 'Assigned To', 'Last Activity', '']}
      empty={<div className="py-12 text-center text-sm text-brand-muted">No cases match the current filters.</div>}
    >
      {records.map((record) => (
        <tr key={record.id} className="border-b border-brand-border/50 transition-colors hover:bg-white">
          <td className="px-4 py-3 font-mono text-xs text-brand-muted">{record.caseNumber}</td>
          <td className="px-4 py-3">
            <SensitiveDataMask
              label="Resident"
              value={record.displayName}
              resourceId={record.id}
              resourceType="case-name"
            />
          </td>
          <td className="px-4 py-3 text-brand-charcoal">{record.program[0] ?? 'General Support'}</td>
          <td className="px-4 py-3"><RiskIndicator level={record.riskLevel} /></td>
          <td className="px-4 py-3"><CaseStatusBadge status={record.status} /></td>
          <td className="px-4 py-3 text-brand-charcoal">{record.assignedCaseworkerName}</td>
          <td className="px-4 py-3 text-brand-muted">{formatDate(record.lastActivityDate, 'relative')}</td>
          <td className="px-4 py-3">
              <Link to={`/staff/cases/${record.id}`} className="text-xs font-medium text-brand-bronze hover:underline">
                View
              </Link>
            </td>
        </tr>
      ))}
    </DataTable>
  )
}

export default CaseTable
