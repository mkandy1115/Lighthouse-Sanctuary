import type { ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import Button from '@/components/ui/Button'
import Drawer from '@/components/ui/Drawer'

export function MobileNav({
  open,
  onOpenChange,
  title,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: ReactNode
}) {
  return (
    <>
      <div className="border-b border-brand-border bg-white px-4 py-3 md:hidden">
        <div className="flex items-center justify-between">
          <p className="font-semibold text-brand-charcoal">{title}</p>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(true)}>
            <Menu className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <Drawer open={open} onClose={() => onOpenChange(false)} title={title} side="left">
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {children}
        </div>
      </Drawer>
    </>
  )
}

export default MobileNav
