import type { HTMLAttributes, ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { cn } from '@/lib/utils'

type AlertVariant = 'info' | 'success' | 'warning'

const iconByVariant = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
}

const styleByVariant = {
  info: 'border-brand-border bg-brand-stone text-brand-charcoal',
  success: 'border-brand-teal/20 bg-brand-teal-muted/50 text-brand-charcoal',
  warning: 'border-amber-200 bg-amber-50 text-brand-charcoal',
}

export function Alert({
  children,
  className,
  variant = 'info',
}: HTMLAttributes<HTMLDivElement> & { children: ReactNode; variant?: AlertVariant }) {
  const Icon = iconByVariant[variant]
  return (
    <div className={cn('flex gap-3 rounded-xl border p-4 text-sm', styleByVariant[variant], className)}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}

export default Alert
