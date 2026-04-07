import {
  Activity,
  Calendar,
  ClipboardList,
  GraduationCap,
  HeartHandshake,
  Home,
  Shield,
  Stethoscope,
  Users,
} from 'lucide-react'
import { formatDate } from '@/lib/formatters'
import { cn } from '@/lib/utils'

const iconByType = {
  intake: Home,
  assessment: ClipboardList,
  counseling: HeartHandshake,
  medical: Stethoscope,
  education: GraduationCap,
  home_visit: Home,
  intervention: Shield,
  conference: Users,
  reintegration: Activity,
  aftercare: Calendar,
  note: ClipboardList,
} as const

export function Timeline({
  items,
}: {
  items: {
    id: string
    date: string
    title: string
    description: string
    staffName?: string
    type: keyof typeof iconByType
  }[]
}) {
  return (
    <div className="relative">
      <div className="absolute bottom-2 left-[11px] top-2 w-px bg-brand-border" />
      <ul className="space-y-5">
        {items.map((item) => {
          const Icon = iconByType[item.type] ?? ClipboardList
          return (
            <li key={item.id} className="relative flex gap-4">
              <div className="z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-brand-bronze/30 bg-white text-brand-bronze">
                <Icon className="h-3.5 w-3.5" />
              </div>
              <div className={cn('rounded-xl border border-brand-border bg-white p-4 shadow-card')}>
                <p className="text-xs text-brand-muted">{formatDate(item.date, 'long')}</p>
                <h3 className="mt-1 text-sm font-semibold text-brand-charcoal">{item.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-brand-muted">{item.description}</p>
                {item.staffName && <p className="mt-2 text-xs text-brand-muted">Handled by {item.staffName}</p>}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default Timeline
