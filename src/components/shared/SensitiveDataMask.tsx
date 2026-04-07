import type { ReactNode } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { usePrivacy } from '@/hooks/usePrivacy'
import { cn } from '@/lib/utils'

export function SensitiveDataMask({
  label,
  value,
  resourceId,
  resourceType,
  description = 'You are viewing sensitive information. This access is logged.',
}: {
  label: string
  value: ReactNode
  resourceId: string
  resourceType: string
  description?: string
}) {
  const { revealed, reveal, conceal } = usePrivacy(resourceId, resourceType)

  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-2">
        <dt className="text-xs font-medium uppercase tracking-wider text-brand-muted">{label}</dt>
        <button
          onClick={revealed ? conceal : reveal}
          className="text-brand-muted transition-colors hover:text-brand-bronze"
          aria-label={revealed ? `Conceal ${label}` : `Reveal ${label}`}
          title={revealed ? `Conceal ${label}` : description}
        >
          {revealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
        </button>
      </div>
      <dd className={cn('text-sm text-brand-charcoal transition-all', !revealed && 'blur-sm select-none')}>
        {value}
      </dd>
      {!revealed && <p className="text-xs text-brand-muted">{description}</p>}
    </div>
  )
}

export default SensitiveDataMask
