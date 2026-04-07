import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'teal' | 'bronze' | 'muted' | 'danger' | 'warning'

const styles: Record<BadgeVariant, string> = {
  default: 'bg-brand-charcoal text-white',
  teal: 'bg-brand-teal-muted text-brand-teal',
  bronze: 'bg-brand-bronze-muted text-brand-bronze',
  muted: 'bg-brand-stone text-brand-muted',
  danger: 'bg-rose-100 text-rose-700',
  warning: 'bg-amber-100 text-amber-700',
}

export function Badge({
  className,
  children,
  variant = 'default',
  ...props
}: HTMLAttributes<HTMLSpanElement> & { children: ReactNode; variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium',
        styles[variant],
        className,
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge
