import { ArrowDownRight, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

export function StatTile({
  label,
  value,
  delta,
  positive,
}: {
  label: string
  value: string
  delta?: string
  positive?: boolean
}) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-muted">{label}</p>
        <p className="font-serif text-2xl text-brand-charcoal">{value}</p>
        {delta && (
          <p className={cn('inline-flex items-center gap-1 text-xs', positive ? 'text-brand-teal' : 'text-amber-700')}>
            {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {delta}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

export default StatTile
