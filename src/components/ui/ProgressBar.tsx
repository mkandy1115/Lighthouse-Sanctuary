import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  className,
  tone = 'bronze',
}: {
  value: number
  className?: string
  tone?: 'bronze' | 'teal'
}) {
  const fill = tone === 'teal' ? 'bg-brand-teal' : 'bg-brand-bronze'

  return (
    <div className={cn('h-2 overflow-hidden rounded-full bg-brand-border', className)}>
      <div className={cn('h-full rounded-full transition-all', fill)} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
}

export default ProgressBar
