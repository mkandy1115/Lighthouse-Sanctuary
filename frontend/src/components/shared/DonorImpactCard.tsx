import { HeartHandshake } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'

export function DonorImpactCard({
  amount,
  outcome,
}: {
  amount: string
  outcome: string
}) {
  return (
    <Card className="border-brand-bronze/20 bg-brand-bronze-muted">
      <CardContent className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-brand-bronze">
          <HeartHandshake className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-bronze">Your impact</p>
          <p className="mt-1 font-serif text-2xl text-brand-charcoal">{amount}</p>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted">{outcome}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default DonorImpactCard
