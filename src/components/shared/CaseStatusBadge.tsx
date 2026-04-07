import Badge from '@/components/ui/Badge'

const variantByStatus: Record<string, 'teal' | 'bronze' | 'muted' | 'warning'> = {
  intake: 'bronze',
  assessment: 'warning',
  active: 'teal',
  reintegration: 'bronze',
  aftercare: 'warning',
  closed: 'muted',
  'follow-up': 'warning',
  referred: 'bronze',
}

export function CaseStatusBadge({ status }: { status: string }) {
  return <Badge variant={variantByStatus[status] ?? 'muted'}>{status}</Badge>
}

export default CaseStatusBadge
