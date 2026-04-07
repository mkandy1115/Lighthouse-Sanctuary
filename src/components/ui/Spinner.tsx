import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return <div className={cn('h-4 w-4 animate-spin rounded-full border-2 border-brand-border border-t-brand-bronze', className)} />
}

export default Spinner
