import type { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

export function DataTable({
  headers,
  children,
  empty,
}: {
  headers: string[]
  children: ReactNode
  empty?: ReactNode
}) {
  const hasRows = Array.isArray(children) ? children.length > 0 : true

  return (
    <Card className="overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-brand-border">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-brand-muted">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {!hasRows && empty}
    </Card>
  )
}

export default DataTable
