import Badge from '@/components/ui/Badge'

export type RiskTone = 'low' | 'medium' | 'high' | 'critical'

const variantByRisk = {
  low: 'teal',
  medium: 'warning',
  high: 'bronze',
  critical: 'danger',
} as const

export function RiskIndicator({ level }: { level: RiskTone }) {
  const label = level === 'critical' ? 'Requires immediate attention' : `${level} risk`
  return <Badge variant={variantByRisk[level]}>{label}</Badge>
}

export default RiskIndicator
