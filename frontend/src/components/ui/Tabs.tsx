import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Tabs({
  tabs,
  value,
  onChange,
}: {
  tabs: { label: string; value: string }[]
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div className="inline-flex rounded-lg border border-brand-border bg-white p-1">
      {tabs.map((tab) => (
        <button
          key={tab.value}
          onClick={() => onChange(tab.value)}
          className={cn(
            'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            value === tab.value
              ? 'bg-brand-charcoal text-white'
              : 'text-brand-muted hover:text-brand-charcoal',
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export function TabPanel({
  children,
  active,
}: {
  children: ReactNode
  active: boolean
}) {
  if (!active) return null
  return <div>{children}</div>
}

export default Tabs
