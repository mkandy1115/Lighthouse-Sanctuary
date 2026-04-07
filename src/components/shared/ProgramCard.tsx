import type { LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export function ProgramCard({
  icon: Icon,
  title,
  description,
}: {
  icon: LucideIcon
  title: string
  description: string
}) {
  return (
    <Card className="group bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-card-md">
      <CardContent className="p-8">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal transition-colors group-hover:bg-brand-teal/20">
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-serif text-xl text-brand-charcoal">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-brand-muted">{description}</p>
      </CardContent>
    </Card>
  )
}

export default ProgramCard
