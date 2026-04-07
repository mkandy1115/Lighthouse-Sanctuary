import type { ReactNode } from 'react'
import { Card, CardContent } from '@/components/ui/Card'

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string
  description: string
  action?: ReactNode
}) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <h2 className="font-semibold text-brand-charcoal">{title}</h2>
        <p className="mt-2 text-sm text-brand-muted">{description}</p>
        {action && <div className="mt-4">{action}</div>}
      </CardContent>
    </Card>
  )
}

export default EmptyState
