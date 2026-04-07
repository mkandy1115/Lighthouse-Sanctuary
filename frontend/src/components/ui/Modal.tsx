import type { ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function Modal({
  open,
  onClose,
  title,
  children,
  className,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  className?: string
}) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-brand-charcoal/40 p-4">
      <div className={cn('w-full max-w-lg rounded-2xl bg-white shadow-card-lg', className)}>
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

export default Modal
