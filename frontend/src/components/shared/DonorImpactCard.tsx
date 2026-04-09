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
    <Card className="border-brand-bronze/20 dark:border-brand-bronze/40 bg-brand-bronze-muted dark:bg-slate-800">
      <CardContent className="flex gap-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white dark:bg-brand-bronze text-brand-bronze dark:text-white">
          <HeartHandshake className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-brand-bronze dark:text-brand-bronze-light">Your impact</p>
          <p className="mt-1 font-serif text-2xl text-brand-charcoal dark:text-white">{amount}</p>
          <p className="mt-2 text-sm leading-relaxed text-brand-muted dark:text-slate-300">{outcome}</p>
        </div>
      </CardContent>
    </Card>
  )
}

export default DonorImpactCard
