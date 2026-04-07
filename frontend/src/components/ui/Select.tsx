import type { SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'h-10 w-full rounded-lg border border-brand-border bg-white px-3 text-sm text-brand-charcoal focus:outline-none focus:ring-2 focus:ring-brand-bronze/20 focus:border-brand-bronze',
        className,
      )}
      {...props}
    />
  )
}

export default Select
