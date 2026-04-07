import { Card, CardContent } from '@/components/ui/Card'

export function OutcomeMetric({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Card className="bg-white">
      <CardContent className="space-y-2 p-6">
        <p className="text-xs font-medium uppercase tracking-wider text-brand-teal">{label}</p>
        <p className="text-sm leading-relaxed text-brand-charcoal">{value}</p>
      </CardContent>
    </Card>
  )
}

export default OutcomeMetric
