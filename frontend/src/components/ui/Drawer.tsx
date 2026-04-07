import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Drawer({
  open,
  onClose,
  title,
  children,
  side = 'right',
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  side?: 'left' | 'right'
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-brand-charcoal/40">
      <div
        className={cn(
          'absolute top-0 h-full w-full max-w-sm bg-white shadow-card-lg',
          side === 'right' ? 'right-0 animate-slide-in-right' : 'left-0 animate-slide-in-left',
        )}
      >
        <div className="flex items-center justify-between border-b border-brand-border px-5 py-4">
          <h2 className="font-semibold text-brand-charcoal">{title}</h2>
          <button onClick={onClose} className="rounded p-1 text-brand-muted hover:text-brand-charcoal">
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  )
}

export default Drawer
